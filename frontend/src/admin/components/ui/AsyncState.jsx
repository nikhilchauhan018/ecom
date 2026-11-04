/** Placeholder block shown while data loads. `label` is read by screen readers. */
export function LoadingBlock({ label = 'Loading', className = 'tw-h-40' }) {
  return <div role="status" aria-label={label} className={`tw-animate-pulse tw-rounded tw-bg-page ${className}`} />;
}

/** Error message with an optional Retry button. */
export function LoadError({ message = 'Unable to load this data.', onRetry }) {
  return (
    <div role="alert" aria-live="assertive" className="tw-rounded-lg tw-bg-[var(--c-danger-bg)] tw-p-4 tw-text-[var(--c-danger-ink)]">
      {message}
      {onRetry && <> <button type="button" className="tw-border-0 tw-bg-transparent tw-text-inherit tw-underline" onClick={onRetry}>Retry</button></>}
    </div>
  );
}

const NOTICE_TONES = {
  success: 'tw-bg-[var(--c-success-bg)] tw-text-[var(--c-success-ink)]',
  warning: 'tw-bg-[var(--c-warning-bg)] tw-text-[var(--c-warning-ink)]',
  error: 'tw-bg-[var(--c-danger-bg)] tw-text-[var(--c-danger-ink)]',
};

/** Result message after an action. `tone` is success, warning or error. Errors interrupt screen readers, the others do not. */
export function Notice({ tone = 'success', text, onDismiss }) {
  return (
    <div role={tone === 'success' ? 'status' : 'alert'} className={`tw-flex tw-items-start tw-justify-between tw-gap-3 tw-rounded-lg tw-p-3 ${NOTICE_TONES[tone] ?? NOTICE_TONES.error}`}>
      <span>{text}</span>
      {onDismiss && <button type="button" aria-label="Dismiss message" className="tw-border-0 tw-bg-transparent tw-text-inherit" onClick={onDismiss}>×</button>}
    </div>
  );
}
