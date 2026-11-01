import { normalizeDigits } from './digits.js';

/**
 * Returns the number of minor-unit digits used by a currency.
 * @param {string} currency
 * @returns {number}
 */
export function currencyDigits(currency) {
  try {
    return new Intl.NumberFormat('en', { style: 'currency', currency })
      .resolvedOptions().maximumFractionDigits;
  } catch {
    return 2;
  }
}

/**
 * Formats an integer minor-unit amount using store settings.
 * @param {number} minorUnits
 * @param {{currency?: string, locale?: string, display?: string, currencyDisplay?: string}} options
 * @returns {string}
 */
export function formatMoney(minorUnits, options = {}) {
  const currency = options.currency || 'USD';
  const locale = options.locale || 'en-US';
  const currencyDisplay = options.display || options.currencyDisplay || 'narrowSymbol';
  const digits = currencyDigits(currency);
  const value = Number(minorUnits) / (10 ** digits);

  if (!Number.isFinite(value)) return '';
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency', currency, currencyDisplay,
      minimumFractionDigits: digits, maximumFractionDigits: digits,
    }).format(value);
  } catch {
    return new Intl.NumberFormat(locale, { style: 'currency', currency, currencyDisplay: 'code' })
      .format(value);
  }
}

/**
 * Converts a major-unit input to an integer minor-unit amount.
 * @param {string|number} major
 * @param {string} currency
 * @returns {number}
 */
export function toMinor(major, currency) {
  const normalized = normalizeDigits(major).replace(/[^0-9.-]/g, '');
  const value = Number(normalized);
  if (!Number.isFinite(value)) return 0;
  return Math.round(value * (10 ** currencyDigits(currency)));
}

/**
 * Converts integer minor units to major units.
 * @param {number} minor
 * @param {string} currency
 * @returns {number}
 */
export function fromMinor(minor, currency) {
  return Number(minor) / (10 ** currencyDigits(currency));
}

/**
 * Returns the locale-aware currency affix and its placement.
 * @param {{currency?: string, locale?: string, display?: string, currencyDisplay?: string}} options
 * @returns {{value: string, position: 'before'|'after'}}
 */
export function currencyAffix(options = {}) {
  const currency = options.currency || 'USD';
  const locale = options.locale || 'en-US';
  const currencyDisplay = options.display || options.currencyDisplay || 'narrowSymbol';
  try {
    const parts = new Intl.NumberFormat(locale, { style: 'currency', currency, currencyDisplay })
      .formatToParts(1);
    const currencyPart = parts.find((part) => part.type === 'currency');
    const numberIndex = parts.findIndex((part) => part.type === 'integer' || part.type === 'fraction');
    const currencyIndex = parts.findIndex((part) => part.type === 'currency');
    return { value: currencyPart?.value || currency, position: currencyIndex < numberIndex ? 'before' : 'after' };
  } catch {
    return { value: currency, position: 'before' };
  }
}