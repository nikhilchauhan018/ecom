import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  getInitials,
  getOrderProgress,
  formatArrivalDate,
  buildWhatsAppUrl,
} from '../utils/account.js';

describe('account utilities', () => {
  it('builds initials from names', () => {
    assert.strictEqual(getInitials('Alex Morgan'), 'AM');
    assert.strictEqual(getInitials('  alex  '), 'A');
    assert.strictEqual(getInitials('Mary Jane Watson'), 'MW');
    assert.strictEqual(getInitials(''), '');
    assert.strictEqual(getInitials(null), '');
  });

  it('maps order status to progress', () => {
    assert.deepStrictEqual(getOrderProgress('out_for_delivery'), { stepsDone: 3, percent: 75 });
    assert.deepStrictEqual(getOrderProgress('placed'), { stepsDone: 1, percent: 25 });
    assert.deepStrictEqual(getOrderProgress('delivered'), { stepsDone: 4, percent: 100 });
    assert.deepStrictEqual(getOrderProgress('mystery'), { stepsDone: 0, percent: 0 });
  });

  it('formats arrival dates and tolerates bad input', () => {
    assert.strictEqual(formatArrivalDate('2026-11-02T12:00:00Z', 'en-US'), 'Mon, Nov 2');
    assert.strictEqual(formatArrivalDate('nope'), '');
    assert.strictEqual(formatArrivalDate(undefined), '');
  });

  it('builds WhatsApp links from phone numbers', () => {
    assert.strictEqual(buildWhatsAppUrl('+1 (800) 555-0199'), 'https://wa.me/18005550199');
    assert.strictEqual(buildWhatsAppUrl(''), null);
    assert.strictEqual(buildWhatsAppUrl(null), null);
  });
});
