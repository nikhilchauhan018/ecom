/**
 * Addresses saved on this device for shoppers who are not signed in.
 * Kept under the same key the previous checkout used so nothing already saved is lost.
 * NOTE: this is plain localStorage (personal data in the clear); the real backend should replace it.
 */
const KEY = 'storefront_checkout_addresses';
const MAX_LOCAL = 10;

const isAddress = (value) => value && typeof value === 'object' && typeof value.id === 'string' && typeof value.line1 === 'string';

export function readLocalAddresses() {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(KEY) || '[]');
    return Array.isArray(parsed) ? parsed.filter(isAddress) : [];
  } catch {
    return [];
  }
}

/** Saves a validated address (output of `validateAddress`) and returns the saved record. */
export function addLocalAddress(values) {
  const current = readLocalAddresses();
  const saved = {
    ...values,
    id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    isDefault: Boolean(values.isDefault) || current.length === 0,
  };
  const others = saved.isDefault ? current.map((address) => ({ ...address, isDefault: false })) : current;
  try {
    window.localStorage.setItem(KEY, JSON.stringify([...others, saved].slice(-MAX_LOCAL)));
  } catch {
    // Storage full or blocked: the address still works for this visit through React state.
  }
  return saved;
}

/** Updates a validated device-local address without changing its id. */
export function updateLocalAddress(id, values) {
  const current = readLocalAddresses();
  const existing = current.find((address) => address.id === id);
  if (!existing) throw new Error('The saved address could not be found.');

  const saved = { ...existing, ...values, id, isDefault: Boolean(values.isDefault) || existing.isDefault };
  const next = saved.isDefault
    ? current.map((address) => (address.id === id ? saved : { ...address, isDefault: false }))
    : current.map((address) => (address.id === id ? saved : address));

  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Keep the updated address in page state when browser storage is unavailable.
  }
  return saved;
}
