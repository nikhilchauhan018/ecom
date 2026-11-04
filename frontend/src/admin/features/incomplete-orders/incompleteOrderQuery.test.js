import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  IncompleteOrderError,
  MAX_BULK,
  customerLabel,
  incompleteOrderErrorSentence,
  incompleteOrdersToCsv,
  queryIncompleteOrders,
  removeIncompleteOrders,
  summarizeDeletion,
  validateFilters,
} from './incompleteOrderQuery.js';

const record = (id, name, email, amount, date) => ({ id, customer: { name, email }, amount, createdAt: `${date}T00:00:00.000Z`, items: [] });
const make = () => [
  record(10, 'Asha', 'asha@example.com', 500, '2026-10-01'),
  record(30, '', '', 100, '2026-10-20'),
  record(20, 'Bilal', 'bilal@example.com', 900, '2026-10-10'),
  record(40, 'carla', 'carla@example.com', 100, '2026-10-30'),
];
const ids = (result) => result.data.map((item) => item.id);

describe('queryIncompleteOrders: sorting', () => {
  it('defaults to newest id first', () => {
    assert.deepStrictEqual(ids(queryIncompleteOrders(make())), [40, 30, 20, 10]);
  });

  it('sorts by each field in both directions', () => {
    assert.deepStrictEqual(ids(queryIncompleteOrders(make(), { sort: 'id', order: 'asc' })), [10, 20, 30, 40]);
    assert.deepStrictEqual(ids(queryIncompleteOrders(make(), { sort: 'amount', order: 'desc' })), [20, 10, 40, 30]);
    assert.deepStrictEqual(ids(queryIncompleteOrders(make(), { sort: 'createdAt', order: 'asc' })), [10, 20, 30, 40]);
  });

  it('sorts customers ignoring case, with guests (empty name) first when ascending', () => {
    assert.deepStrictEqual(ids(queryIncompleteOrders(make(), { sort: 'customer', order: 'asc' })), [30, 10, 20, 40]);
  });

  it('breaks ties by newest id, and falls back to id for an unknown sort field', () => {
    assert.deepStrictEqual(ids(queryIncompleteOrders(make(), { sort: 'amount', order: 'asc' })), [40, 30, 10, 20]);
    assert.deepStrictEqual(ids(queryIncompleteOrders(make(), { sort: 'bogus' })), [40, 30, 20, 10]);
  });
});

describe('queryIncompleteOrders: filtering', () => {
  it('searches id, name and email, ignoring case and spaces around the text', () => {
    assert.deepStrictEqual(ids(queryIncompleteOrders(make(), { search: '  BILAL ' })), [20]);
    assert.deepStrictEqual(ids(queryIncompleteOrders(make(), { search: 'carla@' })), [40]);
    assert.deepStrictEqual(ids(queryIncompleteOrders(make(), { search: '30' })), [30]);
  });

  it('filters by date range, both ends included', () => {
    assert.deepStrictEqual(ids(queryIncompleteOrders(make(), { dateFrom: '2026-10-10', dateTo: '2026-10-20' })), [30, 20]);
  });

  it('filters by amount range, both ends included', () => {
    assert.deepStrictEqual(ids(queryIncompleteOrders(make(), { amountMin: '100', amountMax: '500' })), [40, 30, 10]);
    assert.deepStrictEqual(ids(queryIncompleteOrders(make(), { amountMin: '600' })), [20]);
  });

  it('treats empty or non-numeric amounts as no filter (not as zero)', () => {
    assert.strictEqual(queryIncompleteOrders(make(), { amountMin: '', amountMax: 'abc' }).meta.total, 4);
  });

  it('combines filters', () => {
    assert.deepStrictEqual(ids(queryIncompleteOrders(make(), { amountMax: '500', dateFrom: '2026-10-15' })), [40, 30]);
  });

  it('does not change the records it is given', () => {
    const records = make();
    queryIncompleteOrders(records, { sort: 'amount', order: 'asc' });
    assert.deepStrictEqual(records.map((item) => item.id), [10, 30, 20, 40]);
  });
});

describe('queryIncompleteOrders: pagination', () => {
  const many = Array.from({ length: 25 }, (_, index) => record(index + 1, 'x', '', 1, '2026-10-01'));

  it('returns the page and the totals', () => {
    const result = queryIncompleteOrders(many, { page: 2, pageSize: 10 });
    assert.strictEqual(result.data.length, 10);
    assert.deepStrictEqual(result.meta, { page: 2, pageSize: 10, total: 25, totalPages: 3 });
  });

  it('gives a short last page', () => {
    assert.strictEqual(queryIncompleteOrders(many, { page: 3, pageSize: 10 }).data.length, 5);
  });

  it('a page past the end is empty but reports the real number of pages', () => {
    const result = queryIncompleteOrders(many, { page: 9, pageSize: 10 });
    assert.strictEqual(result.data.length, 0);
    assert.strictEqual(result.meta.totalPages, 3);
  });

  it('repairs bad page and page size values, and caps the page size', () => {
    assert.strictEqual(queryIncompleteOrders(many, { page: 'abc', pageSize: 0 }).meta.page, 1);
    assert.strictEqual(queryIncompleteOrders(many, { pageSize: 0 }).meta.pageSize, 10);
    assert.strictEqual(queryIncompleteOrders(many, { pageSize: 5000 }).meta.pageSize, 100);
  });

  it('reports zero pages when nothing matches', () => {
    assert.deepStrictEqual(queryIncompleteOrders(many, { search: 'nope' }).meta, { page: 1, pageSize: 10, total: 0, totalPages: 0 });
  });
});

