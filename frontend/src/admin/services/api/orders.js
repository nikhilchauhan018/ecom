import { ordersMock, paymentMethods } from '../../data/orders.mock';
import { deriveFormOptions } from '../../features/orders/orderFormOptions';
import {
  OrderError,
  bulkChangeStatus,
  changeStatus,
  removeOrders,
  stripProtectedFields,
} from '../../features/orders/orderActions';

const delay = (value) => new Promise((resolve) => setTimeout(() => resolve(value), 120));

export async function listOrders({
  page = 1, pageSize = 10, search = '', sort = 'createdAt', order = 'desc',
  status, paymentStatus, paymentMethod, dateFrom, dateTo, amountMin, amountMax, customer,
} = {}) {
  const query = search.trim().toLowerCase();
  const customerQuery = String(customer || '').trim().toLowerCase();
  const normalizedPage = Math.max(1, Number(page) || 1);
  const normalizedPageSize = Math.max(1, Number(pageSize) || 10);
  const filtered = ordersMock.filter((item) => {
    const searchable = `${item.id} ${item.number} ${item.customer.name} ${item.customer.email} ${item.customer.phone}`.toLowerCase();
    const createdAt = item.createdAt.slice(0, 10);
    return (!query || searchable.includes(query))
      && (!customerQuery || `${item.customer.name} ${item.customer.email} ${item.customer.phone}`.toLowerCase().includes(customerQuery))
      && (!status || item.status === status)
      && (!paymentStatus || item.paymentStatus === paymentStatus)
      && (!paymentMethod || item.paymentMethod.code === paymentMethod)
      && (!dateFrom || createdAt >= dateFrom)
      && (!dateTo || createdAt <= dateTo)
      && (amountMin === undefined || amountMin === '' || item.amounts.total >= Number(amountMin))
      && (amountMax === undefined || amountMax === '' || item.amounts.total <= Number(amountMax));
  }).sort((left, right) => {
    const a = left[sort] ?? left.amounts[sort] ?? left.customer[sort];
    const b = right[sort] ?? right.amounts[sort] ?? right.customer[sort];
    return (a > b ? 1 : a < b ? -1 : 0) * (order === 'asc' ? 1 : -1);
  });
  const start = (normalizedPage - 1) * normalizedPageSize;
  return delay({
    data: filtered.slice(start, start + normalizedPageSize),
    meta: { page: normalizedPage, pageSize: normalizedPageSize, total: filtered.length, totalPages: Math.ceil(filtered.length / normalizedPageSize) },
  });
}

/** Payment methods an order can use, as `{ code, label }[]`. */
export async function listPaymentMethods() {
  return delay(paymentMethods.map((method) => ({ ...method })));
}

/** Everything the create/edit order form needs to fill its pickers: `{ paymentMethods, customers, products }`. */
export async function getOrderFormOptions() {
  return delay({ paymentMethods: paymentMethods.map((method) => ({ ...method })), ...deriveFormOptions(ordersMock) });
}

export async function getOrder(id) {
  return delay(ordersMock.find((order) => order.id === String(id)) ?? null);
}

export async function getOrderCounts() {
  const pendingOrdersCount = ordersMock.filter((order) => ['pending', 'confirmed', 'packed'].includes(order.status)).length;
  return delay({ pendingOrdersCount });
}

export async function createOrder(payload) {
  const customer = payload?.customer;
  if (!customer?.name || !customer?.email || !Array.isArray(payload?.items) || payload.items.length === 0) {
    throw new OrderError('invalid_order');
  }
  // A new order always starts as pending with a fresh history, whatever the client sent.
  const order = {
    ...stripProtectedFields(payload),
    id: `draft-${Date.now()}`,
    number: `ORD-${Date.now()}`,
    createdAt: new Date().toISOString(),
    status: 'pending',
    history: [],
  };
  ordersMock.unshift(order);
  return delay(order);
}

/** Generic edit. Identity and workflow fields are ignored: use updateOrderStatus to change status. */
export async function updateOrder(id, payload) {
  const current = ordersMock.find((order) => order.id === String(id));
  if (!current) return delay(null);
  Object.assign(current, stripProtectedFields(payload));
  return delay(current);
}

/** Resolves to the updated order, or null when the order does not exist. Rejects with OrderError for rule violations. */
export async function updateOrderStatus(id, status, options = {}) {
  const result = changeStatus(ordersMock, id, status, { note: options.note });
  if (result.ok) return delay(result.order);
  if (result.code === 'not_found') return delay(null);
  throw new OrderError(result.code);
}

/** Per-order outcome: `{ updated: string[], failed: { id, code }[] }`. Rejects only for a bad request as a whole. */
export async function bulkUpdateStatus(ids, status) {
  return delay(bulkChangeStatus(ordersMock, ids, status));
}

/** `{ deleted: boolean, code?: string }` */
export async function deleteOrder(id) {
  const { deleted, failed } = removeOrders(ordersMock, [id]);
  return delay(deleted.length ? { deleted: true } : { deleted: false, code: failed[0].code });
}

/** Per-order outcome: `{ deleted: string[], failed: { id, code }[] }` */
export async function bulkDelete(ids) {
  return delay(removeOrders(ordersMock, ids));
}

export async function refundOrder(id, payload) {
  const current = ordersMock.find((order) => order.id === String(id));
  if (!current) return delay(null);
  return updateOrder(id, { paymentStatus: payload.amount < current.amounts.total ? 'partially_refunded' : 'refunded' });
}

export async function addOrderNote(id, text) {
  const current = ordersMock.find((order) => order.id === String(id));
  if (!current) return delay(null);
  const note = { id: `note-${Date.now()}`, text, by: 'Owner', at: new Date().toISOString() };
  return updateOrder(id, { notes: [...current.notes, note] });
}
