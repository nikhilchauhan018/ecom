import React from 'react';
import { NavLink } from 'react-router-dom';
import { BOTTOM_TABS } from '../../config/navigation';
import { Icon } from '../ui/Icon';
import { useCartCount } from '../../hooks/useCartCount';
import { useT } from '../../hooks/useT';
import { cn } from '../../utils/cn';

/**
 * Mobile-first fixed bottom navigation bar with active highlights and cart count badge.
 */
export function BottomTabBar() {
  const cartCount = useCartCount();
  const { t } = useT();

  return (
    <nav
      aria-label="Bottom Navigation"
      className="tw-fixed tw-bottom-0 tw-left-0 tw-right-0 tw-z-40 tw-bg-white/95 tw-backdrop-blur-md tw-border-t tw-border-[var(--c-hair)] lg:tw-hidden"
      style={{
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      <div className="tw-max-w-md tw-mx-auto tw-h-16 tw-flex tw-items-center tw-justify-around tw-px-3">
        {BOTTOM_TABS.map((tab) => {
          const label = t(tab.labelKey);

          return (
            <NavLink
              key={tab.id}
              to={tab.to}
              end={tab.to === '/'}
              className={({ isActive }) =>
                cn(
                  'touch-target tw-flex-1 tw-flex tw-flex-col tw-items-center tw-justify-center tw-relative tw-gap-1 tw-py-1',
                  isActive
                    ? 'tw-text-[var(--brand)] tw-font-semibold'
                    : 'tw-text-[var(--c-muted)] hover:tw-text-ink'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <div className="tw-relative tw-flex tw-items-center tw-justify-center">
                    <Icon
                      name={tab.icon}
                      size={20}
                      filled={isActive && tab.icon === 'heart'}
                    />
                    {tab.badge && cartCount > 0 && (
                      <span
                        className="tw-absolute -tw-top-1.5 -tw-right-2.5 tw-min-w-4 tw-h-4 tw-px-1 tw-rounded-full tw-bg-[var(--brand)] tw-text-[var(--brand-contrast)] tw-text-[10px] tw-font-bold tw-flex tw-items-center tw-justify-center tw-leading-none"
                        aria-label={`${cartCount} items in cart`}
                      >
                        {cartCount}
                      </span>
                    )}
                  </div>
                  <span className="tw-text-[11px] tw-leading-none">{label}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}

export default React.memo(BottomTabBar);
