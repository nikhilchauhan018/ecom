import test from 'node:test';
import assert from 'node:assert/strict';
import { returnStatusLabel, returnStatusTone } from './returnUtils.js';

test('formats return statuses', () => {
  assert.equal(returnStatusLabel('requested'), 'Requested');
  assert.equal(returnStatusLabel('unknown'), 'unknown');
});

test('assigns return status tones', () => {
  assert.equal(returnStatusTone('refunded'), 'ok');
  assert.equal(returnStatusTone('rejected'), 'bad');
  assert.equal(returnStatusTone('requested'), 'wait');
});
