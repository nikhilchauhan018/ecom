/**
 * Formats a numeric price using Intl.NumberFormat according to store settings.
 * @param {number|string|null|undefined} amount
 * @param {{ currency?: string, locale?: string }} [settings]
 * @returns {string}
 */
export function formatMoney(amount, settings = {}) {
  const num = typeof amount === 'string' ? parseFloat(amount) : Number(amount);
  if (amount == null || Number.isNaN(num)) {
    return '';
  }

  const currency = settings.currency || 'USD';
  const locale = settings.locale || 'en-US';

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: num % 1 === 0 ? 0 : 2,
      maximumFractionDigits: 2,
    }).format(num);
  } catch {
    return `$${num.toFixed(num % 1 === 0 ? 0 : 2)}`;
  }
}
