import React from 'react';
import { Link } from 'react-router-dom';
import { Icon } from './Icon';

/**
 * Friendly empty list placeholder with an optional call to action.
 * @param {{ icon: string, title: string, body?: string, actionLabel?: string, actionTo?: string }} props
 */
export function EmptyState({ icon, title, body, actionLabel, actionTo }) {
  return (
    <div className="tw-flex tw-flex-col tw-items-center tw-rounded-2xl tw-border tw-border-dashed tw-border-[var(--c-line)] tw-px-6 tw-py-12 tw-text-center">
      <span className="tw-mb-4 tw-flex tw-h-14 tw-w-14 tw-items-center tw-justify-center tw-rounded-full tw-bg-[var(--c-card)] tw-text-[var(--c-muted)]">
        <Icon name={icon} size={24} />
      </span>
      <h2 className="tw-m-0 tw-text-base tw-font-semibold tw-text-ink">{title}</h2>
      {body && <p className="tw-m-0 tw-mt-1.5 tw-max-w-xs tw-text-sm tw-text-[var(--c-muted)]">{body}</p>}
      {actionLabel && actionTo && (
        <Link
          to={actionTo}
          className="touch-target tw-mt-5 tw-rounded-full tw-bg-[var(--brand)] tw-px-6 tw-text-sm tw-font-medium tw-text-[var(--brand-contrast)]"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}

export default EmptyState;
