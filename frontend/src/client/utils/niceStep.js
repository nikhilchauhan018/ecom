/**
 * Chooses a human-friendly slider step for a minor-unit range.
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export function niceStep(min, max) {
  const range = Math.max(1, Math.abs(max - min));
  const magnitude = 10 ** Math.floor(Math.log10(range));
  const normalized = range / magnitude;
  const factor = normalized <= 2 ? 1 : normalized <= 5 ? 5 : 10;
  return Math.max(1, factor * magnitude / 20);
}