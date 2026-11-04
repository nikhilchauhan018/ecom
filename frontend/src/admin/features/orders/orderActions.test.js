import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  MAX_BULK,
  OrderError,
  bulkChangeStatus,
  changeStatus,
  normalizeIds,
  removeOrders,
  stripProtectedFields,
  summarizeBulk,
} from './orderActions.js';
import { allowedNextStatuses, canDelete, canTransition, orderErrorSentence } from './orderStatus.js';

const make = (id, status) => ({ id, status, history: [] });

describe('status rules', () => {
  it('moves forward and allows skipping ahead', () => {
    assert.ok(canTransition('pending', 'confirmed'));
    assert.ok(canTransition('pending', 'delivered'));
    assert.ok(canTransition('shipped', 'out_for_delivery'));
  });

  it('never goes backwards or stays put', () => {
    assert.strictEqual(canTransition('shipped', 'packed'), false);
    assert.strictEqual(canTransition('packed', 'packed'), false);
    assert.strictEqual(canTransition('delivered', 'pending'), false);
  });

  it('allows cancelling only before shipping', () => {
    ['pending', 'confirmed', 'packed'].forEach((status) => assert.ok(canTransition(status, 'cancelled')));
    ['shipped', 'out_for_delivery', 'delivered'].forEach((status) => assert.strictEqual(canTransition(status, 'cancelled'), false));
  });

  it('only delivered orders can be returned, and final states are final', () => {
    assert.deepStrictEqual(allowedNextStatuses('delivered'), ['returned']);
    assert.deepStrictEqual(allowedNextStatuses('cancelled'), []);
    assert.deepStrictEqual(allowedNextStatuses('returned'), []);
    assert.deepStrictEqual(allowedNextStatuses('nonsense'), []);
  });

  it('only pending or cancelled orders are deletable', () => {
    assert.ok(canDelete('pending'));
    assert.ok(canDelete('cancelled'));
    ['confirmed', 'packed', 'shipped', 'delivered', 'returned'].forEach((status) => assert.strictEqual(canDelete(status), false));
  });
});

describe('changeStatus', () => {
  it('updates status and appends history', () => {
    const list = [make('1', 'pending')];
    const result = changeStatus(list, '1', 'confirmed', { note: 'ok', by: 'Sam', at: '2026-11-01T00:00:00.000Z' });
    assert.strictEqual(result.ok, true);
    assert.strictEqual(list[0].status, 'confirmed');
    assert.deepStrictEqual(list[0].history, [{ status: 'confirmed', note: 'ok', by: 'Sam', at: '2026-11-01T00:00:00.000Z' }]);
  });

  it('reports why a change was refused and leaves the order alone', () => {
    const list = [make('1', 'shipped')];
    assert.deepStrictEqual(changeStatus(list, '1', 'pending'), { ok: false, code: 'invalid_transition' });
    assert.deepStrictEqual(changeStatus(list, '1', 'teleported'), { ok: false, code: 'invalid_status' });
    assert.deepStrictEqual(changeStatus(list, '1', undefined), { ok: false, code: 'invalid_status' });
    assert.deepStrictEqual(changeStatus(list, '1', '__proto__'), { ok: false, code: 'invalid_status' });
    assert.deepStrictEqual(changeStatus(list, '99', 'delivered'), { ok: false, code: 'not_found' });
    assert.strictEqual(list[0].status, 'shipped');
    assert.strictEqual(list[0].history.length, 0);
  });

  it('truncates very long notes', () => {
    const list = [make('1', 'pending')];
    changeStatus(list, '1', 'confirmed', { note: 'x'.repeat(2000) });
    assert.strictEqual(list[0].history[0].note.length, 500);
  });
});

