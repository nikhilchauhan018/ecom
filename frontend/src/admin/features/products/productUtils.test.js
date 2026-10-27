import test from 'node:test';
import assert from 'node:assert/strict';
import { escapeCsvCell, exportProductsCsv, generateVariants, getStockState, parseCsv, removedVariantsWithData, slugify, validateCsvLimits, validatePrice, validateProductRows } from './productUtils.js';
import { PRODUCT_CSV_MAX_BYTES, PRODUCT_CSV_MAX_ROWS } from './productConstants.js';

test('slugifies product names', () => assert.equal(slugify(' Linen & Cotton Shirt '), 'linen-cotton-shirt'));
test('validates sale price below price', () => assert.equal(validatePrice({ price: 100, salePrice: 100 }).salePrice, 'Sale price must be lower than price.'));
test('computes stock state from variants', () => assert.equal(getStockState({ variants: [{ stock: 0 }, { stock: 0 }] }), 'out_of_stock'));
test('regenerates variants while retaining edited rows', () => {
  const existing = [{ id: 'keep', sku: 'SKU', barcode: '', options: { size: 'M', color: 'Navy' }, price: 100, salePrice: null, cost: 50, stock: 4, image: '' }];
  const variants = generateVariants({ sizes: ['S', 'M'], colors: ['Navy'], existing });
  assert.equal(variants.find((variant) => variant.options.size === 'M').id, 'keep');
  assert.equal(variants.length, 2);
});
test('reports removed variants with data', () => {
  const previous = [{ options: { size: 'S', color: 'Black' }, sku: 'SKU', stock: 2, price: 10 }];
  assert.equal(removedVariantsWithData(previous, []).length, 1);
});
test('neutralises formula injection in CSV export', () => assert.equal(escapeCsvCell('=SUM(A1:A2)'), '"\'=SUM(A1:A2)"'));
test('parses and validates CSV rows', () => {
  const rows = parseCsv('name,sku,price,salePrice,status,category\nShirt,SKU-1,100,120,published,Shirts').map(([name, sku, price, salePrice, status, category]) => ({ name, sku, price, salePrice, status, category }));
  assert.ok(validateProductRows(rows, ['Shirts']).some((error) => error.column === 'salePrice'));
  assert.match(exportProductsCsv([{ name: 'Shirt', slug: 'shirt', status: 'published', variants: [{ sku: 'SKU-1', price: 100, salePrice: null }] }]), /SKU-1/);
});

test('enforces CSV size and row limits', () => {
  assert.deepEqual(validateCsvLimits(PRODUCT_CSV_MAX_BYTES + 1, 1), ['CSV file must be 5 MB or smaller.']);
  assert.deepEqual(validateCsvLimits(1, PRODUCT_CSV_MAX_ROWS + 1), [`CSV file must contain ${PRODUCT_CSV_MAX_ROWS} rows or fewer.`]);
});
