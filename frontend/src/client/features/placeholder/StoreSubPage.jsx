import React from 'react';
import { Link, useLocation } from 'react-router-dom';

/**
 * Placeholder view for storefront navigation routes.
 * @param {{ title?: string }} props
 */
export function StoreSubPage({ title }) {
  const location = useLocation();
  const displayTitle = title || location.pathname.replace(/^\//, '').replace(/-/g, ' ');

  return (
    <div className="tw-min-h-[60vh] tw-flex tw-flex-col tw-items-center tw-justify-center tw-p-6 tw-text-center">
      <div className="tw-w-16 tw-h-16 tw-rounded-full tw-bg-[var(--brand-tint)] tw-flex tw-items-center tw-justify-center tw-mb-4">
        <span className="tw-text-xl tw-font-bold tw-text-[var(--brand)]">✦</span>
      </div>
      <h1 className="tw-text-2xl tw-font-bold tw-text-ink tw-capitalize tw-mb-2">
        {displayTitle}
      </h1>
      <p className="tw-text-sm tw-text-muted tw-max-w-sm tw-mb-6">
        This storefront module is ready for browsing. Return to the Home experience below.
      </p>
      <Link
        to="/"
        className="touch-target tw-px-6 tw-py-2.5 tw-rounded-full tw-bg-[var(--brand)] tw-text-[var(--brand-contrast)] tw-font-medium tw-text-sm tw-shadow-xs"
      >
        Back to Home
      </Link>
    </div>
  );
}

export default StoreSubPage;
