import { ordersMock } from './orders.mock';

const invoiceStatus = (order) => {
  if (order.paymentStatus === 'refunded' || order.paymentStatus === 'partially_refunded') return 'refunded';
  return order.paymentStatus === 'completed' ? 'paid' : 'pending';
};

export const invoicesMock = ordersMock.map((order) => ({
  id: `INV-${order.id}`,
  orderId: order.id,
  orderNumber: order.number,
  issueDate: order.createdAt,
  status: invoiceStatus(order),
  customer: order.customer,
  billingAddress: order.billingAddress,
  shippingAddress: order.shippingAddress,
  paymentMethod: order.paymentMethod,
  items: order.items,
  amounts: order.amounts,
  itemCount: order.items.reduce((total, item) => total + item.qty, 0),
}));
