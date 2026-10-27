export const SHIPMENT_STATUS_LABELS = {
  pending: 'Pending',
  packed: 'Packed',
  shipped: 'Shipped',
  out_for_delivery: 'Out for delivery',
  delivered: 'Delivered',
};

export const shipmentStatusLabel = (status) => SHIPMENT_STATUS_LABELS[status] ?? status;

export function shipmentStatusTone(status) {
  if (status === 'delivered') return 'success';
  if (status === 'out_for_delivery') return 'info';
  if (status === 'shipped') return 'brand';
  if (status === 'packed') return 'warning';
  return 'neutral';
}
