/**
 * Turns service errors into user-facing text. Pure: pass the `t` from useT().
 * Never shows raw server messages, stack traces or internal codes to the user.
 */

export function formatWait(t, seconds) {
  const total = Math.max(1, Math.ceil(Number(seconds) || 1));
  return total < 60
    ? t('errors.waitSeconds', { count: total })
    : t('errors.waitMinutes', { count: Math.ceil(total / 60) });
}

/** @param {(path: string, params?: object) => string} t */
export function getErrorMessage(t, error) {
  const code = error && typeof error === 'object' ? error.code : null;

  if (!code) return t('errors.generic');

  if (code === 'rate_limited') {
    return t('errors.rate_limited', { wait: formatWait(t, error.meta?.retryAfterSec) });
  }
  if (code === 'otp_invalid' && Number.isInteger(error.meta?.attemptsLeft)) {
    return t('errors.otp_invalid_left', { attemptsLeft: error.meta.attemptsLeft });
  }

  const key = `errors.${code}`;
  const message = t(key);
  return message === key ? t('errors.generic') : message;
}

/**
 * Maps `{ field: 'required' }` codes to localized messages.
 * @returns {Record<string, string>}
 */
export function translateFieldErrors(t, codes) {
  const result = {};
  for (const [field, code] of Object.entries(codes || {})) {
    const key = `validation.${code}`;
    const message = t(key);
    result[field] = message === key ? t('validation.invalid') : message;
  }
  return result;
}

/** True when the error means "not signed in / session ended". */
export function isAuthError(error) {
  return Boolean(error) && (error.status === 401 || error.code === 'unauthenticated' || error.code === 'session_expired');
}
