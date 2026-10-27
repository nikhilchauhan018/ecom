export const INVOICE_STATUS_LABELS = {
  paid: 'Paid',
  pending: 'Pending',
  refunded: 'Refunded',
};

export const invoiceStatusLabel = (status) => INVOICE_STATUS_LABELS[status] ?? status;

export function invoiceStatusTone(status) {
  if (status === 'paid') return 'success';
  if (status === 'refunded') return 'danger';
  return 'warning';
}

export function invoiceFileName(invoice) {
  return `${invoice.id}-${invoice.orderNumber}.pdf`;
}

export function invoiceAddressLines(address = {}) {
  return [address.name, address.line1, [address.city, address.region].filter(Boolean).join(', '), [address.postalCode, address.country].filter(Boolean).join(', ')].filter(Boolean);
}
