import { describe, it } from 'node:test';
import assert from 'node:assert';
import { getDashboardSummary } from './dashboard.js';

describe('getDashboardSummary', () => {
  it('has every section the dashboard screen reads', async () => {
    const summary = await getDashboardSummary();
    for (const key of ['tiles', 'salesByDay', 'todo', 'recentOrders', 'activity', 'notifications', 'topCategories', 'modules', 'security']) {
      assert.ok(summary[key], `missing section: ${key}`);
    }
    assert.ok(summary.tiles.length > 0);
  });

  it('returns a fresh copy each time, so changing one result does not affect the next', async () => {
    const first = await getDashboardSummary();
    first.tiles[0].label = 'Changed';
    first.recentOrders.length = 0;
    const second = await getDashboardSummary();
    assert.notStrictEqual(second.tiles[0].label, 'Changed');
    assert.ok(second.recentOrders.length > 0);
  });
});
