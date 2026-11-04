import { describe, it } from 'node:test';
import assert from 'node:assert';
import { loadOrdersPage } from './orderQuery.js';

const makeList = (total, pageSize = 10) => {
  const calls = [];
  const list = async (query) => {
    calls.push(query);
    const totalPages = Math.ceil(total / pageSize);
    const start = (query.page - 1) * pageSize;
    const data = Array.from({ length: Math.max(0, Math.min(pageSize, total - start)) }, (_, i) => ({ id: String(start + i) }));
    return { data, meta: { page: query.page, pageSize, total, totalPages } };
  };
  return { list, calls };
};

describe('loadOrdersPage', () => {
  it('returns the page as is when it has rows (one call)', async () => {
    const { list, calls } = makeList(25);
    const result = await loadOrdersPage(list, { page: 2 });
    assert.strictEqual(result.meta.page, 2);
    assert.strictEqual(result.data.length, 10);
    assert.strictEqual(calls.length, 1);
  });

  it('falls back to the last page when the page is past the end', async () => {
    const { list, calls } = makeList(25);
    const result = await loadOrdersPage(list, { page: 9 });
    assert.strictEqual(result.meta.page, 3);
    assert.strictEqual(result.data.length, 5);
    assert.strictEqual(calls.length, 2);
  });

  it('keeps every other query field when falling back', async () => {
    const { list, calls } = makeList(25);
    await loadOrdersPage(list, { page: 9, search: 'abc', status: 'pending' });
    assert.deepStrictEqual(calls[1], { page: 3, search: 'abc', status: 'pending' });
  });

  it('returns an empty first page when there are no matches (no second call)', async () => {
    const { list, calls } = makeList(0);
    const result = await loadOrdersPage(list, { page: 1 });
    assert.strictEqual(result.data.length, 0);
    assert.strictEqual(calls.length, 1);
  });
});
