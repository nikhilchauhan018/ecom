import { ORDER_STATUSES, canDelete, canTransition, orderErrorMessage } from './orderStatus.js';

/**
 * Pure order mutations over an array of orders. The mock service calls these on `ordersMock`;
 * a real backend does the equivalent in a transaction. Kept free of imports from data/ so it can be unit tested.
 */

export const MAX_BULK = 200;

export class OrderError extends Error {
  constructor(code) {
    super(code);
    this.name = 'OrderError';
    this.code = code;
  }
}

const hasOwn = (object, key) => Object.prototype.hasOwnProperty.call(object, key);

/** Unique string ids; non-arrays become []. */
export function normalizeIds(ids) {
  if (!Array.isArray(ids)) return [];
  return [...new Set(ids.map(String))];
}

function assertBulkSize(ids) {
  if (ids.length === 0) throw new OrderError('empty_selection');
  if (ids.length > MAX_BULK) throw new OrderError('too_many');
}

/**
 * Moves one order to a new status, recording history.
 * @returns {{ ok: true, order: object } | { ok: false, code: string }}
 */
export function changeStatus(list, id, status, { note = '', by = 'Owner', at = new Date().toISOString() } = {}) {
  const order = list.find((item) => item.id === String(id));
  if (!order) return { ok: false, code: 'not_found' };
  if (typeof status !== 'string' || !hasOwn(ORDER_STATUSES, status)) return { ok: false, code: 'invalid_status' };
  if (!canTransition(order.status, status)) return { ok: false, code: 'invalid_transition' };

  order.history = [...(order.history || []), { status, note: String(note ?? '').slice(0, 500), by, at }];
  order.status = status;
  return { ok: true, order };
}

/** @returns {{ updated: string[], failed: { id: string, code: string }[] }} */
export function bulkChangeStatus(list, ids, status, options) {
  const unique = normalizeIds(ids);
  assertBulkSize(unique);
  if (typeof status !== 'string' || !hasOwn(ORDER_STATUSES, status)) throw new OrderError('invalid_status');

  const updated = [];
  const failed = [];
  for (const id of unique) {
    const result = changeStatus(list, id, status, options);
    if (result.ok) updated.push(id);
    else failed.push({ id, code: result.code });
  }
  return { updated, failed };
}

/**
 * Deletes orders from `list` in place. Only orders that pass `canDelete` are removed.
 * @returns {{ deleted: string[], failed: { id: string, code: string }[] }}
 */
export function removeOrders(list, ids) {
  const unique = normalizeIds(ids);
  assertBulkSize(unique);

  const deleted = [];
  const failed = [];
  for (const id of unique) {
    const index = list.findIndex((item) => item.id === id);
    if (index === -1) failed.push({ id, code: 'not_found' });
    else if (!canDelete(list[index].status)) failed.push({ id, code: 'not_deletable' });
    else {
      list.splice(index, 1);
      deleted.push(id);
    }
  }
  return { deleted, failed };
}

/** Identity and workflow fields that a generic update must never overwrite. */
export const PROTECTED_ORDER_FIELDS = ['id', 'number', 'createdAt', 'status', 'history'];

export function stripProtectedFields(payload) {
  const safe = { ...(payload || {}) };
  PROTECTED_ORDER_FIELDS.forEach((field) => delete safe[field]);
  return safe;
}

/** One human sentence for a bulk result, e.g. "3 orders updated. 2 skipped: ...". */
export function summarizeBulk({ done, failed, verb }) {
  const text = [];
  if (done) text.push(`${done} ${done === 1 ? 'order' : 'orders'} ${verb}.`);

  const byCode = {};
  failed.forEach(({ code }) => { byCode[code] = (byCode[code] || 0) + 1; });
  Object.entries(byCode).forEach(([code, count]) => {
    text.push(`${count} skipped: ${orderErrorMessage(code)}`);
  });

  return { tone: failed.length ? (done ? 'warning' : 'error') : 'success', text: text.join(' ') };
}
