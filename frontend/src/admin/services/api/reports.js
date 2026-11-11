import { ordersMock } from '../../data/orders.mock';

const delay = (value) => new Promise((resolve) => setTimeout(() => resolve(value), 120));
const EXCLUDED_STATUSES = new Set(['cancelled', 'returned']);
const STATUS_LABELS = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  packed: 'Packed',
  shipped: 'Shipped',
  out_for_delivery: 'Out for delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  returned: 'Returned',
};
const RANGE_DAYS = { '7d': 7, '30d': 30, '90d': 90 };

function dayLabel(date) {
  return new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short' }).format(date);
}

export async function getSalesReport({ range = '30d' } = {}) {
  const sortedOrders = [...ordersMock].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const latestDate = sortedOrders.length ? new Date(sortedOrders[sortedOrders.length - 1].createdAt) : new Date();
  const rangeDays = RANGE_DAYS[range];
  const startDate = rangeDays ? new Date(latestDate.getTime() - (rangeDays - 1) * 86400000) : new Date(sortedOrders[0]?.createdAt || latestDate);
  const orders = sortedOrders.filter((order) => new Date(order.createdAt) >= startDate && new Date(order.createdAt) <= latestDate);
  const validOrders = orders.filter((order) => !EXCLUDED_STATUSES.has(order.status));
  const revenue = validOrders.reduce((total, order) => total + order.amounts.total, 0);
  const discounts = validOrders.reduce((total, order) => total + order.amounts.discount, 0);
  const items = validOrders.reduce((total, order) => total + order.items.reduce((count, item) => count + item.qty, 0), 0);
  const dailySales = Array.from({ length: rangeDays || Math.max(1, Math.ceil((latestDate - startDate) / 86400000) + 1) }, (_, index) => {
    const date = new Date(startDate.getTime() + index * 86400000);
    const dayOrders = validOrders.filter((order) => order.createdAt.slice(0, 10) === date.toISOString().slice(0, 10));
    return { label: dayLabel(date), value: dayOrders.reduce((total, order) => total + order.amounts.total, 0) };
  });
  const statusCounts = Object.entries(STATUS_LABELS).map(([key, label]) => ({
    key, label, count: orders.filter((order) => order.status === key).length,
  })).filter((item) => item.count);
  const paymentCounts = [...new Set(orders.map((order) => order.paymentMethod.label))].map((label) => ({
    label, count: orders.filter((order) => order.paymentMethod.label === label).length,
  })).sort((a, b) => b.count - a.count);
  const productMap = new Map();
  validOrders.forEach((order) => order.items.forEach((item) => {
    const current = productMap.get(item.productId) || { name: item.name, units: 0, revenue: 0 };
    current.units += item.qty;
    current.revenue += item.total;
    productMap.set(item.productId, current);
  }));
  const topProducts = [...productMap.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  const categoryMap = new Map();
  validOrders.forEach((order) => order.items.forEach((item) => {
    const category = item.name.split(' ')[1] || 'Other';
    categoryMap.set(category, (categoryMap.get(category) || 0) + item.total);
  }));
  const categories = [...categoryMap.entries()].map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value).slice(0, 5);

  return delay({
    range,
    startDate: startDate.toISOString(),
    endDate: latestDate.toISOString(),
    summary: {
      revenue,
      orders: orders.length,
      averageOrderValue: validOrders.length ? Math.round(revenue / validOrders.length) : 0,
      items,
      discounts,
    },
    dailySales,
    statusCounts,
    paymentCounts,
    topProducts,
    categories,
  });
}
