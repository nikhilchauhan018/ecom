/**
 * MOCK BACKEND - stands in for the real API until `backend/` exists.
 *
 * It deliberately enforces the rules the real server MUST enforce, so the UI is
 * built against realistic behaviour:
 *   - every account call needs a live session (401 otherwise) with idle + absolute expiry
 *   - the session id is rotated on login (session-fixation protection)
 *   - OTP: 6 digits, 5 min expiry, 5 attempts then lockout, resend cooldown, hourly send cap,
 *     constant-time compare, identical responses for known and unknown phones
 *   - records are looked up only inside the caller's own data (a foreign id is a plain 404)
 *   - all input is re-validated and sanitised here, never trusted from the UI
 *   - sensitive actions (delete account) need a short-lived, single-use re-auth token
 *
 * LIMITATION: this runs in the browser, so none of it is real protection.
 * `localStorage` below only imitates the shared httpOnly cookie + database. In production the
 * session id lives in an httpOnly, Secure, SameSite cookie that JavaScript cannot read.
 */
import { SECURITY } from '../../config/security.js';
import { ApiError } from '../errors.js';
import { createSeed, SEED_SESSIONS } from './mockData.js';
import {
  isValidId,
  maskPhone,
  sanitizeMultiline,
  validateAddress,
  validatePhone,
  validateProfile,
} from '../../utils/validators.js';
import { randomToken, timingSafeEqual } from '../../utils/secure.js';
import { describeDevice } from '../../utils/format.js';
import { RETURN_REASONS, isReturnEligible } from '../../utils/orders.js';

const DB_KEY = 'mock_server_db_v1';
const DEMO_CODE = '123456';
const HOUR_MS = 60 * 60 * 1000;
const MAX_ADDRESSES = 10;
const NOTIFICATION_KEYS = ['orderUpdates', 'deliverySms', 'emailReceipts', 'promotions', 'restock'];
const LOCKED_NOTIFICATIONS = ['orderUpdates'];
const OTP_PURPOSES = ['login', 'reauth', 'change_phone'];

let latencyMs = 220;
let nowFn = () => Date.now();
const now = () => nowFn();
const delay = () => (latencyMs > 0 ? new Promise((resolve) => setTimeout(resolve, latencyMs)) : Promise.resolve());
const clone = (value) => structuredClone(value);
const own = (object, key) => Object.prototype.hasOwnProperty.call(object, key);

/** In-memory only: never persisted. */
let challenges = new Map();
let sends = new Map();
let reauthTokens = new Map();

/** Persisted (stand-in for the database + cookie jar). */
let S = freshState();

function freshState() {
  const seed = createSeed();
  return {
    users: {
      [seed.user.id]: {
        user: seed.user,
        addresses: seed.addresses,
        notifications: seed.notifications,
        orders: seed.orders,
        returns: seed.returns,
        otherSessions: SEED_SESSIONS(),
      },
    },
    phones: { [seed.user.phone]: seed.user.id },
    sessions: {},
    currentSid: null,
  };
}

function persist() {
  try {
    globalThis.localStorage?.setItem(DB_KEY, JSON.stringify(S));
  } catch {
    // storage unavailable or full: mock state stays in memory
  }
}

function sync() {
  try {
    const raw = globalThis.localStorage?.getItem(DB_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && parsed.users && parsed.phones && parsed.sessions) {
      S = parsed;
    }
  } catch {
    // corrupted mock state: ignore and keep the in-memory copy
  }
}

/** Test helper: wipes all state. */
export function __resetMockServer({ latency = 0, clock } = {}) {
  latencyMs = latency;
  nowFn = clock || (() => Date.now());
  challenges = new Map();
  sends = new Map();
  reauthTokens = new Map();
  S = freshState();
  try {
    globalThis.localStorage?.removeItem(DB_KEY);
  } catch {
    // ignore
  }
}

export const MOCK_DEMO_PHONE = '+15555550142';
export const MOCK_DEMO_CODE = DEMO_CODE;

