export const STORAGE_KEYS = {
  CART: 'client_storefront_cart',
  WISHLIST: 'client_storefront_wishlist',
  THEME: 'client_storefront_theme',
  PHONE_COUNTRY: 'client_phone_country',
};

export const BREAKPOINTS = {
  SM: 521,
  MD: 821,
  LG: 1101,
};

export const ROUTES = {
  HOME: '/',
  SHOP: '/shop',
  CATEGORIES: '/categories',
  SEASONS: '/seasons',
  WISHLIST: '/wishlist',
  CART: '/cart',
  ACCOUNT: '/account',
  LOGIN: '/login',
  ACCOUNT_PROFILE: '/account/profile',
  ACCOUNT_SECURITY: '/account/security',
  ACCOUNT_DELETE: '/account/delete',
  ADDRESS_NEW: '/account/addresses/new',
  ACCOUNT_ADDRESSES: '/account/addresses',
  ACCOUNT_NOTIFICATIONS: '/account/notifications',
  ORDERS: '/orders',
  RETURNS: '/returns',
  RETURN_NEW: '/returns/new',
  SEARCH: '/search',
  ABOUT: '/about',
  CONTACT: '/contact',
  POLICY_SHIPPING: '/policies/shipping',
  POLICY_RETURNS: '/policies/returns',
  POLICY_PRIVACY: '/policies/privacy',
  POLICY_TERMS: '/policies/terms',
};

export const addressEditRoute = (id) => `/account/addresses/${encodeURIComponent(id)}`;
export const orderRoute = (id) => `/orders/${encodeURIComponent(id)}`;
export const returnRequestRoute = (orderId) => `/returns/new?order=${encodeURIComponent(orderId)}`;

/** Builds the tracking route for an order. */
export const orderTrackRoute = (orderId) => `/orders/${encodeURIComponent(orderId)}/track`;
