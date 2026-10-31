import { AUTH_CHANNEL } from '../config/security';
import { getSession, logout as apiLogout } from '../services/auth';

/**
 * Client auth state. Holds ONLY non-sensitive display data (masked phone, name).
 * There is no token here: the session is a server-side concept (httpOnly cookie in production).
 */
const SERVER_SNAPSHOT = Object.freeze({ status: 'loading', user: null, expiresAt: null, reason: null });

let state = SERVER_SNAPSHOT;
const listeners = new Set();
let started = false;
let channel = null;

function setState(next) {
  state = { ...state, ...next };
  listeners.forEach((listener) => listener());
}

function broadcast() {
  try {
    channel?.postMessage({ type: 'auth-changed' });
  } catch {
    // channel closed: other tabs will resync on their next request
  }
}

async function refresh() {
  try {
    const session = await getSession();
    if (session.authenticated) {
      setState({ status: 'authenticated', user: session.user, expiresAt: session.expiresAt, reason: null });
    } else {
      setState({ status: 'anonymous', user: null, expiresAt: null, reason: state.reason || session.reason || null });
    }
  } catch {
    setState({ status: 'anonymous', user: null, expiresAt: null, reason: 'error' });
  }
}

function start() {
  if (started || typeof window === 'undefined') return;
  started = true;
  if ('BroadcastChannel' in globalThis) {
    channel = new BroadcastChannel(AUTH_CHANNEL);
    channel.onmessage = (event) => {
      if (event.data?.type === 'auth-changed') refresh();
    };
  }
  refresh();
}

export const authStore = {
  subscribe(listener) {
    start();
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  getSnapshot() {
    return state;
  },

  getServerSnapshot() {
    return SERVER_SNAPSHOT;
  },

  refresh,

  /** Call after a successful OTP login. */
  signedIn(user, expiresAt) {
    setState({ status: 'authenticated', user, expiresAt, reason: null });
    broadcast();
  },

  /** Forget why the user was signed out once the message has been shown. */
  clearReason() {
    if (state.reason !== null) setState({ reason: null });
  },

  updateUser(user) {
    setState({ user });
  },

  setExpiry(expiresAt) {
    setState({ expiresAt });
  },

  /** User-initiated or idle sign-out: ends the server session first. */
  async signOut(reason = 'logout') {
    try {
      await apiLogout();
    } catch {
      // still clear local state: the server session expires on its own
    }
    setState({ status: 'anonymous', user: null, expiresAt: null, reason });
    broadcast();
  },

  /** The server already ended the session (401): just clear local state. */
  expire(reason = 'session_expired') {
    if (state.status === 'anonymous') return;
    setState({ status: 'anonymous', user: null, expiresAt: null, reason });
    broadcast();
  },
};
