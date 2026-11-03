import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  buildLines,
  calculateTotals,
  formatCheckoutAddress,
  formatCheckoutPhone,
  mergeAddresses,
  pickDefaultAddress,
  resolveSelectedId,
} from '../features/checkout/checkoutUtils.js';

const products = [
  { id: 'a', name: 'Cotton Kurti', price: 1299 },
  { id: 'b', name: 'Linen Shirt', price: 1599 },
  { id: 'c', name: 'Scarf', price: 19.99 },
];

describe('checkout lines and totals', () => {
  it('builds lines from cart items and sums to the exact total with no extra charges', () => {
    const lines = buildLines([{ id: 'a', quantity: 1 }, { id: 'b', quantity: 1 }], products);
    assert.deepStrictEqual(lines.map((line) => [line.name, line.quantity, line.lineTotal]), [
      ['Cotton Kurti', 1, 1299],
      ['Linen Shirt', 1, 1599],
    ]);
    assert.deepStrictEqual(calculateTotals(lines), { itemCount: 2, subtotal: 2898, total: 2898 });
  });

  it('multiplies by quantity and avoids floating point drift', () => {
    const lines = buildLines([{ id: 'c', quantity: 3 }], products);
    assert.strictEqual(lines[0].lineTotal, 59.97);
    assert.strictEqual(calculateTotals(lines).total, 59.97);
  });

  it('keeps catalog imagery and selected cart variants on each line', () => {
    const product = { ...products[0], image: { src: '/kurti.jpg', alt: 'Green kurti', color: '#708238' } };
    const [line] = buildLines([{ id: 'a', quantity: 2, size: 'M', color: 'Olive' }], [product]);
    assert.deepStrictEqual(line.image, product.image);
    assert.strictEqual(line.variant, 'M / Olive');
    assert.strictEqual(line.lineTotal, 2598);
  });

  it('treats missing or invalid quantity as 1 and drops unknown products', () => {
    const lines = buildLines([{ id: 'a' }, { id: 'b', quantity: 'x' }, { id: 'zzz', quantity: 2 }], products);
    assert.strictEqual(lines.length, 2);
    assert.ok(lines.every((line) => line.quantity === 1));
  });

  it('returns zero totals for an empty cart', () => {
    assert.deepStrictEqual(calculateTotals([]), { itemCount: 0, subtotal: 0, total: 0 });
  });
});

describe('checkout address helpers', () => {
  const home = { id: 'h', label: 'home', line1: 'B-24', line2: '', city: 'Ludhiana', state: 'Punjab', postalCode: '141002', isDefault: true };
  const work = { id: 'w', label: 'work', line1: '2nd Floor', city: 'Ludhiana', state: 'Punjab', postalCode: '141001' };

  it('formats a one-line address and skips empty parts', () => {
    assert.strictEqual(formatCheckoutAddress(home), 'B-24, Ludhiana, Punjab 141002');
    assert.strictEqual(formatCheckoutAddress(null), '');
  });

  it('formats the full phone number, never masked', () => {
    assert.strictEqual(formatCheckoutPhone('+919876543210'), '+91 98765 43210');
    assert.strictEqual(formatCheckoutPhone('+15555550142'), '+1 555 555 0142');
    assert.strictEqual(formatCheckoutPhone('not a phone'), 'not a phone');
  });

  it('selects the default address first, else the first, else null', () => {
    assert.strictEqual(pickDefaultAddress([work, home]).id, 'h');
    assert.strictEqual(pickDefaultAddress([work]).id, 'w');
    assert.strictEqual(pickDefaultAddress([]), null);
  });

  it('keeps the shopper choice while it exists and falls back otherwise', () => {
    assert.strictEqual(resolveSelectedId([home, work], 'w'), 'w');
    assert.strictEqual(resolveSelectedId([home, work], 'gone'), 'h');
    assert.strictEqual(resolveSelectedId([], 'w'), null);
  });

  it('merges device addresses without duplicating account ones', () => {
    const duplicate = { ...home, id: 'local-1' };
    const merged = mergeAddresses([home], [duplicate, work]);
    assert.deepStrictEqual(merged.map((address) => address.id), ['h', 'w']);
  });
});
