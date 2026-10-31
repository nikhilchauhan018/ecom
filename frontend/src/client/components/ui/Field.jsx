import React, { useId } from 'react';
import { cn } from '../../utils/cn';

const CONTROL =
  'tw-block tw-w-full tw-rounded-xl tw-border tw-bg-[var(--c-page)] tw-px-3.5 tw-text-[15px] tw-text-ink placeholder:tw-text-[var(--c-soft)] focus:tw-outline-none focus:tw-border-[var(--brand)] disabled:tw-bg-[var(--c-card)] disabled:tw-text-[var(--c-muted)] tw-transition-colors';

/**
 * Labelled form control with hint + error wiring (aria-invalid / aria-describedby).
 * `as` picks the element: 'input' (default), 'select' or 'textarea'.
 * @param {{ label: string, error?: string|null, hint?: string, as?: 'input'|'select'|'textarea', className?: string, children?: React.ReactNode } & Record<string, any>} props
 */
export function Field({ label, error, hint, as: Tag = 'input', className = '', inputClassName = '', children, ...rest }) {
  const id = useId();
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const describedBy = [error && errorId, hint && hintId].filter(Boolean).join(' ') || undefined;

  return (
    <div className={className}>
      <label htmlFor={id} className="tw-m-0 tw-mb-1.5 tw-block tw-text-[13px] tw-font-medium tw-text-ink">
        {label}
        {rest.required && (
          <span aria-hidden="true" className="tw-text-[var(--c-danger)]">
            {' '}*
          </span>
        )}
      </label>
      <Tag
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cn(
          CONTROL,
          Tag === 'textarea' ? 'tw-min-h-[96px] tw-py-3' : 'tw-h-12',
          error ? 'tw-border-[var(--c-danger)]' : 'tw-border-[var(--c-line)]',
          inputClassName
        )}
        {...rest}
      >
        {children}
      </Tag>
      {hint && !error && (
        <p id={hintId} className="tw-m-0 tw-mt-1.5 tw-text-xs tw-text-[var(--c-muted)]">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} role="alert" className="tw-m-0 tw-mt-1.5 tw-text-xs tw-font-medium tw-text-[var(--c-danger)]">
          {error}
        </p>
      )}
    </div>
  );
}

export default Field;
