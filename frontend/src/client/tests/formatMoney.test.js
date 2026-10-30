import { describe, it } from 'node:test';
import assert from 'node:assert';
import { formatMoney } from '../utils/formatMoney.js';

describe('formatMoney utility', () => {
  it('formats regular integers without trailing decimals in USD', () => {
    const formatted = formatMoney(45, { currency: 'USD', locale: 'en-US' });
    assert.strictEqual(formatted, '$45');
  });

  it('formats prices with cents correctly in USD', () => {
    const formatted = formatMoney(39.99, { currency: 'USD', locale: 'en-US' });
    assert.strictEqual(formatted, '$39.99');
  });

  it('handles null or invalid amounts gracefully', () => {
    assert.strictEqual(formatMoney(null), '');
    assert.strictEqual(formatMoney(undefined), '');
    assert.strictEqual(formatMoney('abc'), '');
  });
});
