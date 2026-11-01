import { formatMoney } from './money.js';

/**
 * Builds up to four distribution-based quick ranges from current prices.
 * @param {number[]} prices
 * @param {{currency?: string, locale?: string, currencyDisplay?: string}} settings
 * @returns {{min: number|null, max: number|null, label: string}[]}
 */
export function buildPriceChips(prices, settings = {}) {
  const values = prices.filter(Number.isFinite).sort((a, b) => a - b);
  if (values.length < 2) return [];
  const boundaries = [values[0], values[Math.floor(values.length * 0.25)], values[Math.floor(values.length * 0.5)], values[Math.floor(values.length * 0.75)], values.at(-1)];
  return boundaries.slice(0, -1).map((min, index) => {
    const max = boundaries[index + 1];
    return { min, max, label: `${formatMoney(min, settings)} - ${formatMoney(max, settings)}` };
  });
}