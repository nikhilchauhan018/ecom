import { ordersMock } from './orders.mock';

const customerMap = new Map();

ordersMock.forEach((order) => {
  const current = customerMap.get(order.customer.id) ?? {
    id: order.customer.id,
    ...order.customer,
    status: 'active',
    ordersCount: 0,
    totalSpent: 0,
    lastOrderAt: order.createdAt,
  };
  current.ordersCount += 1;
  current.totalSpent += order.amounts.total;
  if (order.createdAt > current.lastOrderAt) current.lastOrderAt = order.createdAt;
  customerMap.set(order.customer.id, current);
});

export const customersMock = [...customerMap.values()].sort((left, right) => left.name.localeCompare(right.name));