describe('validateFilters', () => {
  it('accepts empty, partial and ordered ranges (equal ends are fine)', () => {
    assert.strictEqual(validateFilters(), '');
    assert.strictEqual(validateFilters({ dateFrom: '2026-10-01' }), '');
    assert.strictEqual(validateFilters({ dateFrom: '2026-10-01', dateTo: '2026-10-01', amountMin: '5', amountMax: '5' }), '');
  });

  it('rejects a start date after the end date', () => {
    assert.ok(validateFilters({ dateFrom: '2026-10-05', dateTo: '2026-10-01' }));
  });

  it('rejects a minimum amount above the maximum, comparing numbers not text', () => {
    assert.ok(validateFilters({ amountMin: '100', amountMax: '20' }));
    assert.strictEqual(validateFilters({ amountMin: '20', amountMax: '100' }), '');
  });

  it('ignores non-numeric amounts', () => {
    assert.strictEqual(validateFilters({ amountMin: 'abc', amountMax: '1' }), '');
  });
});

describe('removeIncompleteOrders', () => {
  it('deletes the records and reports them', () => {
    const records = make();
    const result = removeIncompleteOrders(records, [10, '20']);
    assert.deepStrictEqual(result, { deleted: ['10', '20'], failed: [] });
    assert.deepStrictEqual(records.map((item) => item.id), [30, 40]);
  });

  it('reports unknown ids per record and still deletes the rest', () => {
    const records = make();
    const result = removeIncompleteOrders(records, [10, 999]);
    assert.deepStrictEqual(result.deleted, ['10']);
    assert.deepStrictEqual(result.failed, [{ id: '999', code: 'not_found' }]);
    assert.strictEqual(records.length, 3);
  });

  it('ignores duplicate ids', () => {
    const result = removeIncompleteOrders(make(), [10, 10, '10']);
    assert.deepStrictEqual(result, { deleted: ['10'], failed: [] });
  });

  it('rejects an empty or invalid selection as a whole and deletes nothing', () => {
    const records = make();
    for (const bad of [[], undefined, null, 'abc']) {
      assert.throws(() => removeIncompleteOrders(records, bad), (error) => error instanceof IncompleteOrderError && error.code === 'invalid_selection');
    }
    assert.strictEqual(records.length, 4);
  });

  it('rejects an oversized selection as a whole and deletes nothing', () => {
    const records = make();
    const tooMany = Array.from({ length: MAX_BULK + 1 }, (_, index) => index);
    assert.throws(() => removeIncompleteOrders(records, tooMany), (error) => error.code === 'too_many');
    assert.strictEqual(records.length, 4);
  });
});

describe('messages and labels', () => {
  it('summarises a delete by outcome', () => {
    assert.deepStrictEqual(summarizeDeletion({ deleted: ['1'], failed: [] }), { tone: 'success', text: '1 record deleted.' });
    assert.strictEqual(summarizeDeletion({ deleted: ['1', '2'], failed: [] }).text, '2 records deleted.');
    assert.strictEqual(summarizeDeletion({ deleted: ['1'], failed: [{ id: '9', code: 'not_found' }] }).tone, 'warning');
    assert.strictEqual(summarizeDeletion({ deleted: [], failed: [{ id: '9', code: 'not_found' }] }).tone, 'error');
  });

  it('has a safe default sentence for unknown error codes', () => {
    assert.strictEqual(incompleteOrderErrorSentence('nope'), 'Something went wrong.');
    assert.ok(incompleteOrderErrorSentence('not_found').length > 0);
  });

  it('labels guests', () => {
    assert.strictEqual(customerLabel(record(1, '  ', '', 1, '2026-10-01')), 'Guest');
    assert.strictEqual(customerLabel(record(1, 'Asha', '', 1, '2026-10-01')), 'Asha');
  });
});

describe('incompleteOrdersToCsv', () => {
  it('writes a header and one quoted row per record', () => {
    const lines = incompleteOrdersToCsv([record(10, 'Asha', 'asha@example.com', 500, '2026-10-01')]).split('\n');
    assert.strictEqual(lines[0], '"ID","Customer","Email","Amount","Created at"');
    assert.strictEqual(lines[1], '"10","Asha","asha@example.com","500","2026-10-01"');
  });

  it('neutralises formulas and escapes quotes', () => {
    const csv = incompleteOrdersToCsv([record(1, '=HYPERLINK("x")', '@evil', 1, '2026-10-01')]);
    assert.ok(csv.includes(`"'=HYPERLINK(""x"")"`));
    assert.ok(csv.includes(`"'@evil"`));
  });
});
