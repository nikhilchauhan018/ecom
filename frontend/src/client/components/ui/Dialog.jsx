import React, { useEffect, useId, useRef } from 'react';
import { Icon } from './Icon';

/**
 * Modal dialog built on the native <dialog> element, which gives a real focus trap,
 * inert background, Escape handling and focus restore for free.
 * `dismissible={false}` blocks Escape and backdrop clicks (use for destructive flows in progress).
 * @param {{ open: boolean, onClose: () => void, title: string, children: React.ReactNode, dismissible?: boolean, closeLabel?: string }} props
 */
export function Dialog({ open, onClose, title, children, dismissible = true, closeLabel = 'Close' }) {
  const ref = useRef(null);
  const titleId = useId();

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (open && !node.open) node.showModal();
    if (!open && node.open) node.close();
  }, [open]);

  if (!open) return null;

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      className="sf-dialog tw-w-[calc(100%-2rem)] tw-max-w-md tw-rounded-2xl tw-border-0 tw-bg-[var(--c-page)] tw-p-0 tw-text-ink tw-shadow-2xl"
      onCancel={(event) => {
        event.preventDefault();
        if (dismissible) onClose();
      }}
      onClick={(event) => {
        if (dismissible && event.target === ref.current) onClose();
      }}
    >
      <div className="tw-p-5">
        <div className="tw-mb-3 tw-flex tw-items-start tw-justify-between tw-gap-3">
          <h2 id={titleId} className="tw-m-0 tw-text-lg tw-font-semibold">
            {title}
          </h2>
          {dismissible && (
            <button
              type="button"
              onClick={onClose}
              aria-label={closeLabel}
              className="touch-target -tw-mr-2 -tw-mt-2 tw-rounded-full tw-text-[var(--c-muted)] hover:tw-bg-[var(--c-card)]"
            >
              <Icon name="x" size={18} />
            </button>
          )}
        </div>
        {children}
      </div>
    </dialog>
  );
}

export default Dialog;
