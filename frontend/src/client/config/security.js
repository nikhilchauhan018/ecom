/** Security tunables shared by the UI and the mock server. The real server owns the truth. */
export const SECURITY = Object.freeze({
  OTP_LENGTH: 6,
  OTP_TTL_MS: 5 * 60 * 1000,
  OTP_MAX_ATTEMPTS: 5,
  OTP_LOCKOUT_MS: 15 * 60 * 1000,
  OTP_RESEND_COOLDOWN_SEC: 30,
  OTP_MAX_SENDS_PER_HOUR: 5,
  SESSION_IDLE_MS: 30 * 60 * 1000,
  SESSION_ABSOLUTE_MS: 12 * 60 * 60 * 1000,
  IDLE_WARNING_MS: 60 * 1000,
  REAUTH_TTL_MS: 5 * 60 * 1000,
  DELETE_CONFIRM_WORD: 'DELETE',
});

/** BroadcastChannel used to sync login/logout across tabs. Carries events only, never data. */
export const AUTH_CHANNEL = 'client_auth';
