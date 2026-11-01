/**
 * Converts Latin, Devanagari, and Arabic-Indic digits to ASCII digits.
 * @param {string|number} value
 * @returns {string}
 */
export function normalizeDigits(value) {
  return String(value ?? '')
    .replace(/[\u0966-\u096F]/g, (digit) => String(digit.charCodeAt(0) - 0x0966))
    .replace(/[\u0660-\u0669]/g, (digit) => String(digit.charCodeAt(0) - 0x0660))
    .replace(/[\u06F0-\u06F9]/g, (digit) => String(digit.charCodeAt(0) - 0x06F0));
}

/**
 * Reads a user-entered major-unit amount while ignoring grouping separators.
 * @param {string|number} value
 * @returns {number|null}
 */
export function parseLocalizedInteger(value) {
  const normalized = normalizeDigits(value).replace(/[^0-9]/g, '');
  if (!normalized) return null;
  const parsed = Number(normalized);
  return Number.isSafeInteger(parsed) ? parsed : null;
}