import test from 'node:test';
import assert from 'node:assert/strict';
import { shipmentStatusLabel, shipmentStatusTone } from './shipmentUtils.js';

test('formats shipment status labels', () => {
  assert.equal(shipmentStatusLabel('out_for_delivery'), 'Out for delivery');
  assert.equal(shipmentStatusLabel('unknown'), 'unknown');
});

test('assigns semantic shipment tones', () => {
  assert.equal(shipmentStatusTone('delivered'), 'success');
  assert.equal(shipmentStatusTone('out_for_delivery'), 'info');
  assert.equal(shipmentStatusTone('pending'), 'neutral');
});
