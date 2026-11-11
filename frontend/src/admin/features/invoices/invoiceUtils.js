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
  const safePart = (value) => String(value ?? '').trim().replace(/[\\/:*?"<>|]+/g, '-');
  return `${safePart(invoice.id) || 'invoice'}-${safePart(invoice.orderNumber) || 'order'}.pdf`;
}

export function invoiceDateLabel(value, locale = 'en-IN') {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : new Intl.DateTimeFormat(locale).format(date);
}

export function invoiceAddressLines(address = {}) {
  return [
    address.name,
    address.line1,
    [address.city, address.region].filter(Boolean).join(', '),
    [address.postalCode, address.country].filter(Boolean).join(', '),
  ].filter(Boolean);
}
