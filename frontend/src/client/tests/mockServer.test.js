import { beforeEach, describe, it } from 'node:test';
import assert from 'node:assert';
import { SECURITY } from '../config/security.js';
import { ApiError } from '../services/errors.js';
import * as api from '../services/mock/mockServer.js';

const { MOCK_DEMO_CODE: CODE, MOCK_DEMO_PHONE: PHONE } = api;
const SECOND = 1000;

let now;
const advance = (ms) => {
  now += ms;
};

async function rejects(promise, status, code) {
  await assert.rejects(promise, (error) => {
    assert.ok(error instanceof ApiError, 'expected an ApiError');
    assert.strictEqual(error.status, status);
    if (code) assert.strictEqual(error.code, code);
    return true;
  });
}

async function signIn() {
  await api.requestOtp({ phone: PHONE });
  return api.verifyOtp({ phone: PHONE, code: CODE });
}

/** Gets past the per-number resend cooldown. */
const passCooldown = () => advance((SECURITY.OTP_RESEND_COOLDOWN_SEC + 1) * SECOND);

beforeEach(() => {
  now = Date.now();
  api.__resetMockServer({ latency: 0, clock: () => now });
});

describe('authentication', () => {
  it('rejects every account call without a session', async () => {
    await rejects(api.getProfile(), 401, 'unauthenticated');
    await rejects(api.listOrders(), 401);
    await rejects(api.listAddresses(), 401);
    await rejects(api.getNotificationPrefs(), 401);
    await rejects(api.deleteAccount({}), 401);
  });

  it('reports anonymous visitors without throwing', async () => {
    assert.strictEqual((await api.getSession()).authenticated, false);
  });

  it('signs in with the right code and only exposes a masked phone', async () => {
    const { user } = await signIn();
    assert.strictEqual(user.phoneMasked.includes(PHONE.slice(-4)), true);
    assert.ok(!JSON.stringify(user).includes(PHONE), 'full phone must not be returned');
    const session = await api.getSession();
    assert.strictEqual(session.authenticated, true);
  });

  it('validates the phone number', async () => {
    await rejects(api.requestOtp({ phone: 'abc' }), 422, 'invalid_phone');
    await rejects(api.requestOtp({ phone: '' }), 422, 'invalid_phone');
  });

  it('answers identically for known and unknown numbers (no enumeration)', async () => {
    const known = await api.requestOtp({ phone: PHONE });
    const unknown = await api.requestOtp({ phone: '+447700900123' });
    assert.deepStrictEqual(Object.keys(known).sort(), Object.keys(unknown).sort());
    assert.strictEqual(known.sent, unknown.sent);
  });

  it('creates an account for a new number on first verification', async () => {
    await api.requestOtp({ phone: '+447700900123' });
    const { user } = await api.verifyOtp({ phone: '+447700900123', code: CODE });
    assert.strictEqual(user.name, '');
    assert.deepStrictEqual(await api.listOrders(), []);
  });

  it('ends the session on logout', async () => {
    await signIn();
    await api.logout();
    await rejects(api.getProfile(), 401);
  });
});

