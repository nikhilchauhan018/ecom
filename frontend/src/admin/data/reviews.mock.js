import { ordersMock } from './orders.mock';

const reviewStatuses = ['published', 'pending', 'rejected'];
const reviewTitles = ['Great quality', 'Good value', 'Exactly as expected', 'Needs improvement'];

export const reviewsMock = ordersMock.map((order, index) => {
  const item = order.items[0];
  return {
    id: `review-${order.id}`,
    productId: item.productId,
    productName: item.name,
    orderId: order.id,
    customer: order.customer,
    rating: (index % 5) + 1,
    title: reviewTitles[index % reviewTitles.length],
    body: index % 3 === 0 ? 'The product arrived on time and matched the description.' : 'The product is suitable for everyday use.',
    status: reviewStatuses[index % reviewStatuses.length],
    createdAt: order.createdAt,
  };
});

export { reviewStatuses };
