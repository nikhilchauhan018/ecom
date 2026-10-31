/** Ordered fulfilment steps shown under the progress bar. */
export const ORDER_STEPS = ['placed', 'packed', 'shipped', 'delivered'];

/** How many of the ORDER_STEPS are complete for a given order status. */
const STEPS_DONE = {
  placed: 1,
  packed: 2,
  shipped: 3,
  out_for_delivery: 3,
  delivered: 4,
};

/**
 * Up to two uppercase initials from a display name.
 * @param {string|null|undefined} name
 * @returns {string}
 */
export function getInitials(name) {
  const parts = String(name ?? '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return '';
  const first = parts[0].charAt(0);
  const last = parts.length > 1 ? parts[parts.length - 1].charAt(0) : '';
  return (first + last).toUpperCase();
}

/**
 * Progress of an order as a 0-100 percentage and the number of completed steps.
 * Unknown statuses are treated as not started.
 * @param {string} status
 * @returns {{ percent: number, stepsDone: number }}
 */
export function getOrderProgress(status) {
  const stepsDone = STEPS_DONE[status] ?? 0;
  return { stepsDone, percent: (stepsDone / ORDER_STEPS.length) * 100 };
}

/**
 * Formats an ISO date for the "Arriving ..." label. Returns '' for invalid input.
 * @param {string|null|undefined} iso
 * @param {string} [locale]
 * @returns {string}
 */
export function formatArrivalDate(iso, locale = 'en-US') {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat(locale, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

/**
 * Builds a wa.me link from a phone number, or null when there are no digits.
 * @param {string|null|undefined} phone
 * @returns {string|null}
 */
export function buildWhatsAppUrl(phone) {
  const digits = String(phone ?? '').replace(/\D/g, '');
  return digits ? `https://wa.me/${digits}` : null;
}
