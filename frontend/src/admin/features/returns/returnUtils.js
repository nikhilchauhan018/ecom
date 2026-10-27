export const RETURN_STATUS_LABELS = {
  requested: 'Requested',
  approved: 'Approved',
  received: 'Received',
  refunded: 'Refunded',
  rejected: 'Rejected',
};

export const returnStatusLabel = (status) => RETURN_STATUS_LABELS[status] ?? status;

export function returnStatusTone(status) {
  if (status === 'refunded' || status === 'received') return 'ok';
  if (status === 'rejected') return 'bad';
  return 'wait';
}