function publicUser(bundle) {
  const { user } = bundle;
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phoneMasked: maskPhone(user.phone),
    phoneVerified: user.phoneVerified,
    createdAt: user.createdAt,
  };
}

function sessionExpiresAt(session) {
  return Math.min(session.lastSeen + SECURITY.SESSION_IDLE_MS, session.createdAt + SECURITY.SESSION_ABSOLUTE_MS);
}

function dropSession(sid) {
  delete S.sessions[sid];
  if (S.currentSid === sid) S.currentSid = null;
}

/** Resolves the caller's live session or throws 401. Touches the idle timer. */
function requireSession() {
  sync();
  const sid = S.currentSid;
  const session = sid && own(S.sessions, sid) ? S.sessions[sid] : null;
  if (!session) throw new ApiError(401, 'unauthenticated');

  const t = now();
  if (t >= sessionExpiresAt(session)) {
    dropSession(sid);
    persist();
    throw new ApiError(401, 'session_expired');
  }

  const bundle = own(S.users, session.userId) ? S.users[session.userId] : null;
  if (!bundle) {
    dropSession(sid);
    persist();
    throw new ApiError(401, 'unauthenticated');
  }

  session.lastSeen = t;
  persist();
  return { session, bundle };
}

function findOwned(list, id) {
  if (!isValidId(id)) return null;
  return list.find((item) => item.id === id) || null;
}

// ---------------------------------------------------------------- OTP / auth

function otpTarget(purpose, phone, bundle) {
  return purpose === 'reauth' ? bundle.user.phone : phone;
}

function rateLimited(retryAfterSec) {
  return new ApiError(429, 'rate_limited', { meta: { retryAfterSec: Math.max(1, Math.ceil(retryAfterSec)) } });
}

export async function requestOtp({ phone, purpose = 'login' } = {}) {
  await delay();
  if (!OTP_PURPOSES.includes(purpose)) throw new ApiError(400, 'bad_request');

  let bundle = null;
  if (purpose !== 'login') bundle = requireSession().bundle;

  const checked = validatePhone(phone);
  if (purpose !== 'reauth' && !checked.valid) {
    throw new ApiError(422, 'invalid_phone', { fieldErrors: { phone: checked.error } });
  }

  const target = otpTarget(purpose, checked.value, bundle);
  const key = `${purpose}:${target}`;
  const t = now();

  const existing = challenges.get(key);
  if (existing && existing.lockedUntil > t) {
    throw rateLimited((existing.lockedUntil - t) / 1000);
  }

  const history = (sends.get(target) || []).filter((time) => t - time < HOUR_MS);
  const last = history[history.length - 1];
  if (last && t - last < SECURITY.OTP_RESEND_COOLDOWN_SEC * 1000) {
    throw rateLimited((SECURITY.OTP_RESEND_COOLDOWN_SEC * 1000 - (t - last)) / 1000);
  }
  if (history.length >= SECURITY.OTP_MAX_SENDS_PER_HOUR) {
    throw rateLimited((history[0] + HOUR_MS - t) / 1000);
  }
  history.push(t);
  sends.set(target, history);

  challenges.set(key, {
    code: DEMO_CODE,
    expiresAt: t + SECURITY.OTP_TTL_MS,
    attempts: 0,
    lockedUntil: existing?.lockedUntil || 0,
  });

  // Same response whether or not the phone has an account (no user enumeration).
  return {
    sent: true,
    maskedPhone: maskPhone(target),
    resendInSec: SECURITY.OTP_RESEND_COOLDOWN_SEC,
    expiresInSec: SECURITY.OTP_TTL_MS / 1000,
    // A real server never returns the code. Demo convenience while there is no SMS provider.
    demoCode: DEMO_CODE,
  };
}

