import { getStoreSettings } from '../config/settings';

export function formatMoney(amount, settings = getStoreSettings()) {
  return new Intl.NumberFormat(settings.locale, {
    style: 'currency',
    currency: settings.currency,
    maximumFractionDigits: 0,
  }).format(amount);
}
