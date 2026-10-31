import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  buildTimeline,
  countItems,
  filterOrders,
  getReturnDeadline,
  isReturnEligible,
} from '../utils/orders.js';
import { describeDevice, formatAddressLines, formatDate, formatRelativeTime } from '../utils/format.js';

const DAY = 24 * 60 * 60 * 1000;
const NOW = Date.UTC(2026, 10, 1, 12, 0, 0);
const at = (offsetDays) => new Date(NOW + offsetDays * DAY).toISOString();

const delivered = (daysAgo) => ({
  id: 'o1',
  status: 'delivered',
  items: [{ id: 'i1', qty: 2 }, { id: 'i2', qty: 1 }],
  timeline: [
    { status: 'placed', at: at(-daysAgo - 4) },
    { status: 'delivered', at: at(-daysAgo) },
  ],
});

describe('order filtering and counting', () => {
  const orders = [
    { id: 'a', status: 'out_for_delivery' },
    { id: 'b', status: 'delivered' },
    { id: 'c', status: 'cancelled' },
    { id: 'd', status: 'placed' },
  ];

  it('filters by tab', () => {
    assert.deepStrictEqual(filterOrders(orders, 'all').length, 4);
    assert.deepStrictEqual(filterOrders(orders, 'active').map((o) => o.id), ['a', 'd']);
    assert.deepStrictEqual(filterOrders(orders, 'delivered').map((o) => o.id), ['b']);
    assert.deepStrictEqual(filterOrders(orders, 'cancelled').map((o) => o.id), ['c']);
    assert.deepStrictEqual(filterOrders(null, 'active'), []);
  });

  it('counts units, not lines', () => {
    assert.strictEqual(countItems(delivered(1)), 3);
    assert.strictEqual(countItems(undefined), 0);
  });
});

describe('return eligibility', () => {
  it('allows delivered orders inside the 30 day window', () => {
    assert.strictEqual(isReturnEligible(delivered(5), [], NOW), true);
    assert.strictEqual(isReturnEligible(delivered(29), [], NOW), true);
  });

  it('blocks orders past the window', () => {
    assert.strictEqual(isReturnEligible(delivered(31), [], NOW), false);
  });

  it('blocks orders that are not delivered', () => {
    assert.strictEqual(isReturnEligible({ ...delivered(5), status: 'shipped' }, [], NOW), false);
    assert.strictEqual(getReturnDeadline({ ...delivered(5), status: 'cancelled' }), null);
  });

  it('blocks duplicate requests but allows retry after a rejection', () => {
    const order = delivered(5);
    assert.strictEqual(isReturnEligible(order, [{ orderId: 'o1', status: 'requested' }], NOW), false);
    assert.strictEqual(isReturnEligible(order, [{ orderId: 'o1', status: 'rejected' }], NOW), true);
    assert.strictEqual(isReturnEligible(order, [{ orderId: 'other', status: 'requested' }], NOW), true);
  });
});

describe('buildTimeline', () => {
  const base = {
    timeline: [
      { status: 'placed', at: at(-3) },
      { status: 'packed', at: at(-2) },
      { status: 'shipped', at: at(-1) },
      { status: 'out_for_delivery', at: at(0) },
    ],
  };

  it('marks passed steps done, the current step, and upcoming steps', () => {
    const steps = buildTimeline({ ...base, status: 'out_for_delivery' });
    assert.deepStrictEqual(
      steps.map((s) => s.state),
      ['done', 'done', 'done', 'current', 'upcoming']
    );
    assert.strictEqual(steps[4].at, null);
  });

  it('treats delivered as fully done', () => {
    const steps = buildTimeline({ ...base, status: 'delivered' });
    assert.ok(steps.every((s) => s.state === 'done'));
  });

  it('ends cancelled orders at the cancellation', () => {
    const steps = buildTimeline({
      status: 'cancelled',
      timeline: [{ status: 'placed', at: at(-2) }, { status: 'cancelled', at: at(-1) }],
    });
    assert.deepStrictEqual(steps.map((s) => s.status), ['placed', 'cancelled']);
    assert.strictEqual(steps[1].state, 'current');
  });
});

describe('format helpers', () => {
  it('formats relative times', () => {
    assert.strictEqual(formatRelativeTime(at(-2), NOW, 'en-US'), '2 days ago');
    assert.strictEqual(formatRelativeTime(at(3), NOW, 'en-US'), 'in 3 days');
    assert.strictEqual(formatRelativeTime('garbage', NOW), '');
  });

  it('formats dates and rejects invalid input', () => {
    assert.strictEqual(formatDate('2026-11-02T12:00:00Z', 'en-US'), 'Nov 2, 2026');
    assert.strictEqual(formatDate('nope'), '');
  });

  it('describes devices coarsely', () => {
    assert.strictEqual(
      describeDevice('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0 Safari/537.36'),
      'Chrome on Windows'
    );
    assert.strictEqual(
      describeDevice('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605 Version/17.0 Safari/604'),
      'Safari on iOS'
    );
    assert.strictEqual(describeDevice(undefined), 'Browser on Unknown device');
  });

  it('formats addresses as lines', () => {
    const lines = formatAddressLines({
      fullName: 'Alex Morgan',
      line1: '221 Market Street',
      line2: '',
      city: 'San Francisco',
      state: 'CA',
      postalCode: '94105',
      country: 'US',
    });
    assert.deepStrictEqual(lines, ['Alex Morgan', '221 Market Street', 'San Francisco, CA 94105', 'United States']);
    assert.deepStrictEqual(formatAddressLines(null), []);
  });
});
