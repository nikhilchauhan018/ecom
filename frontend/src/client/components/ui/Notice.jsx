import React from 'react';
import { Icon } from './Icon';
import { cn } from '../../utils/cn';

const TONES = {
  info: 'tw-bg-[var(--c-card)] tw-text-ink',
  success: 'tw-bg-[var(--c-success-tint)] tw-text-[var(--c-success)]',
  error: 'tw-bg-[var(--c-badge-sale-bg)] tw-text-[var(--c-badge-sale-fg)]',
  warning: 'tw-bg-[var(--c-badge-low-bg)] tw-text-[var(--c-badge-low-fg)]',
};

const ICONS = { info: 'info', success: 'check', error: 'alert', warning: 'alert' };

/**
 * Inline status message. Errors use role="alert" (announced immediately),
 * everything else role="status" (announced politely).
 * @param {{ tone?: 'info'|'success'|'error'|'warning', children: React.ReactNode, className?: string }} props
 */
export function Notice({ tone = 'info', children, className = '' }) {
  if (!children) return null;
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={cn('tw-flex tw-items-start tw-gap-2.5 tw-rounded-xl tw-px-3.5 tw-py-3 tw-text-[13px]', TONES[tone], className)}
    >
      <Icon name={ICONS[tone]} size={16} className="tw-mt-0.5 tw-shrink-0" />
      <div className="tw-min-w-0 tw-flex-1">{children}</div>
    </div>
  );
}

export default Notice;
