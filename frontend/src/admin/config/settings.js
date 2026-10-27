// Store-owned display settings. These will be replaced by the settings endpoint.
export const storeSettings = {
  currency: 'INR',
  locale: 'en-IN',
  taxName: 'GST',
};

export function getStoreSettings() {
  return storeSettings;
}
