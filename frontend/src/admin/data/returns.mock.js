import { ordersMock } from './orders.mock';

const returnReasons = ['Damaged item', 'Wrong item', 'Changed mind', 'Item not as described'];
const returnStatuses = ['requested', 'approved', 'received', 'refunded', 'rejected'];

export const returnsMock = ordersMock
  .filter((order, index) => order.status === 'returned' || index % 4 === 0)
  .map((order, index) => ({
    id: `RET-${order.id}`,
    orderId: order.id,
    orderNumber: order.number,
    requestedAt: order.createdAt,
    status: order.status === 'returned' ? 'refunded' : returnStatuses[index % returnStatuses.length],
    reason: returnReasons[index % returnReasons.length],
    customer: order.customer,
    amount: order.amounts.total,
    itemCount: order.items.reduce((total, item) => total + item.qty, 0),
  }));

export { returnReasons, returnStatuses };
