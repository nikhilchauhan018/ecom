/**
 * Visitor country from their IP address, as an ISO 3166-1 alpha-2 code, or null when unknown.
 *
 * The browser cannot learn this reliably on its own. The real backend should expose it, e.g.
 * `GET /geo` returning `{ country: 'IN' }` taken from a CDN/proxy header (Cloudflare `CF-IPCountry`,
 * CloudFront `CloudFront-Viewer-Country`) or a GeoIP database. Do NOT call a third-party IP API from
 * the browser: it leaks the visitor's IP and adds a failure point.
 *
 * Mock: returns null, so the phone field falls back to time zone / language detection.
 * @returns {Promise<string|null>}
 */
export async function getCountryHint() {
  return null;
}
