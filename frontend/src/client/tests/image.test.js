import { describe, it } from 'node:test';
import assert from 'node:assert';
import { getImageUrl, buildSrcSet } from '../utils/image.js';

describe('image optimization utilities', () => {
  it('returns null when src is null or missing', () => {
    assert.strictEqual(getImageUrl(null), null);
    assert.strictEqual(buildSrcSet(null), null);
  });

  it('passes URLs through when no CDN is configured', () => {
    const raw = '/assets/sample.jpg';
    assert.strictEqual(getImageUrl(raw), raw);
  });

  it('builds standard responsive srcset entries', () => {
    const raw = '/assets/sample.jpg';
    const srcset = buildSrcSet(raw, [320, 640]);
    assert.strictEqual(srcset, '/assets/sample.jpg 320w, /assets/sample.jpg 640w');
  });
});
