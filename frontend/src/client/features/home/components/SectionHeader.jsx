import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Reusable section header component with semantic h2 and optional 'See all' link.
 * @param {{ title: string, seeAllLabel?: string, seeAllTo?: string, id?: string }} props
 */
export function SectionHeader({ title, seeAllLabel, seeAllTo, id }) {
  return (
    <div className="tw-flex tw-items-center tw-justify-between tw-mb-4 tw-px-1">
      <h2 id={id} className="tw-text-base sm:tw-text-lg tw-font-bold tw-text-ink tw-tracking-tight">
        {title}
      </h2>
      {seeAllTo && seeAllLabel && (
        <Link
          to={seeAllTo}
          className="touch-target tw-text-xs sm:tw-text-sm tw-font-medium tw-text-[var(--brand)] hover:tw-underline tw-py-1"
        >
          {seeAllLabel}
        </Link>
      )}
    </div>
  );
}

export default React.memo(SectionHeader);