describe('one-time code protections', () => {
  it('counts down attempts then locks out, even for the right code', async () => {
    await api.requestOtp({ phone: PHONE });

    for (let left = SECURITY.OTP_MAX_ATTEMPTS - 1; left >= 1; left -= 1) {
      await assert.rejects(api.verifyOtp({ phone: PHONE, code: '000000' }), (error) => {
        assert.strictEqual(error.code, 'otp_invalid');
        assert.strictEqual(error.meta.attemptsLeft, left);
        return true;
      });
    }

    await rejects(api.verifyOtp({ phone: PHONE, code: '000000' }), 429, 'rate_limited');
    await rejects(api.verifyOtp({ phone: PHONE, code: CODE }), 429, 'rate_limited');
    await rejects(api.getProfile(), 401);
  });

  it('lockout ends after the lockout window', async () => {
    await api.requestOtp({ phone: PHONE });
    for (let i = 0; i < SECURITY.OTP_MAX_ATTEMPTS; i += 1) {
      await api.verifyOtp({ phone: PHONE, code: '111111' }).catch(() => {});
    }
    advance(SECURITY.OTP_LOCKOUT_MS + SECOND);
    await api.requestOtp({ phone: PHONE });
    const { user } = await api.verifyOtp({ phone: PHONE, code: CODE });
    assert.ok(user.id);
  });

  it('expires codes', async () => {
    await api.requestOtp({ phone: PHONE });
    advance(SECURITY.OTP_TTL_MS + SECOND);
    await rejects(api.verifyOtp({ phone: PHONE, code: CODE }), 400, 'otp_expired');
  });

  it('makes a code single-use', async () => {
    await signIn();
    await api.logout();
    await rejects(api.verifyOtp({ phone: PHONE, code: CODE }), 400, 'otp_invalid');
  });

  it('rejects malformed codes and verification without a request', async () => {
    await rejects(api.verifyOtp({ phone: PHONE, code: CODE }), 400, 'otp_invalid');
    await api.requestOtp({ phone: PHONE });
    await rejects(api.verifyOtp({ phone: PHONE, code: 'abcdef' }), 400, 'otp_invalid');
    await rejects(api.verifyOtp({ phone: PHONE, code: undefined }), 400, 'otp_invalid');
  });

  it('enforces a resend cooldown and an hourly cap', async () => {
    await api.requestOtp({ phone: PHONE });
    await rejects(api.requestOtp({ phone: PHONE }), 429, 'rate_limited');

    for (let i = 1; i < SECURITY.OTP_MAX_SENDS_PER_HOUR; i += 1) {
      passCooldown();
      await api.requestOtp({ phone: PHONE });
    }
    passCooldown();
    await rejects(api.requestOtp({ phone: PHONE }), 429, 'rate_limited');

    advance(60 * 60 * SECOND);
    await api.requestOtp({ phone: PHONE });
  });
});

describe('sessions', () => {
  it('expires after the idle window', async () => {
    await signIn();
    advance(SECURITY.SESSION_IDLE_MS + SECOND);
    await rejects(api.getProfile(), 401, 'session_expired');
    await rejects(api.getProfile(), 401, 'unauthenticated');
  });

  it('activity keeps the session alive, but not past the absolute limit', async () => {
    await signIn();
    const step = SECURITY.SESSION_IDLE_MS - SECOND;
    let elapsed = 0;
    while (elapsed + step < SECURITY.SESSION_ABSOLUTE_MS) {
      advance(step);
      elapsed += step;
      await api.keepAlive();
    }
    advance(step);
    await rejects(api.keepAlive(), 401, 'session_expired');
  });

  it('rotates the session id on every login', async () => {
    await signIn();
    const first = (await api.listSessions()).find((item) => item.current).id;
    passCooldown();
    await signIn();
    const second = (await api.listSessions()).find((item) => item.current).id;
    assert.notStrictEqual(first, second);
  });

  it('can sign out other devices and everywhere', async () => {
    await signIn();
    const before = await api.listSessions();
    assert.ok(before.length >= 2);

    const other = before.find((item) => !item.current);
    await api.revokeSession(other.id);
    assert.strictEqual((await api.listSessions()).some((item) => item.id === other.id), false);
    await rejects(api.revokeSession(other.id), 404, 'not_found');

    await api.logoutAll();
    await rejects(api.getProfile(), 401);
  });
});

