import React from 'react';
import { Outlet } from 'react-router-dom';
import { SkipLink } from '../components/common/SkipLink';
import { DesktopHeader } from '../components/layout/DesktopHeader';
import { DesktopFooter } from '../components/layout/DesktopFooter';
import { BottomTabBar } from '../components/layout/BottomTabBar';
import { useSettings } from '../hooks/useSettings';
import '../styles/storefront.css';

/**
 * Shell layout for the customer-facing storefront.
 * Renders DesktopHeader and DesktopFooter on desktop (lg+),
 * and BottomTabBar on mobile.
 */
export function StoreLayout() {
  useSettings();

  return (
    <div className="storefront-root tw-min-h-screen tw-flex tw-flex-col tw-relative tw-bg-[var(--c-page)] tw-text-[var(--c-ink)]">
      <SkipLink />
      <DesktopHeader />
      <main id="main-content" className="tw-flex-1 pb-bottom-bar lg:tw-pb-0" tabIndex={-1}>
        <Outlet />
      </main>
      <DesktopFooter />
      <BottomTabBar />
    </div>
  );
}

export default StoreLayout;
