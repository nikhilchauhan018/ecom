import test from 'node:test';
import assert from 'node:assert/strict';
import { invoiceFileName, invoiceStatusLabel, invoiceStatusTone } from './invoiceUtils.js';

test('formats invoice statuses and tones', () => {
  assert.equal(invoiceStatusLabel('paid'), 'Paid');
  assert.equal(invoiceStatusTone('refunded'), 'danger');
  assert.equal(invoiceStatusTone('pending'), 'warning');
});

test('creates stable invoice file names', () => {
  assert.equal(invoiceFileName({ id: 'INV-1001', orderNumber: 'ORD-1001' }), 'INV-1001-ORD-1001.pdf');
});
