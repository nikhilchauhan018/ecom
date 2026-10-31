import { COUNTRIES } from '../config/countries.js';

/** Date / device formatting helpers. All return '' / a safe default on bad input. */

/** Postal address as display lines (empty parts skipped). */
export function formatAddressLines(address) {
  if (!address) return [];
  const country = COUNTRIES.find((item) => item.code === address.country)?.name ?? address.country;
  const region = [address.city, [address.state, address.postalCode].filter(Boolean).join(' ')]
    .filter(Boolean)
    .join(', ');
  return [address.fullName, address.line1, address.line2, region, country].filter(Boolean);
}

function toDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDate(iso, locale = 'en-US') {
  const date = toDate(iso);
  if (!date) return '';
  return new Intl.DateTimeFormat(locale, { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
}

export function formatDateTime(iso, locale = 'en-US') {
  const date = toDate(iso);
  if (!date) return '';
  return new Intl.DateTimeFormat(locale, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

const RELATIVE_UNITS = [
  ['year', 31536000],
  ['month', 2592000],
  ['day', 86400],
  ['hour', 3600],
  ['minute', 60],
];

/** "2 hours ago", "in 3 days", "now". */
export function formatRelativeTime(iso, now = Date.now(), locale = 'en-US') {
  const date = toDate(iso);
  if (!date) return '';
  const diffSeconds = Math.round((date.getTime() - now) / 1000);
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  for (const [unit, seconds] of RELATIVE_UNITS) {
    if (Math.abs(diffSeconds) >= seconds) {
      return rtf.format(Math.round(diffSeconds / seconds), unit);
    }
  }
  return rtf.format(0, 'second');
}

/** Coarse "Browser on OS" label from a user-agent string. */
export function describeDevice(userAgent) {
  const ua = String(userAgent ?? '');
  let browser = 'Browser';
  if (/Edg\//.test(ua)) browser = 'Edge';
  else if (/OPR\/|Opera/.test(ua)) browser = 'Opera';
  else if (/Firefox\//.test(ua)) browser = 'Firefox';
  else if (/Chrome\//.test(ua)) browser = 'Chrome';
  else if (/Safari\//.test(ua)) browser = 'Safari';

  let os = 'Unknown device';
  if (/Windows/.test(ua)) os = 'Windows';
  else if (/Android/.test(ua)) os = 'Android';
  else if (/iPhone|iPad|iPod/.test(ua)) os = 'iOS';
  else if (/Mac OS X|Macintosh/.test(ua)) os = 'macOS';
  else if (/Linux/.test(ua)) os = 'Linux';

  return `${browser} on ${os}`;
}
