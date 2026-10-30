import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Icon } from '../ui/Icon';
import { useSettings } from '../../hooks/useSettings';
import { useCartCount } from '../../hooks/useCartCount';
import { useWishlist } from '../../hooks/useWishlist';
import { useT } from '../../hooks/useT';
import { cn } from '../../utils/cn';

/**
 * Sticky Desktop Navigation Header (visible on lg: breakpoints and above).
 */
export function DesktopHeader() {
  const settings = useSettings();
  const cartCount = useCartCount();
  const { count: wishlistCount } = useWishlist();
  const { t } = useT();

  const navLinks = [
    { to: '/', label: t('nav.home'), end: true },
    { to: '/shop', label: t('nav.shop') },
    { to: '/categories', label: t('nav.categories') },
    { to: '/seasons', label: t('nav.seasons') },
    { to: '/categories/sale', label: t('nav.sale') },
  ];

  return (
    <header className="tw-hidden lg:tw-block tw-sticky tw-top-0 tw-z-40 tw-bg-white/95 tw-backdrop-blur-md tw-border-b tw-border-[var(--c-hair)] tw-transition-colors">
      <div className="tw-max-w-7xl tw-mx-auto tw-px-8 tw-h-20 tw-flex tw-items-center tw-justify-between tw-gap-8">
        {/* Brand Identity */}
        <Link
          to="/"
          className="tw-flex tw-items-center tw-gap-3 focus:tw-outline-none"
          aria-label={t('home.hero.logoAria', { storeName: settings.storeName })}
        >
          {settings.logo?.src ? (
            <img
              src={settings.logo.src}
              alt={settings.logo.alt || settings.storeName}
              className="tw-h-8 tw-w-auto tw-object-contain"
            />
          ) : (
            <div className="tw-w-9 tw-h-9 tw-rounded-full tw-bg-[var(--brand)] tw-text-[var(--brand-contrast)] tw-flex tw-items-center tw-justify-center tw-font-bold tw-text-sm">
              {settings.storeName ? settings.storeName.charAt(0) : 'A'}
            </div>
          )}
          <span className="tw-font-bold tw-text-lg tw-tracking-tight tw-text-ink">
            {settings.storeName}
          </span>
        </Link>

        {/* Navigation Links */}
        <nav aria-label="Desktop Primary" className="tw-flex tw-items-center tw-gap-6">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                cn(
                  'tw-text-sm tw-font-medium tw-transition-colors tw-py-2 tw-relative hover:tw-text-[var(--brand)]',
                  isActive
                    ? 'tw-text-[var(--brand)] tw-font-semibold after:tw-absolute after:tw-bottom-0 after:tw-left-0 after:tw-right-0 after:tw-h-0.5 after:tw-bg-[var(--brand)]'
                    : 'tw-text-[var(--c-muted)]'
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Right Action Tools: Search, Wishlist, Cart, Account */}
        <div className="tw-flex tw-items-center tw-gap-3">
          {/* Quick Header Search Form */}
          <form
            role="search"
            method="get"
            action="/search"
            className="tw-relative tw-w-56"
          >
            <input
              type="search"
              name="q"
              placeholder={t('search.placeholder', { storeName: settings.storeName })}
              className="tw-w-full tw-bg-[var(--c-card)] tw-border tw-border-[var(--c-hair)] tw-rounded-full tw-py-2 tw-pl-9 tw-pr-4 tw-text-xs tw-text-ink placeholder:tw-text-muted focus:tw-outline-none focus:tw-border-[var(--brand)] tw-transition-colors"
            />
            <span className="tw-absolute tw-left-3 tw-top-2.5 tw-text-muted tw-pointer-events-none">
              <Icon name="search" size={14} />
            </span>
          </form>

          {/* Wishlist Link */}
          <Link
            to="/wishlist"
            className="touch-target tw-w-10 tw-h-10 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-text-ink hover:tw-bg-[var(--c-card)] tw-relative tw-transition-colors"
            aria-label={`${wishlistCount} items in wishlist`}
          >
            <Icon name="heart" size={19} filled={wishlistCount > 0} className={wishlistCount > 0 ? 'tw-text-[#d92d20]' : ''} />
            {wishlistCount > 0 && (
              <span className="tw-absolute tw-top-1.5 tw-right-1.5 tw-w-4 tw-h-4 tw-rounded-full tw-bg-[#d92d20] tw-text-white tw-text-[10px] tw-font-bold tw-flex tw-items-center tw-justify-center">
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* Cart Link */}
          <Link
            to="/cart"
            className="touch-target tw-w-10 tw-h-10 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-text-ink hover:tw-bg-[var(--c-card)] tw-relative tw-transition-colors"
            aria-label={`${cartCount} items in cart`}
          >
            <Icon name="shopping-bag" size={19} />
            {cartCount > 0 && (
              <span className="tw-absolute tw-top-1.5 tw-right-1.5 tw-w-4 tw-h-4 tw-rounded-full tw-bg-[var(--brand)] tw-text-[var(--brand-contrast)] tw-text-[10px] tw-font-bold tw-flex tw-items-center tw-justify-center">
                {cartCount}
              </span>
            )}
          </Link>

          {/* Account Link */}
          <Link
            to="/account"
            className="touch-target tw-w-10 tw-h-10 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-text-ink hover:tw-bg-[var(--c-card)] tw-transition-colors"
            aria-label={t('nav.account')}
          >
            <Icon name="user" size={19} />
          </Link>
        </div>
      </div>
    </header>
  );
}

export default React.memo(DesktopHeader);
