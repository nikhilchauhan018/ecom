import { ordersMock } from './orders.mock';

const shipmentStatuses = ['pending', 'packed', 'shipped', 'out_for_delivery', 'delivered'];

const statusForOrder = (order) => {
  if (order.status === 'cancelled' || order.status === 'returned') return null;
  return shipmentStatuses.includes(order.status) ? order.status : 'pending';
};

export const shipmentsMock = ordersMock
  .map((order) => {
    const status = statusForOrder(order);
    if (!status) return null;
    return {
      id: `SHP-${order.id}`,
      orderId: order.id,
      orderNumber: order.number,
      createdAt: order.createdAt,
      status,
      courier: order.delivery.courier,
      trackingNumber: order.delivery.trackingNumber,
      trackingUrl: order.delivery.trackingUrl,
      estimatedDate: order.delivery.estimatedDate,
      customer: order.customer,
      shippingAddress: order.shippingAddress,
      itemCount: order.items.reduce((total, item) => total + item.qty, 0),
    };
  })
  .filter(Boolean);

export { shipmentStatuses };
