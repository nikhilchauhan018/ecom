import { useEffect, useId, useRef, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import type { PostStatus } from '../schema';

interface BaseProps {
  label: string;
  error?: string | undefined;
  hint?: string | undefined;
  required?: boolean;
  /** Shows "12/70" next to the label. */
  counter?: { value: number; max: number };
}

function Wrapper({ id, label, error, hint, required, counter, children }: BaseProps & { id: string; children: ReactNode }) {
  const messageId = `${id}-msg`;
  return (
    <div className="bl-field">
      <div className="bl-label-row">
        <label htmlFor={id} className="bl-label">
          {label}
          {required && <span className="bl-req" aria-hidden="true"> *</span>}
        </label>
        {counter && (
          <span className={counter.value > counter.max ? 'bl-counter bl-counter-over' : 'bl-counter'}>
            {counter.value}/{counter.max}
          </span>
        )}
      </div>
      {children}
      {error ? (
        <p id={messageId} className="bl-error">{error}</p>
      ) : hint ? (
        <p id={messageId} className="bl-hint">{hint}</p>
      ) : null}
    </div>
  );
}

const describe = (id: string, error?: string, hint?: string) => (error || hint ? `${id}-msg` : undefined);

export function TextField({ label, error, hint, required, counter, ...input }: BaseProps & Omit<InputHTMLAttributes<HTMLInputElement>, 'id'>) {
  const id = useId();
  return (
    <Wrapper id={id} label={label} error={error} hint={hint} required={required} counter={counter}>
      <input id={id} className="bl-input" aria-invalid={error ? true : undefined} aria-describedby={describe(id, error, hint)} aria-required={required || undefined} {...input} />
    </Wrapper>
  );
}

export function TextAreaField({ label, error, hint, required, counter, ...input }: BaseProps & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'id'>) {
  const id = useId();
  return (
    <Wrapper id={id} label={label} error={error} hint={hint} required={required} counter={counter}>
      <textarea id={id} className="bl-input bl-textarea" aria-invalid={error ? true : undefined} aria-describedby={describe(id, error, hint)} aria-required={required || undefined} {...input} />
    </Wrapper>
  );
}

export function SelectField({
  label, error, hint, required, options, ...input
}: BaseProps & Omit<SelectHTMLAttributes<HTMLSelectElement>, 'id' | 'children'> & { options: ReadonlyArray<{ value: string; label: string }> }) {
  const id = useId();
  return (
    <Wrapper id={id} label={label} error={error} hint={hint} required={required}>
      <select id={id} className="bl-input" aria-invalid={error ? true : undefined} aria-describedby={describe(id, error, hint)} {...input}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </Wrapper>
  );
}

export function CheckboxField({ label, ...input }: { label: string } & Omit<InputHTMLAttributes<HTMLInputElement>, 'id' | 'type'>) {
  const id = useId();
  return (
    <div className="bl-check">
      <input id={id} type="checkbox" {...input} />
      <label htmlFor={id}>{label}</label>
    </div>
  );
}

interface Props {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  danger?: boolean;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/** Accessible modal: Escape cancels, Tab stays inside, focus returns to the opener. */
export function ConfirmDialog({ open, title, message, confirmLabel, cancelLabel = 'Cancel', danger, busy, onConfirm, onCancel }: Props) {
  const titleId = useId();
  const messageId = useId();
  const cancelRef = useRef<HTMLButtonElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const opener = document.activeElement as HTMLElement | null;
    cancelRef.current?.focus();
    return () => opener?.focus?.();
  }, [open]);

  if (!open) return null;

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') {
      e.stopPropagation();
      if (!busy) onCancel();
      return;
    }
    if (e.key !== 'Tab') return;
    const first = cancelRef.current;
    const last = confirmRef.current;
    if (!first || !last) return;
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  return (
    <div className="bl-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget && !busy) onCancel(); }}>
      <div className="bl-dialog" role="alertdialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={messageId} onKeyDown={onKeyDown}>
        <h2 id={titleId}>{title}</h2>
        <p id={messageId}>{message}</p>
        <div className="bl-dialog-actions">
          <button type="button" ref={cancelRef} className="bl-btn" onClick={onCancel} disabled={busy}>{cancelLabel}</button>
          <button type="button" ref={confirmRef} className={danger ? 'bl-btn bl-btn-danger-solid' : 'bl-btn bl-btn-primary'} onClick={onConfirm} disabled={busy}>
            {busy ? 'Working…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export function StatusBadge({ status }: { status: PostStatus }) {
  return <span className={status === 'published' ? 'bl-badge bl-badge-live' : 'bl-badge bl-badge-draft'}>{status === 'published' ? 'Published' : 'Draft'}</span>;
}
