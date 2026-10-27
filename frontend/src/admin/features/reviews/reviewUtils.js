export const REVIEW_STATUS_LABELS = {
  published: 'Published',
  pending: 'Pending',
  rejected: 'Rejected',
};

export const REVIEW_RATINGS = [5, 4, 3, 2, 1];

export const reviewStatusLabel = (status) => REVIEW_STATUS_LABELS[status] ?? status;

export function reviewStatusTone(status) {
  if (status === 'published') return 'ok';
  if (status === 'rejected') return 'bad';
  return 'wait';
}

export function validateReview({ rating, title, body }) {
  const errors = {};
  if (!Number.isInteger(Number(rating)) || Number(rating) < 1 || Number(rating) > 5) errors.rating = 'Rating must be between 1 and 5.';
  if (!String(title || '').trim()) errors.title = 'Title is required.';
  if (!String(body || '').trim()) errors.body = 'Review text is required.';
  return errors;
}
