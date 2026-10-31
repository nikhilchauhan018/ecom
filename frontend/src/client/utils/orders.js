export const ACTIVE_STATUSES = ['placed', 'packed', 'shipped', 'out_for_delivery'];
export const TIMELINE_STEPS = ['placed', 'packed', 'shipped', 'out_for_delivery', 'delivered'];
export const RETURN_WINDOW_DAYS = 30;
export const RETURN_REASONS = ['wrong_size', 'defective', 'not_as_described', 'changed_mind', 'other'];

const DAY_MS = 24 * 60 * 60 * 1000;

export function isActiveOrder(order) {
  return ACTIVE_STATUSES.includes(order?.status);
}

/** @param {'all'|'active'|'delivered'|'cancelled'} filter */
export function filterOrders(orders, filter) {
  const list = Array.isArray(orders) ? orders : [];
  switch (filter) {
    case 'active':
      return list.filter(isActiveOrder);
    case 'delivered':
      return list.filter((order) => order.status === 'delivered');
    case 'cancelled':
      return list.filter((order) => order.status === 'cancelled');
    default:
      return list;
  }
}

export function getEventTime(order, status) {
  const event = (order?.timeline || []).find((item) => item.status === status);
  return event ? event.at : null;
}

/** Date after which a delivered order can no longer be returned, or null. */
export function getReturnDeadline(order) {
  const deliveredAt = getEventTime(order, 'delivered');
  if (order?.status !== 'delivered' || !deliveredAt) return null;
  return new Date(new Date(deliveredAt).getTime() + RETURN_WINDOW_DAYS * DAY_MS).toISOString();
}

/**
 * An order can be returned when it is delivered, inside the return window,
 * and has no open/completed return request.
 */
export function isReturnEligible(order, existingReturns = [], now = Date.now()) {
  const deadline = getReturnDeadline(order);
  if (!deadline || new Date(deadline).getTime() < now) return false;
  return !existingReturns.some((item) => item.orderId === order.id && item.status !== 'rejected');
}

export function countItems(order) {
  return (order?.items || []).reduce((sum, item) => sum + item.qty, 0);
}

/**
 * Timeline for the tracking view.
 * @returns {Array<{ status: string, at: string|null, state: 'done'|'current'|'upcoming' }>}
 */
export function buildTimeline(order) {
  const events = order?.timeline || [];
  const at = (status) => events.find((event) => event.status === status)?.at ?? null;

  if (order?.status === 'cancelled') {
    return [
      ...events
        .filter((event) => event.status !== 'cancelled')
        .map((event) => ({ status: event.status, at: event.at, state: 'done' })),
      { status: 'cancelled', at: at('cancelled'), state: 'current' },
    ];
  }

  const reached = TIMELINE_STEPS.indexOf(order?.status);
  return TIMELINE_STEPS.map((status, index) => {
    let state = 'upcoming';
    if (index < reached || (index === reached && status === 'delivered')) state = 'done';
    else if (index === reached) state = 'current';
    return { status, at: at(status), state };
  });
}
