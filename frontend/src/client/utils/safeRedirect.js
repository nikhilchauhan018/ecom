/**
 * Validates a post-login redirect target to prevent open redirects.
 * Only same-origin, path-absolute URLs are accepted; anything else returns `fallback`.
 * @param {unknown} next
 * @param {string} [fallback]
 * @returns {string}
 */
export function safeRedirectPath(next, fallback = '/account') {
  if (typeof next !== 'string' || next.length > 2000) return fallback;
  if (!next.startsWith('/') || next.startsWith('//') || next.includes('\\')) return fallback;
  if (/\p{Cc}/u.test(next)) return fallback;

  try {
    const url = new URL(next, 'http://localhost');
    if (url.origin !== 'http://localhost') return fallback;
    if (url.pathname === '/login') return fallback;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return fallback;
  }
}
