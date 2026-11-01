import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { parseFilters, serializeFilters, resetFilterPage } from '../utils/filters.js';
import { currencyAffix, currencyDigits, formatMoney, fromMinor, toMinor } from '../utils/money.js';
import { normalizeDigits, parseLocalizedInteger } from '../utils/digits.js';
import { niceStep } from '../utils/niceStep.js';
import { buildPriceChips } from '../utils/priceChips.js';

describe('filter URL state', () => {
  it('round trips stable values and omits defaults', () => {
    const filters = parseFilters(new URLSearchParams('q=kurti&gender=women&category=dresses,kurtis&page=2&sort=newest&inStock=1'));
    assert.deepEqual(filters, { q: 'kurti', gender: ['women'], category: ['dresses', 'kurtis'], inStock: true, sort: 'newest', page: 2 });
    assert.equal(serializeFilters(filters), 'q=kurti&gender=women&category=dresses%2Ckurtis&inStock=1&sort=newest&page=2');
  });

  it('drops invalid values and resets page after a filter change', () => {
    const filters = parseFilters(new URLSearchParams('rating=9&price=8-2&sort=old&page=-1&inStock=0'));
    assert.deepEqual(filters, { page: 1 });
    assert.equal(resetFilterPage({ rating: 4, page: 8 }).page, 1);
  });
});

describe('minor-unit currency helpers', () => {
  it('uses currency precision from Intl', () => {
    assert.equal(currencyDigits('USD'), 2);
    assert.equal(currencyDigits('JPY'), 0);
    assert.equal(toMinor('12.34', 'USD'), 1234);
    assert.equal(fromMinor(1234, 'USD'), 12.34);
    assert.equal(toMinor('१२३', 'INR'), 12300);
  });

  it('formats the supported locale families without currency literals', () => {
    const cases = [['USD', 'en-US', 123456], ['INR', 'en-IN', 123456], ['NPR', 'en-NP', 123456], ['BDT', 'en-BD', 123456], ['AED', 'en-AE', 123456], ['JPY', 'ja-JP', 123456]];
    cases.forEach(([currency, locale, amount]) => {
      const formatted = formatMoney(amount, { currency, locale, currencyDisplay: 'code' });
      assert.match(formatted, new RegExp(currency));
      assert.ok(formatted.length > currency.length);
    });
    assert.equal(currencyAffix({ currency: 'USD', locale: 'en-US' }).position, 'before');
  });
});

describe('price helpers', () => {
  it('normalizes digits and makes range-based steps', () => {
    assert.equal(normalizeDigits('१२,٣٤٥'), '12,345');
    assert.equal(parseLocalizedInteger('१२,٣٤५'), 12345);
    assert.ok(niceStep(1000, 100000) > 0);
    assert.ok(buildPriceChips([1000, 2000, 3000, 5000, 9000], { currency: 'USD', locale: 'en-US' }).length > 0);
  });
});