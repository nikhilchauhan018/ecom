/**
 * Mock white-label store settings data.
 * @type {import('../types/settings').Settings}
 */
export const mockSettings = {
  storeName: 'Aura Threads',
  brandColor: '#17332c',
  currency: 'USD',
  locale: 'en-US',
  currencyDisplay: 'narrowSymbol',
  supportPhone: '+1 (800) 555-0199',
  logo: {
    src: null,
    alt: 'Aura Threads',
  },
  seo: {
    title: 'Aura Threads | Fresh Styles for the New Season',
    description: 'Explore conscious apparel, breathable linens, cotton kurtis, and curated seasonal collections.',
    ogImage: null,
  },
  social: [
    { platform: 'Instagram', url: 'https://instagram.com/aurathreads' },
    { platform: 'Facebook', url: 'https://facebook.com/aurathreads' },
  ],
};

export default mockSettings;
