import React from 'react';
import { cn } from '../../utils/cn';

/**
 * Accessible button with 44px minimum touch target and brand theme styling.
 * `loading` disables the button, shows a spinner and sets aria-busy.
 * @param {{
 *   variant?: 'brand' | 'secondary' | 'ghost' | 'icon' | 'outline' | 'danger',
 *   size?: 'sm' | 'md' | 'lg',
 *   loading?: boolean,
 *   fullWidth?: boolean,
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
  loading = false,
  fullWidth = false,
  disabled = false,
  children,
  className = '',
  type = 'button',
  onClick,
  'aria-label': ariaLabel,
  ...rest
}) {
  const base =
    'touch-target tw-font-medium tw-transition-colors tw-rounded-full tw-inline-flex tw-items-center tw-justify-center tw-gap-2 disabled:tw-opacity-60 disabled:tw-cursor-not-allowed';

  const variants = {
    brand: 'tw-bg-[var(--brand)] tw-text-[var(--brand-contrast)] hover:tw-opacity-90',
    secondary: 'tw-bg-white/90 tw-text-ink tw-shadow-sm hover:tw-bg-white',
    ghost: 'tw-bg-transparent tw-text-ink hover:tw-bg-black/5',
    icon: 'tw-bg-white/90 tw-text-ink tw-rounded-full hover:tw-bg-white tw-shadow-sm',
    outline: 'tw-bg-transparent tw-text-ink tw-border tw-border-[var(--c-line)] hover:tw-bg-[var(--c-card)]',
    danger: 'tw-bg-[var(--c-danger)] tw-text-white hover:tw-opacity-90',
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
      aria-busy={loading || undefined}
      disabled={disabled || loading}
      className={cn(base, variants[variant], sizes[size], fullWidth && 'tw-w-full', className)}
      {...rest}
    >
      {loading && (
        <span
          aria-hidden="true"
          className="tw-inline-block tw-h-4 tw-w-4 tw-animate-spin tw-rounded-full tw-border-2 tw-border-current tw-border-t-transparent"
        />
      )}
      {children}
    </button>
  );
}

export default React.memo(Button);
