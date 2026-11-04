import { describe, it } from 'node:test';
import assert from 'node:assert';
import { getPageItems, pageRange } from './pagination.js';

describe('getPageItems', () => {
  it('lists every page when there are 7 or fewer', () => {
    assert.deepStrictEqual(getPageItems(1, 0), []);
    assert.deepStrictEqual(getPageItems(1, 1), [1]);
    assert.deepStrictEqual(getPageItems(3, 7), [1, 2, 3, 4, 5, 6, 7]);
  });

  it('shortens the end near the first pages', () => {
    assert.deepStrictEqual(getPageItems(1, 20), [1, 2, 3, 4, 5, 'ellipsis', 20]);
    assert.deepStrictEqual(getPageItems(4, 20), [1, 2, 3, 4, 5, 'ellipsis', 20]);
  });

  it('shortens the start near the last pages', () => {
    assert.deepStrictEqual(getPageItems(20, 20), [1, 'ellipsis', 16, 17, 18, 19, 20]);
    assert.deepStrictEqual(getPageItems(17, 20), [1, 'ellipsis', 16, 17, 18, 19, 20]);
  });

  it('shows both gaps in the middle', () => {
    assert.deepStrictEqual(getPageItems(10, 20), [1, 'ellipsis', 9, 10, 11, 'ellipsis', 20]);
  });

  it('always has the current page, the first and the last', () => {
    for (let page = 1; page <= 30; page += 1) {
      const items = getPageItems(page, 30);
      assert.ok(items.includes(page) && items.includes(1) && items.includes(30), `page ${page}`);
      assert.ok(items.length <= 7);
    }
  });
});

describe('pageRange', () => {
  it('gives the first and last row numbers on the page', () => {
    assert.deepStrictEqual(pageRange(1, 10, 25), { first: 1, last: 10 });
    assert.deepStrictEqual(pageRange(3, 10, 25), { first: 21, last: 25 });
  });

  it('is zero for an empty list', () => {
    assert.deepStrictEqual(pageRange(1, 10, 0), { first: 0, last: 0 });
  });
});
