import test from 'node:test';
import assert from 'node:assert/strict';
import { customerInitials, customerStatusLabel } from './customerUtils.js';

test('creates accessible customer initials', () => {
  assert.equal(customerInitials('Aarav Sharma'), 'AS');
  assert.equal(customerInitials('  Mia  '), 'M');
});

test('formats customer status labels', () => {
  assert.equal(customerStatusLabel('active'), 'Active');
  assert.equal(customerStatusLabel('unknown'), 'unknown');
});
