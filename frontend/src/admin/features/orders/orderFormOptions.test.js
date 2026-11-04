import { describe, it } from 'node:test';
import assert from 'node:assert';
import { deriveFormOptions } from './orderFormOptions.js';

const order = (customerId, items) => ({ customer: { id: customerId, name: `Name ${customerId}` }, items });
const item = (productId, unitPrice) => ({ productId, name: `Product ${productId}`, unitPrice });

describe('deriveFormOptions', () => {
  it('returns empty lists for no orders', () => {
    assert.deepStrictEqual(deriveFormOptions([]), { customers: [], products: [] });
  });

  it('lists each customer and each product once', () => {
    const result = deriveFormOptions([
      order('c1', [item('p1', 10), item('p2', 20)]),
      order('c1', [item('p2', 20)]),
      order('c2', [item('p3', 30)]),
    ]);
    assert.deepStrictEqual(result.customers.map((customer) => customer.id), ['c1', 'c2']);
    assert.deepStrictEqual(result.products.map((product) => product.productId), ['p1', 'p2', 'p3']);
  });

  it('keeps the last version when an id repeats', () => {
    const result = deriveFormOptions([order('c1', [item('p1', 10)]), order('c1', [item('p1', 99)])]);
    assert.strictEqual(result.products[0].unitPrice, 99);
  });

  it('returns copies, so callers cannot change the source orders', () => {
    const source = [order('c1', [item('p1', 10)])];
    const result = deriveFormOptions(source);
    result.customers[0].name = 'Changed';
    result.products[0].unitPrice = 1;
    assert.strictEqual(source[0].customer.name, 'Name c1');
    assert.strictEqual(source[0].items[0].unitPrice, 10);
  });
});
