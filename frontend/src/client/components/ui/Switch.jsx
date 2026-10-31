import React, { useId } from 'react';
import { cn } from '../../utils/cn';

/**
 * Accessible on/off switch row (role="switch") with label + description.
 * @param {{ label: string, description?: string, checked: boolean, onChange: (next: boolean) => void, disabled?: boolean, busy?: boolean }} props
 */
export function Switch({ label, description, checked, onChange, disabled = false, busy = false }) {
  const id = useId();
  const labelId = `${id}-label`;
  const descId = `${id}-desc`;

  return (
    <div className="tw-flex tw-items-center tw-justify-between tw-gap-4 tw-px-4 tw-py-3.5">
      <div className="tw-min-w-0">
        <p id={labelId} className="tw-m-0 tw-text-[15px] tw-text-ink">
          {label}
        </p>
        {description && (
          <p id={descId} className="tw-m-0 tw-mt-0.5 tw-text-xs tw-text-[var(--c-muted)]">
            {description}
          </p>
        )}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={labelId}
        aria-describedby={description ? descId : undefined}
        aria-busy={busy || undefined}
        disabled={disabled || busy}
        onClick={() => onChange(!checked)}
        className="touch-target tw-shrink-0 disabled:tw-opacity-60 disabled:tw-cursor-not-allowed"
      >
        <span
          className={cn(
            'tw-relative tw-inline-block tw-h-7 tw-w-12 tw-rounded-full tw-transition-colors',
            checked ? 'tw-bg-[var(--c-success)]' : 'tw-bg-[var(--c-field)]'
          )}
        >
          <span
            className={cn(
              'tw-absolute tw-top-1 tw-h-5 tw-w-5 tw-rounded-full tw-bg-white tw-shadow tw-transition-all',
              checked ? 'tw-left-6' : 'tw-left-1'
            )}
          />
        </span>
      </button>
    </div>
  );
}

export default React.memo(Switch);
