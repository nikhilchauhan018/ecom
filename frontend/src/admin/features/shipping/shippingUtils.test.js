import test from 'node:test';
import assert from 'node:assert/strict';
import { shippingStatusLabel, shippingStatusTone, validateShippingMethod } from './shippingUtils.js';

test('formats shipping statuses', () => {
  assert.equal(shippingStatusLabel('active'), 'Active');
  assert.equal(shippingStatusTone('draft'), 'wait');
});

test('validates shipping method fields', () => {
  assert.deepEqual(validateShippingMethod({ name: '', carrier: '', deliveryTime: '', price: -1 }), {
    name: 'Method name is required.',
    carrier: 'Carrier is required.',
    deliveryTime: 'Delivery time is required.',
    price: 'Price must be zero or greater.',
  });
  assert.deepEqual(validateShippingMethod({ name: 'Standard', carrier: 'DHL', deliveryTime: '3 days', price: 80 }), {});
});