describe('bulkChangeStatus', () => {
  it('applies what it can and reports the rest per order', () => {
    const list = [make('1', 'pending'), make('2', 'delivered'), make('3', 'confirmed')];
    const result = bulkChangeStatus(list, ['1', '2', '3', '404'], 'packed');
    assert.deepStrictEqual(result.updated, ['1', '3']);
    assert.deepStrictEqual(result.failed, [
      { id: '2', code: 'invalid_transition' },
      { id: '404', code: 'not_found' },
    ]);
    assert.strictEqual(list[0].status, 'packed');
    assert.strictEqual(list[1].status, 'delivered');
  });

  it('ignores duplicate ids', () => {
    const list = [make('1', 'pending')];
    const result = bulkChangeStatus(list, ['1', 1, '1'], 'confirmed');
    assert.deepStrictEqual(result.updated, ['1']);
    assert.strictEqual(list[0].history.length, 1);
  });

  it('rejects empty selections, unknown statuses and oversized batches as a whole', () => {
    const list = [make('1', 'pending')];
    assert.throws(() => bulkChangeStatus(list, [], 'confirmed'), (e) => e instanceof OrderError && e.code === 'empty_selection');
    assert.throws(() => bulkChangeStatus(list, 'nope', 'confirmed'), (e) => e.code === 'empty_selection');
    assert.throws(() => bulkChangeStatus(list, ['1'], 'delete'), (e) => e.code === 'invalid_status');
    const many = Array.from({ length: MAX_BULK + 1 }, (_, i) => String(i));
    assert.throws(() => bulkChangeStatus(list, many, 'confirmed'), (e) => e.code === 'too_many');
  });
});

describe('removeOrders', () => {
  it('deletes pending/cancelled orders and refuses the rest', () => {
    const list = [make('1', 'pending'), make('2', 'shipped'), make('3', 'cancelled'), make('4', 'delivered')];
    const result = removeOrders(list, ['1', '2', '3', '9']);
    assert.deepStrictEqual(result.deleted, ['1', '3']);
    assert.deepStrictEqual(result.failed, [
      { id: '2', code: 'not_deletable' },
      { id: '9', code: 'not_found' },
    ]);
    assert.deepStrictEqual(list.map((o) => o.id), ['2', '4']);
  });

  it('rejects an empty selection', () => {
    assert.throws(() => removeOrders([], []), (e) => e.code === 'empty_selection');
  });
});

describe('helpers', () => {
  it('normalizes ids', () => {
    assert.deepStrictEqual(normalizeIds(['1', 1, '2']), ['1', '2']);
    assert.deepStrictEqual(normalizeIds(null), []);
    assert.deepStrictEqual(normalizeIds('1'), []);
  });

  it('strips identity and workflow fields from generic updates', () => {
    const safe = stripProtectedFields({ id: 'x', number: 'N', createdAt: 'c', status: 'delivered', history: [], notes: ['n'], paymentStatus: 'completed' });
    assert.deepStrictEqual(safe, { notes: ['n'], paymentStatus: 'completed' });
    assert.deepStrictEqual(stripProtectedFields(undefined), {});
  });

  it('summarises bulk outcomes', () => {
    assert.deepStrictEqual(summarizeBulk({ done: 3, failed: [], verb: 'updated' }), { tone: 'success', text: '3 orders updated.' });
    assert.deepStrictEqual(summarizeBulk({ done: 1, failed: [], verb: 'deleted' }), { tone: 'success', text: '1 order deleted.' });

    const partial = summarizeBulk({ done: 2, failed: [{ id: 'a', code: 'not_deletable' }, { id: 'b', code: 'not_deletable' }], verb: 'deleted' });
    assert.strictEqual(partial.tone, 'warning');
    assert.strictEqual(partial.text, '2 orders deleted. 2 skipped: only pending or cancelled orders can be deleted.');

    const none = summarizeBulk({ done: 0, failed: [{ id: 'a', code: 'invalid_transition' }], verb: 'updated' });
    assert.strictEqual(none.tone, 'error');
  });

  it('capitalises standalone error sentences and has a safe default', () => {
    assert.strictEqual(orderErrorSentence('not_found'), 'Order not found.');
    assert.strictEqual(orderErrorSentence(undefined), 'Something went wrong.');
  });
});
