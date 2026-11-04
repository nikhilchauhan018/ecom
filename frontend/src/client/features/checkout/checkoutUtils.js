import { matchDialCode } from '../../utils/phone.js';
import { normalizePhone } from '../../utils/validators.js';

/**
 * Pure checkout helpers (no React, no browser APIs) so they can be unit-tested with `node --test`.
 */

/** Prices can have cents; sum in integer cents so floating point never leaks into the total. */
const toCents = (amount) => Math.round(Number(amount) * 100) || 0;

/**
 * Joins cart items with catalog products. Items whose product cannot be found are dropped
 * (the page tells the shopper about them separately).
 * @param {{ id: string|number, quantity?: number }[]} items
 * @param {{ id: string|number, name: string, price: number }[]} products
 * @returns {{ id: string, name: string, quantity: number, unitPrice: number, lineTotal: number }[]}
 */
export function buildLines(items = [], products = []) {
  return items
    .map((item) => {
      const product = products.find((candidate) => String(candidate.id) === String(item.id));
      if (!product) return null;
      const quantity = Math.max(1, Math.floor(Number(item.quantity)) || 1);
      return {
        id: String(product.id),
        name: product.name,
        image: product.image,
        variant: [item.size, item.color].filter(Boolean).join(' / '),
        quantity,
        unitPrice: product.price,
        lineTotal: (toCents(product.price) * quantity) / 100,
      };
    })
    .filter(Boolean);
}

/**
 * Order totals. Only the product subtotal exists today: there is deliberately no shipping, tax or
 * discount here. When delivery charges are introduced, add them as a separate line next to `subtotal`.
 */
export function calculateTotals(lines = []) {
  const cents = lines.reduce((sum, line) => sum + toCents(line.lineTotal), 0);
  return {
    itemCount: lines.reduce((sum, line) => sum + line.quantity, 0),
    subtotal: cents / 100,
    total: cents / 100,
  };
}

/** "+919876543210" -> "+91 98765 43210". Falls back to the stored value if it is not a valid number. */
export function formatCheckoutPhone(phone) {
  const normalized = normalizePhone(phone);
  if (!/^\+[1-9]\d{7,14}$/.test(normalized)) return String(phone ?? '').trim();
  const digits = normalized.slice(1);
  const country = matchDialCode(digits);
  if (!country) return normalized;
  const national = digits.slice(country.dial.length);
  let grouped = national;
  if (country.dial === '91' && national.length === 10) grouped = `${national.slice(0, 5)} ${national.slice(5)}`;
  else if (country.dial === '1' && national.length === 10) grouped = `${national.slice(0, 3)} ${national.slice(3, 6)} ${national.slice(6)}`;
  return `+${country.dial} ${grouped}`;
}

/** One-line postal address: "B-24, Model Town, Ludhiana, Punjab 141002". */
export function formatCheckoutAddress(address) {
  if (!address) return '';
  const region = [address.state, address.postalCode].filter(Boolean).join(' ');
  return [address.line1, address.line2, address.city, region].filter(Boolean).join(', ');
}

export function pickDefaultAddress(addresses = []) {
  return addresses.find((address) => address.isDefault) || addresses[0] || null;
}

/** Keeps the shopper's choice while it still exists, otherwise falls back to default / first address. */
export function resolveSelectedId(addresses = [], selectedId = null) {
  if (selectedId && addresses.some((address) => address.id === selectedId)) return selectedId;
  return pickDefaultAddress(addresses)?.id ?? null;
}

/** Account addresses first, then device-local ones that are not duplicates of an account address. */
export function mergeAddresses(accountAddresses = [], localAddresses = []) {
  const extra = localAddresses.filter(
    (local) => !accountAddresses.some((account) => account.postalCode === local.postalCode && account.line1 === local.line1)
  );
  return [...accountAddresses, ...extra];
}
