// Only allow http(s) URLs in href attributes. Blocks javascript:, data:, vbscript: etc.
export function safeHttpUrl(value, fallback = '#') {
  try {
    const url = new URL(String(value ?? ''));
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : fallback;
  } catch {
    return fallback;
  }
}
