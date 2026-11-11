import test from 'node:test';
import assert from 'node:assert/strict';
import { invoiceDateLabel, invoiceFileName, invoiceStatusLabel, invoiceStatusTone } from './invoiceUtils.js';

test('formats invoice statuses and tones', () => {
  assert.equal(invoiceStatusLabel('paid'), 'Paid');
  assert.equal(invoiceStatusTone('refunded'), 'danger');
  assert.equal(invoiceStatusTone('pending'), 'warning');
});

test('creates stable invoice file names', () => {
  assert.equal(invoiceFileName({ id: 'INV-1001', orderNumber: 'ORD-1001' }), 'INV-1001-ORD-1001.pdf');
  assert.equal(invoiceFileName({ id: 'INV/1001', orderNumber: '' }), 'INV-1001-order.pdf');
});

test('formats valid dates and handles invalid dates', () => {
  assert.equal(invoiceDateLabel('2025-01-15T00:00:00.000Z', 'en-GB'), '15/01/2025');
  assert.equal(invoiceDateLabel('not-a-date'), '—');
});