export async function verifyOtp({ phone, code, purpose = 'login' } = {}) {
  await delay();
  if (!OTP_PURPOSES.includes(purpose)) throw new ApiError(400, 'bad_request');

  let bundle = null;
  let session = null;
  if (purpose !== 'login') ({ bundle, session } = requireSession());

  const checked = validatePhone(phone);
  if (purpose !== 'reauth' && !checked.valid) {
    throw new ApiError(422, 'invalid_phone', { fieldErrors: { phone: checked.error } });
  }

  const target = otpTarget(purpose, checked.value, bundle);
  const key = `${purpose}:${target}`;
  const t = now();
  const challenge = challenges.get(key);

  if (challenge && challenge.lockedUntil > t) {
    throw rateLimited((challenge.lockedUntil - t) / 1000);
  }
  if (!challenge) throw new ApiError(400, 'otp_invalid');
  if (challenge.expiresAt < t) {
    challenges.delete(key);
    throw new ApiError(400, 'otp_expired');
  }

  challenge.attempts += 1;
  const submitted = typeof code === 'string' ? code : '';
  const wellFormed = new RegExp(`^\\d{${SECURITY.OTP_LENGTH}}$`).test(submitted);
  const matches = timingSafeEqual(submitted, challenge.code) && wellFormed;

  if (!matches) {
    if (challenge.attempts >= SECURITY.OTP_MAX_ATTEMPTS) {
      challenge.lockedUntil = t + SECURITY.OTP_LOCKOUT_MS;
      throw rateLimited(SECURITY.OTP_LOCKOUT_MS / 1000);
    }
    throw new ApiError(400, 'otp_invalid', {
      meta: { attemptsLeft: SECURITY.OTP_MAX_ATTEMPTS - challenge.attempts },
    });
  }

  challenges.delete(key);

  if (purpose === 'reauth') {
    const token = randomToken(24);
    reauthTokens.set(token, { userId: bundle.user.id, expiresAt: t + SECURITY.REAUTH_TTL_MS });
    return { reauthToken: token, expiresInSec: SECURITY.REAUTH_TTL_MS / 1000 };
  }

  if (purpose === 'change_phone') {
    const owner = own(S.phones, target) ? S.phones[target] : null;
    if (owner && owner !== bundle.user.id) throw new ApiError(409, 'phone_unavailable');
    delete S.phones[bundle.user.phone];
    bundle.user.phone = target;
    bundle.user.phoneVerified = true;
    S.phones[target] = bundle.user.id;
    persist();
    return { user: publicUser(bundle), expiresAt: sessionExpiresAt(session) };
  }

  // login: find or create the account, then issue a NEW session id.
  let userId = own(S.phones, target) ? S.phones[target] : null;
  if (!userId) {
    userId = `u_${randomToken(6)}`;
    S.users[userId] = {
      user: { id: userId, name: '', email: '', phone: target, phoneVerified: true, createdAt: new Date(t).toISOString() },
      addresses: [],
      notifications: { orderUpdates: true, deliverySms: true, emailReceipts: true, promotions: false, restock: false },
      orders: [],
      returns: [],
      otherSessions: [],
    };
    S.phones[target] = userId;
  }

  if (S.currentSid) dropSession(S.currentSid);
  const sid = randomToken(24);
  S.sessions[sid] = {
    id: sid,
    userId,
    createdAt: t,
    lastSeen: t,
    device: describeDevice(globalThis.navigator?.userAgent),
  };
  S.currentSid = sid;
  persist();
  return { user: publicUser(S.users[userId]), expiresAt: sessionExpiresAt(S.sessions[sid]) };
}

/** Never throws for anonymous visitors: returns `{ authenticated: false }`. */
export async function getSession() {
  await delay();
  try {
    const { bundle, session } = requireSession();
    return { authenticated: true, user: publicUser(bundle), expiresAt: sessionExpiresAt(session) };
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      return { authenticated: false, reason: error.code };
    }
    throw error;
  }
}

/** Heartbeat so user activity extends the idle window. */
export async function keepAlive() {
  await delay();
  const { session } = requireSession();
  return { expiresAt: sessionExpiresAt(session) };
}

