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
