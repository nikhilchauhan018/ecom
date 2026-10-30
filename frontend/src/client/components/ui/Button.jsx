import React from 'react';
import { cn } from '../../utils/cn';

/**
 * Accessible button with 44px minimum touch target and brand theme styling.
 * @param {{
 *   variant?: 'brand' | 'secondary' | 'ghost' | 'icon',
 *   size?: 'sm' | 'md' | 'lg',
 *   children?: React.ReactNode,
 *   className?: string,
 *   type?: 'button' | 'submit' | 'reset',
 *   onClick?: (e: React.MouseEvent) => void,
 *   'aria-label'?: string
 * }} props
 */
export function Button({
  variant = 'brand',
  size = 'md',
  children,
  className = '',
  type = 'button',
  onClick,
  'aria-label': ariaLabel,
  ...rest
}) {
  const base =
    'touch-target tw-font-medium tw-transition-colors tw-rounded-full tw-inline-flex tw-items-center tw-justify-center tw-border-0';

  const variants = {
    brand: 'tw-bg-[var(--brand)] tw-text-[var(--brand-contrast)] hover:tw-opacity-90',
    secondary: 'tw-bg-white/90 tw-text-ink tw-shadow-sm hover:tw-bg-white',
    ghost: 'tw-bg-transparent tw-text-ink hover:tw-bg-black/5',
    icon: 'tw-bg-white/90 tw-text-ink tw-rounded-full hover:tw-bg-white tw-shadow-sm',
  };

  const sizes = {
    sm: 'tw-px-3 tw-py-1.5 tw-text-xs',
    md: 'tw-px-5 tw-py-2.5 tw-text-sm',
    lg: 'tw-px-6 tw-py-3 tw-text-base',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      aria-label={ariaLabel}
      className={cn(base, variants[variant], sizes[size], className)}
      {...rest}
    >
      {children}
    </button>
  );
}

export default React.memo(Button);