describe('data isolation and validation', () => {
  beforeEach(signIn);

  it('returns 404 for unknown or malicious order ids', async () => {
    await rejects(api.getOrder('does_not_exist'), 404, 'not_found');
    await rejects(api.getOrder('../../etc/passwd'), 404, 'not_found');
    await rejects(api.getOrder(''), 404, 'not_found');
    await rejects(api.getOrder({ $ne: null }), 404, 'not_found');
    assert.strictEqual((await api.getOrder('1042')).id, '1042');
  });

  it('does not let one customer see another customer\'s records', async () => {
    await api.logout();
    await api.requestOtp({ phone: '+447700900123' });
    await api.verifyOtp({ phone: '+447700900123', code: CODE });
    await rejects(api.getOrder('1042'), 404, 'not_found');
    assert.deepStrictEqual(await api.listAddresses(), []);
  });

  it('validates and sanitises profile updates', async () => {
    await assert.rejects(api.updateProfile({ name: '<b>x</b>', email: 'bad' }), (error) => {
      assert.strictEqual(error.status, 422);
      assert.deepStrictEqual(Object.keys(error.fieldErrors).sort(), ['email', 'name']);
      return true;
    });
    const updated = await api.updateProfile({ name: '  Sam   Lee ', email: 'SAM@Example.com' });
    assert.strictEqual(updated.name, 'Sam Lee');
    assert.strictEqual(updated.email, 'sam@example.com');
    assert.ok(!('phone' in updated));
  });

  it('validates addresses and keeps exactly one default', async () => {
    await rejects(api.saveAddress({ fullName: '' }), 422, 'validation_failed');

    const input = {
      label: 'other', fullName: 'Sam Lee', phone: '+15555550199', line1: '5 Pine Road',
      city: 'Oakland', state: 'CA', postalCode: '94607', country: 'US', isDefault: true,
    };
    const saved = await api.saveAddress(input);
    const list = await api.listAddresses();
    assert.strictEqual(list.filter((item) => item.isDefault).length, 1);
    assert.strictEqual(list.find((item) => item.isDefault).id, saved.id);

    const remaining = await api.deleteAddress(saved.id);
    assert.strictEqual(remaining.filter((item) => item.isDefault).length, 1);
    await rejects(api.deleteAddress(saved.id), 404, 'not_found');
    await rejects(api.setDefaultAddress('nope'), 404, 'not_found');
  });

  it('caps the number of saved addresses', async () => {
    const base = { label: 'home', fullName: 'Sam Lee', phone: '+15555550199', line1: '5 Pine Road', city: 'Oakland', state: 'CA', postalCode: '94607', country: 'US' };
    const existing = (await api.listAddresses()).length;
    for (let i = existing; i < 10; i += 1) await api.saveAddress(base);
    await rejects(api.saveAddress(base), 409, 'address_limit');
  });

  it('keeps required notifications on and rejects unknown keys', async () => {
    await rejects(api.updateNotificationPrefs({ orderUpdates: false }), 422, 'notification_locked');
    await rejects(api.updateNotificationPrefs({ isAdmin: true }), 422, 'validation_failed');
    await rejects(api.updateNotificationPrefs({ promotions: 'yes' }), 422, 'validation_failed');
    const next = await api.updateNotificationPrefs({ promotions: true });
    assert.strictEqual(next.promotions, true);
    assert.strictEqual(next.orderUpdates, true);
  });
});

