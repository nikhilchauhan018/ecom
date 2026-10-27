export const SHIPPING_STATUS_LABELS = {
  active: 'Active',
  draft: 'Draft',
};

export const shippingStatusLabel = (status) => SHIPPING_STATUS_LABELS[status] ?? status;

export function shippingStatusTone(status) {
  return status === 'active' ? 'ok' : 'wait';
}

export function validateShippingMethod({ name, carrier, deliveryTime, price }) {
  const errors = {};
  if (!String(name || '').trim()) errors.name = 'Method name is required.';
  if (!String(carrier || '').trim()) errors.carrier = 'Carrier is required.';
  if (!String(deliveryTime || '').trim()) errors.deliveryTime = 'Delivery time is required.';
  if (!Number.isFinite(Number(price)) || Number(price) < 0) errors.price = 'Price must be zero or greater.';
  return errors;
}
