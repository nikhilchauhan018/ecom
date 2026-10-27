export const DISCOUNT_STATUS_LABELS = {
  active: 'Active',
  scheduled: 'Scheduled',
  expired: 'Expired',
  disabled: 'Disabled',
};

export const DISCOUNT_TYPE_LABELS = {
  percentage: 'Percentage',
  fixed: 'Fixed amount',
};

export const discountStatusLabel = (status) => DISCOUNT_STATUS_LABELS[status] ?? status;

export function discountStatusTone(status) {
  if (status === 'active') return 'ok';
  if (status === 'expired' || status === 'disabled') return 'bad';
  return 'wait';
}

export function validateDiscount({ code, name, type, value, usageLimit }) {
  const errors = {};
  if (!String(code || '').trim()) errors.code = 'Code is required.';
  if (!String(name || '').trim()) errors.name = 'Name is required.';
  if (!DISCOUNT_TYPE_LABELS[type]) errors.type = 'Type is invalid.';
  if (!Number.isFinite(Number(value)) || Number(value) <= 0) errors.value = 'Value must be greater than zero.';
  if (type === 'percentage' && Number(value) > 100) errors.value = 'Percentage cannot exceed 100.';
  if (!Number.isInteger(Number(usageLimit)) || Number(usageLimit) < 0) errors.usageLimit = 'Usage limit must be zero or greater.';
  return errors;
}
