import test from 'node:test';
import assert from 'node:assert/strict';
import { discountStatusLabel, discountStatusTone, validateDiscount } from './discountUtils.js';

test('formats discount statuses and tones', () => {
  assert.equal(discountStatusLabel('scheduled'), 'Scheduled');
  assert.equal(discountStatusTone('active'), 'ok');
  assert.equal(discountStatusTone('expired'), 'bad');
});

test('validates discount values and required fields', () => {
  assert.deepEqual(validateDiscount({ code: '', name: '', type: 'percentage', value: 120, usageLimit: -1 }), {
    code: 'Code is required.',
    name: 'Name is required.',
    value: 'Percentage cannot exceed 100.',
    usageLimit: 'Usage limit must be zero or greater.',
  });
  assert.deepEqual(validateDiscount({ code: 'SAVE', name: 'Save', type: 'fixed', value: 100, usageLimit: 10 }), {});
});