export async function logout() {
  await delay();
  sync();
  if (S.currentSid) dropSession(S.currentSid);
  persist();
  return { ok: true };
}

export async function logoutAll() {
  await delay();
  const { bundle } = requireSession();
  Object.keys(S.sessions).forEach((sid) => {
    if (S.sessions[sid].userId === bundle.user.id) delete S.sessions[sid];
  });
  bundle.otherSessions = [];
  S.currentSid = null;
  persist();
  return { ok: true };
}

export async function listSessions() {
  await delay();
  const { bundle, session } = requireSession();
  const current = {
    id: session.id.slice(0, 8),
    device: session.device,
    createdAt: new Date(session.createdAt).toISOString(),
    lastSeen: new Date(session.lastSeen).toISOString(),
    location: '',
    current: true,
  };
  return [current, ...clone(bundle.otherSessions).map((item) => ({ ...item, current: false }))];
}

export async function revokeSession(sessionId) {
  await delay();
  const { bundle } = requireSession();
  const found = findOwned(bundle.otherSessions, sessionId);
  if (!found) throw new ApiError(404, 'not_found');
  bundle.otherSessions = bundle.otherSessions.filter((item) => item.id !== sessionId);
  persist();
  return { ok: true };
}

export async function deleteAccount({ reauthToken, confirmation } = {}) {
  await delay();
  const { bundle } = requireSession();

  if (confirmation !== SECURITY.DELETE_CONFIRM_WORD) {
    throw new ApiError(422, 'confirmation_mismatch');
  }

  const grant = typeof reauthToken === 'string' ? reauthTokens.get(reauthToken) : null;
  if (typeof reauthToken === 'string') reauthTokens.delete(reauthToken); // single use
  if (!grant || grant.userId !== bundle.user.id || grant.expiresAt < now()) {
    throw new ApiError(403, 'reauth_required');
  }

  const userId = bundle.user.id;
  delete S.users[userId];
  delete S.phones[bundle.user.phone];
  Object.keys(S.sessions).forEach((sid) => {
    if (S.sessions[sid].userId === userId) delete S.sessions[sid];
  });
  S.currentSid = null;
  persist();
  return { ok: true };
}

// ------------------------------------------------------------------- profile

export async function getProfile() {
  await delay();
  return publicUser(requireSession().bundle);
}

export async function updateProfile(input) {
  await delay();
  const { bundle } = requireSession();
  const result = validateProfile(input);
  if (!result.valid) throw new ApiError(422, 'validation_failed', { fieldErrors: result.errors });
  bundle.user.name = result.values.name;
  bundle.user.email = result.values.email;
  persist();
  return publicUser(bundle);
}

// ----------------------------------------------------------------- addresses

export async function listAddresses() {
  await delay();
  return clone(requireSession().bundle.addresses);
}

export async function saveAddress(input, id) {
  await delay();
  const { bundle } = requireSession();
  const result = validateAddress(input);
  if (!result.valid) throw new ApiError(422, 'validation_failed', { fieldErrors: result.errors });

  const list = bundle.addresses;
  const values = { ...result.values };
  const existing = id ? findOwned(list, id) : null;
  if (id && !existing) throw new ApiError(404, 'not_found');
  if (!existing && list.length >= MAX_ADDRESSES) throw new ApiError(409, 'address_limit');

  if (existing) {
    Object.assign(existing, values, { isDefault: existing.isDefault || values.isDefault });
  } else {
    list.push({ id: `a_${randomToken(5)}`, ...values, isDefault: values.isDefault || list.length === 0 });
  }

  const saved = existing || list[list.length - 1];
  if (saved.isDefault) list.forEach((item) => { item.isDefault = item.id === saved.id; });
  persist();
  return clone(saved);
}

export async function deleteAddress(id) {
  await delay();
  const { bundle } = requireSession();
  const found = findOwned(bundle.addresses, id);
  if (!found) throw new ApiError(404, 'not_found');
  bundle.addresses = bundle.addresses.filter((item) => item.id !== id);
  if (found.isDefault && bundle.addresses[0]) bundle.addresses[0].isDefault = true;
  persist();
  return clone(bundle.addresses);
}

