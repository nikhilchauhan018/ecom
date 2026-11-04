/**
 * Pure helpers that keep list-screen state (search, filters, page, sort) in the URL.
 *
 * `schema` maps every key to its default value, for example `{ search: '', status: '', page: 1 }`.
 * The type of the default decides how URL text is read: a number default reads a whole number >= 1,
 * a string default reads the text as is. Anything invalid falls back to the default.
 */

/** URLSearchParams -> `{ key: value }` for every key in the schema. */
export function readQuery(params, schema) {
  const values = {};
  for (const [key, fallback] of Object.entries(schema)) {
    const raw = params.get(key);
    if (raw === null || raw === '') {
      values[key] = fallback;
    } else if (typeof fallback === 'number') {
      const number = Number(raw);
      values[key] = Number.isInteger(number) && number >= 1 ? number : fallback;
    } else {
      values[key] = raw;
    }
  }
  return values;
}

/**
 * Applies `changes` to `current` and returns a new URLSearchParams (the input is not modified).
 * - Values equal to the default (or empty) are removed, so URLs stay short.
 * - Keys outside the schema in `changes` are ignored; unrelated params already in the URL are kept.
 * - If any key other than `page` really changed and the schema has `page`, `page` goes back to 1,
 *   unless the caller set `page` in the same call.
 */
export function writeQuery(current, changes, schema) {
  const next = new URLSearchParams(current);
  let filtersChanged = false;
  for (const [key, value] of Object.entries(changes)) {
    if (!(key in schema)) continue;
    const text = typeof value === 'string' ? value.trim() : String(value ?? '');
    const before = next.get(key) ?? '';
    if (text === '' || text === String(schema[key])) next.delete(key);
    else next.set(key, text);
    if (key !== 'page' && before !== (next.get(key) ?? '')) filtersChanged = true;
  }
  if (filtersChanged && 'page' in schema && !('page' in changes)) next.delete('page');
  return next;
}
