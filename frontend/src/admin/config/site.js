// Client-specific values live here, not inside components.
const safeUrl = (u) => (/^https?:\/\//i.test(u || '') ? u : '/'); // never allow javascript: / data: URLs

export const site = {
  name: '[YOUR STORE]',
  storeUrl: safeUrl(import.meta.env.VITE_STORE_URL),
  owner: { name: '[OWNER NAME]', email: '[EMAIL]' },
};
