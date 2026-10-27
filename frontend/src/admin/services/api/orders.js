import { ordersMock } from '../../data/orders.mock';

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

export async function getOrder(id) {
  return delay(ordersMock.find((order) => order.id === String(id)) ?? null);
}

export async function getOrderCounts() {
  const pendingOrdersCount = ordersMock.filter((order) => ['pending', 'confirmed', 'packed'].includes(order.status)).length;
  return delay({ pendingOrdersCount });
}

export async function createOrder(payload) {
  const order = { ...payload, id: `draft-${Date.now()}`, number: `ORD-${Date.now()}` };
  ordersMock.unshift(order);
  return delay(order);
}

export async function updateOrder(id, payload) {
  const current = ordersMock.find((order) => order.id === String(id));
  if (!current) return delay(null);
  Object.assign(current, payload);
  return delay(current);
}

export async function updateOrderStatus(id, status, options = {}) {
  const current = ordersMock.find((order) => order.id === String(id));
  if (!current) return delay(null);
  const history = [...current.history, { status, note: options.note ?? '', by: 'Owner', at: new Date().toISOString() }];
  return updateOrder(id, { status, history });
}

export async function bulkUpdateStatus(ids, status) {
  return delay({ updated: ids.length, status });
}

export async function deleteOrder(id) {
  return delay({ deleted: Boolean(id) });
}

export async function bulkDelete(ids) {
  return delay({ deleted: ids.length });
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