describe('returns', () => {
  beforeEach(signIn);

  it('creates a return for an eligible order, once', async () => {
    const request = await api.createReturn({
      orderId: '1038',
      reason: 'wrong_size',
      comment: '  too   small\u0000 ',
      items: [{ itemId: 'i_3', qty: 1 }],
    });
    assert.strictEqual(request.status, 'requested');
    assert.strictEqual(request.refundAmount, 58);
    assert.strictEqual(request.comment, 'too small');
    assert.strictEqual((await api.listReturns()).length, 1);

    await rejects(
      api.createReturn({ orderId: '1038', reason: 'defective', items: [{ itemId: 'i_4', qty: 1 }] }),
      409,
      'not_returnable'
    );
  });

  it('rejects orders outside the window, undelivered, or unknown', async () => {
    const item = [{ itemId: 'i_5', qty: 1 }];
    await rejects(api.createReturn({ orderId: '1021', reason: 'defective', items: item }), 409, 'not_returnable');
    await rejects(api.createReturn({ orderId: '1042', reason: 'defective', items: [{ itemId: 'i_1', qty: 1 }] }), 409, 'not_returnable');
    await rejects(api.createReturn({ orderId: 'zzz', reason: 'defective', items: item }), 404, 'not_found');
  });

  it('validates reason and items', async () => {
    const ok = [{ itemId: 'i_3', qty: 1 }];
    await rejects(api.createReturn({ orderId: '1038', reason: 'because', items: ok }), 422, 'validation_failed');
    await rejects(api.createReturn({ orderId: '1038', reason: 'defective', items: [] }), 422, 'validation_failed');
    await rejects(api.createReturn({ orderId: '1038', reason: 'defective', items: [{ itemId: 'i_4', qty: 3 }] }), 422, 'validation_failed');
    await rejects(api.createReturn({ orderId: '1038', reason: 'defective', items: [{ itemId: 'i_4', qty: 0 }] }), 422, 'validation_failed');
    await rejects(api.createReturn({ orderId: '1038', reason: 'defective', items: [{ itemId: 'i_4', qty: 1.5 }] }), 422, 'validation_failed');
    await rejects(api.createReturn({ orderId: '1038', reason: 'defective', items: [{ itemId: 'i_5', qty: 1 }] }), 422, 'validation_failed');
    await rejects(
      api.createReturn({ orderId: '1038', reason: 'defective', items: [{ itemId: 'i_3', qty: 1 }, { itemId: 'i_3', qty: 1 }] }),
      422,
      'validation_failed'
    );
  });
});

describe('account deletion (step-up re-authentication)', () => {
  beforeEach(signIn);

  async function reauthToken() {
    passCooldown();
    await api.requestOtp({ purpose: 'reauth' });
    return (await api.verifyOtp({ purpose: 'reauth', code: CODE })).reauthToken;
  }

  it('needs the confirmation word', async () => {
    const token = await reauthToken();
    await rejects(api.deleteAccount({ reauthToken: token, confirmation: 'delete' }), 422, 'confirmation_mismatch');
    await rejects(api.deleteAccount({ reauthToken: token }), 422, 'confirmation_mismatch');
  });

  it('refuses without a valid re-auth token', async () => {
    await rejects(api.deleteAccount({ confirmation: 'DELETE' }), 403, 'reauth_required');
    await rejects(api.deleteAccount({ reauthToken: 'forged', confirmation: 'DELETE' }), 403, 'reauth_required');
    await rejects(api.deleteAccount({ reauthToken: { a: 1 }, confirmation: 'DELETE' }), 403, 'reauth_required');
    assert.strictEqual((await api.getSession()).authenticated, true);
  });

  it('refuses an expired token', async () => {
    const token = await reauthToken();
    advance(SECURITY.REAUTH_TTL_MS + SECOND);
    await rejects(api.deleteAccount({ reauthToken: token, confirmation: 'DELETE' }), 403, 'reauth_required');
  });

  it('deletes the account and ends every session', async () => {
    const token = await reauthToken();
    await api.deleteAccount({ reauthToken: token, confirmation: 'DELETE' });
    await rejects(api.getProfile(), 401);

    passCooldown();
    await api.requestOtp({ phone: PHONE });
    const { user } = await api.verifyOtp({ phone: PHONE, code: CODE });
    assert.strictEqual(user.name, '', 'signing in again creates a fresh, empty account');
    assert.deepStrictEqual(await api.listOrders(), []);
  });
});

describe('phone change', () => {
  beforeEach(signIn);

  it('requires proving the new number and updates the masked display', async () => {
    const next = '+447700900123';
    await api.requestOtp({ phone: next, purpose: 'change_phone' });
    await rejects(api.verifyOtp({ phone: next, code: '000000', purpose: 'change_phone' }), 400, 'otp_invalid');
    const { user } = await api.verifyOtp({ phone: next, code: CODE, purpose: 'change_phone' });
    assert.ok(user.phoneMasked.endsWith('0123'));
    assert.ok((await api.getProfile()).phoneMasked.endsWith('0123'));
  });

  it('is unavailable to anonymous callers', async () => {
    await api.logout();
    await rejects(api.requestOtp({ phone: '+447700900123', purpose: 'change_phone' }), 401);
  });
});
