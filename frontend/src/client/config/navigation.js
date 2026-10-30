import { ROUTES } from './constants';

export const BOTTOM_TABS = [
  { id: 'home', labelKey: 'nav.home', to: ROUTES.HOME, icon: 'home' },
  { id: 'shop', labelKey: 'nav.shop', to: ROUTES.SHOP, icon: 'grid' },
  { id: 'wishlist', labelKey: 'nav.wishlist', to: ROUTES.WISHLIST, icon: 'heart' },
  { id: 'cart', labelKey: 'nav.cart', to: ROUTES.CART, icon: 'shopping-bag', badge: true },
];
