import React from 'react';
import { cn } from '../../utils/cn';

/**
 * Renders status or promo badges with designated color schemes.
 * @param {{ variant?: 'sale'|'lowStock'|'default', children: React.ReactNode, className?: string }} props
 */
export function Badge({ variant = 'default', children, className = '' }) {
  if (!children) return null;

  const variantStyles = {
    sale: 'tw-bg-[#fde8e7] tw-text-[#981b1b]',
    lowStock: 'tw-bg-[#fef3c7] tw-text-[#92400e]',
    default: 'tw-bg-[var(--c-card)] tw-text-ink',
  };

  return (
    <span
      className={cn(
        'tw-inline-flex tw-items-center tw-px-2 tw-py-0.5 tw-rounded-full tw-text-[11px] tw-font-medium',
        variantStyles[variant] || variantStyles.default,
        className
      )}
    >
      {children}
    </span>
  );
}

export default React.memo(Badge);
