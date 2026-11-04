import { describe, it } from 'node:test';
import assert from 'node:assert';
import { createLatestOnly } from './latestOnly.js';

const later = (ms, value) => new Promise((resolve) => setTimeout(() => resolve(value), ms));

describe('createLatestOnly', () => {
  it('a single request is current', () => {
    const guard = createLatestOnly();
    assert.strictEqual(guard.start().isCurrent(), true);
  });

  it('starting a new request makes the older one stale', () => {
    const guard = createLatestOnly();
    const first = guard.start();
    const second = guard.start();
    assert.strictEqual(first.isCurrent(), false);
    assert.strictEqual(second.isCurrent(), true);
  });

  it('cancel makes the request in flight stale', () => {
    const guard = createLatestOnly();
    const request = guard.start();
    guard.cancel();
    assert.strictEqual(request.isCurrent(), false);
  });

  it('a request started after cancel is current again', () => {
    const guard = createLatestOnly();
    guard.start();
    guard.cancel();
    assert.strictEqual(guard.start().isCurrent(), true);
  });

  it('guards are independent of each other', () => {
    const a = createLatestOnly();
    const b = createLatestOnly();
    const fromA = a.start();
    b.start();
    b.start();
    assert.strictEqual(fromA.isCurrent(), true);
  });

  it('keeps the newest result when responses arrive out of order', async () => {
    const guard = createLatestOnly();
    let shown = null;
    const run = async (label, ms) => {
      const request = guard.start();
      const result = await later(ms, label);
      if (request.isCurrent()) shown = result;
    };
    // "slow" starts first but answers last. Without the guard it would overwrite "fast".
    await Promise.all([run('slow', 40), run('fast', 5)]);
    assert.strictEqual(shown, 'fast');
  });
});