export async function setDefaultAddress(id) {
  await delay();
  const { bundle } = requireSession();
  const found = findOwned(bundle.addresses, id);
  if (!found) throw new ApiError(404, 'not_found');
  bundle.addresses.forEach((item) => { item.isDefault = item.id === id; });
  persist();
  return clone(bundle.addresses);
}


// ------------------------------------------------------------- notifications

export async function getNotificationPrefs() {
  await delay();
  return clone(requireSession().bundle.notifications);
}

export async function updateNotificationPrefs(patch = {}) {
  await delay();
  const { bundle } = requireSession();
  const next = { ...bundle.notifications };

  for (const [key, value] of Object.entries(patch)) {
    if (!NOTIFICATION_KEYS.includes(key) || typeof value !== 'boolean') {
      throw new ApiError(422, 'validation_failed', { fieldErrors: { [key]: 'invalid' } });
    }
    if (LOCKED_NOTIFICATIONS.includes(key) && value === false) {
      throw new ApiError(422, 'notification_locked', { fieldErrors: { [key]: 'locked' } });
    }
    next[key] = value;
  }

  bundle.notifications = next;
  persist();
  return clone(next);
}

// -------------------------------------------------------------------- orders

export async function listOrders() {
  await delay();
  const { bundle } = requireSession();
  return clone([...bundle.orders].sort((a, b) => new Date(b.placedAt) - new Date(a.placedAt)));
}

export async function getOrder(id) {
  await delay();
  const { bundle } = requireSession();
  const order = findOwned(bundle.orders, id);
  if (!order) throw new ApiError(404, 'not_found');
  return clone(order);
}

export async function listReturns() {
  await delay();
  return clone([...requireSession().bundle.returns].reverse());
}

export async function createReturn({ orderId, items, reason, comment } = {}) {
  await delay();
  const { bundle } = requireSession();
  const order = findOwned(bundle.orders, orderId);
  if (!order) throw new ApiError(404, 'not_found');
  if (!isReturnEligible(order, bundle.returns, now())) throw new ApiError(409, 'not_returnable');
  if (!RETURN_REASONS.includes(reason)) {
    throw new ApiError(422, 'validation_failed', { fieldErrors: { reason: 'required' } });
  }

  const picked = [];
  const seen = new Set();
  for (const entry of Array.isArray(items) ? items : []) {
    const line = order.items.find((item) => item.id === entry?.itemId);
    const qty = Number(entry?.qty);
    if (!line || seen.has(line.id) || !Number.isInteger(qty) || qty < 1 || qty > line.qty) {
      throw new ApiError(422, 'validation_failed', { fieldErrors: { items: 'invalid' } });
    }
    seen.add(line.id);
    picked.push({ itemId: line.id, name: line.name, qty, price: line.price });
  }
  if (picked.length === 0) {
    throw new ApiError(422, 'validation_failed', { fieldErrors: { items: 'required' } });
  }

  const request = {
    id: `r_${randomToken(5)}`,
    orderId: order.id,
    status: 'requested',
    createdAt: new Date(now()).toISOString(),
    items: picked,
    reason,
    comment: sanitizeMultiline(comment),
    refundAmount: picked.reduce((sum, item) => sum + item.price * item.qty, 0),
  };
  bundle.returns.push(request);
  persist();
  return clone(request);
}

/** Overview for the Account hub: profile + the most recent in-flight order. */
export async function getOverview() {
  await delay();
  const { bundle } = requireSession();
  const active = [...bundle.orders]
    .filter((order) => ['placed', 'packed', 'shipped', 'out_for_delivery'].includes(order.status))
    .sort((a, b) => new Date(b.placedAt) - new Date(a.placedAt))[0];
  return { profile: publicUser(bundle), activeOrder: active ? clone(active) : null };
}
