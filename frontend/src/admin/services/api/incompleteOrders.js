import { incompleteOrdersMock } from '../../data/incompleteOrders.mock.js';
import { queryIncompleteOrders, removeIncompleteOrders } from '../../features/incomplete-orders/incompleteOrderQuery.js';

const delay = (value) => new Promise((resolve) => setTimeout(() => resolve(value), 120));

/**
 * One page of incomplete orders (future: GET /admin/incomplete-orders).
 * Query: `page, pageSize, search, sort, order, dateFrom, dateTo, amountMin, amountMax`.
 * Resolves to `{ data, meta: { page, pageSize, total, totalPages } }` (copies, never the source objects).
 */
export async function listIncompleteOrders(query = {}) {
  return delay(structuredClone(queryIncompleteOrders(incompleteOrdersMock, query)));
}

/** One record with its items, or `null` when it does not exist. */
export async function getIncompleteOrder(id) {
  const found = incompleteOrdersMock.find((record) => String(record.id) === String(id));
  return delay(found ? structuredClone(found) : null);
}

/**
 * Deletes records (future: POST /admin/incomplete-orders/bulk-delete). Per-record outcome:
 * `{ deleted: string[], failed: { id, code }[] }`. Rejects with IncompleteOrderError for a bad request as a whole.
 */
export async function deleteIncompleteOrders(ids) {
  return delay(removeIncompleteOrders(incompleteOrdersMock, ids));
}
