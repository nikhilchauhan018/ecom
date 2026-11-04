import { describe, it } from 'node:test';
import assert from 'node:assert';
import { readQuery, writeQuery } from './queryState.js';

const SCHEMA = { search: '', status: '', page: 1, pageSize: 10 };
const params = (text) => new URLSearchParams(text);

describe('readQuery', () => {
  it('returns the defaults for an empty URL', () => {
    assert.deepStrictEqual(readQuery(params(''), SCHEMA), { search: '', status: '', page: 1, pageSize: 10 });
  });

  it('reads text and numbers', () => {
    const result = readQuery(params('search=shirt&status=active&page=3&pageSize=50'), SCHEMA);
    assert.deepStrictEqual(result, { search: 'shirt', status: 'active', page: 3, pageSize: 50 });
  });

  it('falls back to the default for invalid numbers', () => {
    for (const bad of ['abc', '0', '-2', '1.5', '']) {
      assert.strictEqual(readQuery(params(`page=${bad}`), SCHEMA).page, 1, `page=${bad}`);
    }
  });

  it('ignores params that are not in the schema', () => {
    assert.strictEqual('other' in readQuery(params('other=1'), SCHEMA), false);
  });
});

describe('writeQuery', () => {
  it('sets a value', () => {
    assert.strictEqual(writeQuery(params(''), { status: 'active' }, SCHEMA).get('status'), 'active');
  });

  it('removes a value that equals the default or is empty', () => {
    const next = writeQuery(params('status=active&page=1'), { status: '', page: 1 }, SCHEMA);
    assert.strictEqual(next.has('status'), false);
    assert.strictEqual(next.has('page'), false);
  });

  it('trims text', () => {
    assert.strictEqual(writeQuery(params(''), { search: '  hat  ' }, SCHEMA).get('search'), 'hat');
    assert.strictEqual(writeQuery(params('search=hat'), { search: '   ' }, SCHEMA).has('search'), false);
  });

  it('resets the page when a filter really changes', () => {
    const next = writeQuery(params('page=4&status=active'), { status: 'draft' }, SCHEMA);
    assert.strictEqual(next.has('page'), false);
    assert.strictEqual(readQuery(next, SCHEMA).page, 1);
  });

  it('keeps the page when the filter did not change', () => {
    const next = writeQuery(params('page=4&status=active'), { status: 'active' }, SCHEMA);
    assert.strictEqual(next.get('page'), '4');
  });

  it('keeps the page the caller sets together with a filter', () => {
    const next = writeQuery(params(''), { status: 'draft', page: 2 }, SCHEMA);
    assert.strictEqual(next.get('page'), '2');
  });

  it('changing only the page does not touch other values', () => {
    const next = writeQuery(params('status=active'), { page: 3 }, SCHEMA);
    assert.strictEqual(next.get('status'), 'active');
    assert.strictEqual(next.get('page'), '3');
  });

  it('ignores keys outside the schema and keeps unrelated params', () => {
    const next = writeQuery(params('tab=info'), { nope: 'x', status: 'active' }, SCHEMA);
    assert.strictEqual(next.has('nope'), false);
    assert.strictEqual(next.get('tab'), 'info');
  });

  it('does not modify the params it was given', () => {
    const current = params('status=active');
    writeQuery(current, { status: 'draft' }, SCHEMA);
    assert.strictEqual(current.get('status'), 'active');
  });

  it('works for a schema without a page key', () => {
    const next = writeQuery(params('search=a'), { search: 'b' }, { search: '' });
    assert.strictEqual(next.get('search'), 'b');
  });
});
