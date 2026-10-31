import { ROUTES } from './constants';

/** Quick action tiles under the profile card. */
export const QUICK_ACTIONS = [
  { id: 'orders', labelKey: 'account.quick.orders', to: ROUTES.ORDERS, icon: 'package' },
  { id: 'track', labelKey: 'account.quick.track', to: ROUTES.ORDERS, icon: 'truck' },
  { id: 'returns', labelKey: 'account.quick.returns', to: ROUTES.RETURNS, icon: 'undo' },
  { id: 'wishlist', labelKey: 'account.quick.wishlist', to: ROUTES.WISHLIST, icon: 'heart' },
];

/** Icon shown in the order status pill, keyed by order status. */
export const ORDER_STATUS_ICONS = {
  placed: 'package',
  packed: 'package',
  shipped: 'truck',
  out_for_delivery: 'truck',
  delivered: 'check',
};

/**
 * Menu sections. An item has either `to` (in-app route) or `external: 'whatsapp'`
 * (resolved at render time from store settings).
 */
export const ACCOUNT_SECTIONS = [
  {
    id: 'my-account',
    titleKey: 'account.sections.myAccount',
    items: [
      { id: 'personal', labelKey: 'account.menu.personal', to: ROUTES.ACCOUNT_PROFILE, icon: 'user' },
      { id: 'addresses', labelKey: 'account.menu.addresses', to: ROUTES.ACCOUNT_ADDRESSES, icon: 'map-pin' },
      { id: 'notifications', labelKey: 'account.menu.notifications', to: ROUTES.ACCOUNT_NOTIFICATIONS, icon: 'bell' },
      { id: 'security', labelKey: 'account.menu.security', to: ROUTES.ACCOUNT_SECURITY, icon: 'lock' },
    ],
  },
  {
    id: 'help',
    titleKey: 'account.sections.help',
    items: [
      { id: 'contact', labelKey: 'account.menu.contact', to: ROUTES.CONTACT, icon: 'phone' },
      { id: 'whatsapp', labelKey: 'account.menu.whatsapp', external: 'whatsapp', icon: 'message-circle' },
      { id: 'about', labelKey: 'account.menu.about', to: ROUTES.ABOUT, icon: 'info' },
      { id: 'shipping', labelKey: 'account.menu.shipping', to: ROUTES.POLICY_SHIPPING, icon: 'truck' },
      { id: 'returns', labelKey: 'account.menu.returns', to: ROUTES.POLICY_RETURNS, icon: 'undo' },
      { id: 'privacy', labelKey: 'account.menu.privacy', to: ROUTES.POLICY_PRIVACY, icon: 'shield-check' },
      { id: 'terms', labelKey: 'account.menu.terms', to: ROUTES.POLICY_TERMS, icon: 'file-text' },
    ],
  },
];
