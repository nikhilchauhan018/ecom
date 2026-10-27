import test from 'node:test';
import assert from 'node:assert/strict';
import { reviewStatusLabel, reviewStatusTone, validateReview } from './reviewUtils.js';

test('formats review statuses and tones', () => {
  assert.equal(reviewStatusLabel('published'), 'Published');
  assert.equal(reviewStatusTone('pending'), 'wait');
  assert.equal(reviewStatusTone('rejected'), 'bad');
});

test('validates review fields', () => {
  assert.deepEqual(validateReview({ rating: 6, title: '', body: '' }), {
    rating: 'Rating must be between 1 and 5.',
    title: 'Title is required.',
    body: 'Review text is required.',
  });
  assert.deepEqual(validateReview({ rating: 5, title: 'Good', body: 'Useful product.' }), {});
});
