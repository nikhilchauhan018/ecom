import test from 'node:test';
import assert from 'node:assert/strict';
import { escapeInventoryCsvCell, exportInventoryCsv, getAvailableStock, getInventoryStatus, parseInventoryCsv, STOCK_ADJUSTMENT_REASONS, validateInventoryImport } from './inventoryUtils.js';

test('calculates available inventory without negative values', () => {
  assert.equal(getAvailableStock(4, 6), 0);
  assert.equal(getAvailableStock(10, 3), 7);
});

test('classifies inventory by available stock and threshold', () => {
  assert.equal(getInventoryStatus(0, 3), 'out_of_stock');
  assert.equal(getInventoryStatus(0, 3, true), 'backorder');
  assert.equal(getInventoryStatus(3, 3), 'low');
  assert.equal(getInventoryStatus(4, 3), 'in_stock');
});

test('exposes supported stock adjustment reasons', () => {
  assert.deepEqual(STOCK_ADJUSTMENT_REASONS, ['received', 'damaged', 'correction', 'return', 'other']);
});

test('exports formula-safe inventory CSV', () => {
  assert.equal(escapeInventoryCsvCell('=SKU'), '"\'=SKU"');
  assert.match(exportInventoryCsv([{ productName: 'Shirt', variant: 'S / Navy', sku: 'SKU-1', onHand: 5, reserved: 1, available: 4, threshold: 5, status: 'low' }]), /SKU-1/);
});

test('parses and validates inventory import rows', () => {
  const rows = parseInventoryCsv('variantId,threshold\nvariant-1,5\nvariant-2,-1');
  assert.equal(rows.length, 2);
  assert.equal(validateInventoryImport(rows, new Set(['variant-1', 'variant-2'])).length, 1);
});
