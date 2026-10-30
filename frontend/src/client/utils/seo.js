/**
 * Safely escapes JSON string for safe embedding into HTML <script> tags.
 * Replaces '<' with '\u003c' to prevent XSS breakout.
 * @param {object} data
 * @returns {string}
 */
export function safeJsonLd(data) {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

/**
 * Builds schema.org Organization and WebSite structured data with SearchAction.
 * @param {import('../types/settings').Settings} settings
 * @param {string} [baseUrl='https://aurathreads.com']
 * @returns {object[]}
 */
export function buildHomeJsonLd(settings, baseUrl = 'https://aurathreads.com') {
  const storeName = settings?.storeName || 'Aura Threads';
  const url = baseUrl.replace(/\/$/, '');

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: storeName,
    url,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${url}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: storeName,
    url,
    logo: settings?.logo?.src ? `${url}${settings.logo.src}` : undefined,
    contactPoint: settings?.supportPhone
      ? {
          '@type': 'ContactPoint',
          telephone: settings.supportPhone,
          contactType: 'customer support',
        }
      : undefined,
  };

  return [websiteSchema, organizationSchema];
}
