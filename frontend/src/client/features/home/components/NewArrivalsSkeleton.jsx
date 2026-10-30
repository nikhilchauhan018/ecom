import React from 'react';

/**
 * Skeleton loader with exact final dimensions to prevent layout shifts (CLS < 0.1).
 * @param {{ count?: number }} props
 */
export function NewArrivalsSkeleton({ count = 4 }) {
  const items = Array.from({ length: count });

  return (
    <div
      className="tw-grid tw-grid-cols-2 md:tw-grid-cols-4 tw-gap-3.5 sm:tw-gap-4 lg:tw-gap-6"
      aria-hidden="true"
    >
      {items.map((_, index) => (
        <div key={index} className="tw-flex tw-flex-col tw-animate-pulse">
          <div className="tw-w-full tw-aspect-[4/5] tw-rounded-2xl tw-bg-[var(--c-card)]" />
          <div className="tw-mt-2.5 tw-flex tw-flex-col tw-gap-1.5 tw-px-0.5">
            <div className="tw-h-4 tw-w-3/4 tw-rounded tw-bg-[var(--c-hair)]" />
            <div className="tw-h-3.5 tw-w-1/3 tw-rounded tw-bg-[var(--c-hair)]" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default React.memo(NewArrivalsSkeleton);
