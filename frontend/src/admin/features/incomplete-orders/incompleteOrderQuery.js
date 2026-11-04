import { escapeCsvCell } from '../products/productUtils.js';

/**
 * Pure logic for incomplete orders (checkouts that were started but never paid for).
 * The mock service runs these over `incompleteOrdersMock`; a real backend does the same in SQL.
 * Kept free of imports from data/ so it can be unit tested.
 */

export const MAX_BULK = 200;
export const MAX_PAGE_SIZE = 100;
export const SORT_FIELDS = ['id', 'customer', 'amount', 'createdAt'];

export const INCOMPLETE_ORDER_ERRORS = {
  invalid_selection: 'Select at least one record.',
  too_many: `Select at most ${MAX_BULK} records at a time.`,
  not_found: 'This record no longer exists.',
};

export class IncompleteOrderError extends Error {
  constructor(code) {
    super(code);
    this.name = 'IncompleteOrderError';
    this.code = code;
  }
}

export function incompleteOrderErrorSentence(code) {
  return INCOMPLETE_ORDER_ERRORS[code] || 'Something went wrong.';
}

const text = (value) => String(value ?? '').trim().toLowerCase();
const day = (record) => record.createdAt.slice(0, 10);
// An empty or non-numeric filter means "no filter", never "0".
const bound = (value) => (String(value ?? '').trim() === '' || Number.isNaN(Number(value)) ? null : Number(value));

function sortValue(record, field) {
  if (field === 'customer') return text(record.customer.name);
  if (field === 'amount') return record.amount;
  if (field === 'createdAt') return record.createdAt;
  return record.id;
}

/**
 * Filters, sorts and paginates. Never changes `records`.
 * Returns `{ data, meta: { page, pageSize, total, totalPages } }`. A page past the end gives empty `data`
 * with the real `totalPages` (the screen then jumps to the last page).
 */
export function queryIncompleteOrders(records, query = {}) {
  const {
    page = 1, pageSize = 10, search = '', sort = 'id', order = 'desc',
    dateFrom = '', dateTo = '', amountMin = '', amountMax = '',
  } = query;
  const needle = text(search);
  const min = bound(amountMin);
  const max = bound(amountMax);
  const field = SORT_FIELDS.includes(sort) ? sort : 'id';
  const direction = order === 'asc' ? 1 : -1;

  const matching = records.filter((record) => (
    (!needle || `${record.id} ${record.customer.name} ${record.customer.email}`.toLowerCase().includes(needle))
    && (!dateFrom || day(record) >= dateFrom)
    && (!dateTo || day(record) <= dateTo)
    && (min === null || record.amount >= min)
    && (max === null || record.amount <= max)
  ));

  const sorted = [...matching].sort((left, right) => {
    const a = sortValue(left, field);
    const b = sortValue(right, field);
    const byField = a > b ? 1 : a < b ? -1 : 0;
    return byField * direction || right.id - left.id;
  });

  const size = Math.min(MAX_PAGE_SIZE, Math.max(1, Number(pageSize) || 10));
  const current = Math.max(1, Number(page) || 1);
  const start = (current - 1) * size;
  return {
    data: sorted.slice(start, start + size),
    meta: { page: current, pageSize: size, total: sorted.length, totalPages: Math.ceil(sorted.length / size) },
  };
}

/** Message for an impossible filter range (from after to, minimum above maximum), or '' when the filters are fine. */
export function validateFilters({ dateFrom = '', dateTo = '', amountMin = '', amountMax = '' } = {}) {
  if (dateFrom && dateTo && dateFrom > dateTo) return 'The start date must be on or before the end date.';
  const min = bound(amountMin);
  const max = bound(amountMax);
  if (min !== null && max !== null && min > max) return 'The minimum amount must not be above the maximum.';
  return '';
}

/**
 * Deletes records by id from the `records` array (in place: it stands in for a database table).
 * Per-record outcome: `{ deleted: string[], failed: { id, code }[] }`.
 * Throws IncompleteOrderError for a bad request as a whole (empty or oversized selection).
 */
export function removeIncompleteOrders(records, ids) {
  const unique = Array.isArray(ids) ? [...new Set(ids.map(String))] : [];
  if (!unique.length) throw new IncompleteOrderError('invalid_selection');
  if (unique.length > MAX_BULK) throw new IncompleteOrderError('too_many');

  const deleted = [];
  const failed = [];
  for (const id of unique) {
    const index = records.findIndex((record) => String(record.id) === id);
    if (index === -1) {
      failed.push({ id, code: 'not_found' });
    } else {
      records.splice(index, 1);
      deleted.push(id);
    }
  }
  return { deleted, failed };
}

/** Message and tone for the notice shown after a delete. */
export function summarizeDeletion({ deleted, failed }) {
  const parts = [];
  if (deleted.length) parts.push(`${deleted.length} ${deleted.length === 1 ? 'record' : 'records'} deleted.`);
  if (failed.length) parts.push(`${failed.length} skipped: ${incompleteOrderErrorSentence(failed[0].code).toLowerCase()}`);
  return { tone: failed.length ? (deleted.length ? 'warning' : 'error') : 'success', text: parts.join(' ') };
}

/** Customer name for display; guests have none. */
export function customerLabel(record) {
  return record.customer.name.trim() || 'Guest';
}

/** CSV text for the given records. Every cell is quoted and formula-safe. */
export function incompleteOrdersToCsv(records) {
  const rows = [
    ['ID', 'Customer', 'Email', 'Amount', 'Created at'],
    ...records.map((record) => [record.id, record.customer.name, record.customer.email, record.amount, day(record)]),
  ];
  return rows.map((row) => row.map(escapeCsvCell).join(',')).join('\n');
}
