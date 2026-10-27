export const CUSTOMER_STATUS_LABELS = {
  active: 'Active',
  inactive: 'Inactive',
};

export const customerStatusLabel = (status) => CUSTOMER_STATUS_LABELS[status] ?? status;

export function customerInitials(name) {
  return String(name).trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase() ?? '').join('');
}
