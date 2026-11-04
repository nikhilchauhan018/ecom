export const ORDER_STATUSES = {
  pending: { label: 'Pending', tone: 'wait', icon: 'clock' },
  confirmed: { label: 'Confirmed', tone: 'ok', icon: 'check' },
  packed: { label: 'Packed', tone: 'ok', icon: 'box' },
  shipped: { label: 'Shipped', tone: 'ok', icon: 'truck' },
  out_for_delivery: { label: 'Out for delivery', tone: 'wait', icon: 'truck' },
  delivered: { label: 'Delivered', tone: 'ok', icon: 'check' },
  cancelled: { label: 'Cancelled', tone: 'bad', icon: 'close' },
  returned: { label: 'Returned', tone: 'bad', icon: 'close' },
};

export const PAYMENT_STATUSES = ['pending', 'completed', 'failed', 'refunded', 'partially_refunded'];

/*
 * Status rules (business assumptions, adjust here and nowhere else):
 *  - Orders move forward along ORDER_FLOW. Skipping ahead is allowed (e.g. pending -> delivered for a
 *    counter sale), going backwards is not.
 *  - Cancelling is only possible before the parcel ships.
 *  - A delivered order can become "returned". Cancelled and returned are final.
 *  - Only pending or cancelled orders may be deleted: anything further along is a financial record.
 * The real backend must enforce the same rules; this file only mirrors them for the UI and the mock.
 */
export const ORDER_FLOW = ['pending', 'confirmed', 'packed', 'shipped', 'out_for_delivery', 'delivered'];
export const CANCELLABLE_STATUSES = ['pending', 'confirmed', 'packed'];
export const DELETABLE_STATUSES = ['pending', 'cancelled'];
export const BULK_STATUSES = ['confirmed', 'packed', 'shipped', 'delivered', 'cancelled'];

/** Statuses an order in `current` may move to. */
export function allowedNextStatuses(current) {
  const index = ORDER_FLOW.indexOf(current);
  const next = index === -1 ? [] : ORDER_FLOW.slice(index + 1);
  if (CANCELLABLE_STATUSES.includes(current)) next.push('cancelled');
  if (current === 'delivered') next.push('returned');
  return next;
}

export const canTransition = (from, to) => allowedNextStatuses(from).includes(to);
export const canDelete = (status) => DELETABLE_STATUSES.includes(status);

const ORDER_ERRORS = {
  not_found: 'order not found.',
  invalid_status: 'unknown status.',
  invalid_transition: 'status change not allowed from the current status.',
  not_deletable: 'only pending or cancelled orders can be deleted.',
  too_many: 'too many orders selected at once.',
  empty_selection: 'no orders selected.',
  invalid_order: 'an order needs a customer name, an email and at least one item.',
};

/** Lower-case clause, for use after a colon: "2 skipped: order not found." */
export function orderErrorMessage(code) {
  return ORDER_ERRORS[code] || 'something went wrong.';
}

/** Same message as a standalone sentence. */
export function orderErrorSentence(code) {
  const message = orderErrorMessage(code);
  return message.charAt(0).toUpperCase() + message.slice(1);
}
