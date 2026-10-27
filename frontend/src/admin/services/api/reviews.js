import { reviewsMock } from '../../data/reviews.mock';

const delay = (value) => new Promise((resolve) => setTimeout(() => resolve(value), 120));

export async function listReviews({ search = '', status = '', rating = '' } = {}) {
  const query = String(search).trim().toLowerCase();
  const data = reviewsMock.filter((review) => {
    const searchable = `${review.productName} ${review.customer.name} ${review.customer.email} ${review.title} ${review.body}`.toLowerCase();
    return (!query || searchable.includes(query))
      && (!status || review.status === status)
      && (!rating || review.rating === Number(rating));
  });
  return delay({ data, meta: { total: data.length } });
}

export async function getReview(id) {
  return delay(reviewsMock.find((review) => review.id === String(id)) ?? null);
}
