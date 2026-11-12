import { useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';

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
    <div className="pg-field">
      <div className="pg-label-row">
        <label htmlFor={id} className="pg-label">
          {label}
          {required && <span className="pg-req" aria-hidden="true"> *</span>}
        </label>
        {counter && (
          <span className={counter.value > counter.max ? 'pg-counter pg-counter-over' : 'pg-counter'}>
            {counter.value}/{counter.max}
          </span>
        )}
      </div>
      {children}
      {error ? (
        <p id={messageId} className="pg-error">{error}</p>
      ) : hint ? (
        <p id={messageId} className="pg-hint">{hint}</p>
      ) : null}
    </div>
  );
}

const describe = (id: string, error?: string, hint?: string) => (error || hint ? `${id}-msg` : undefined);

export function TextField({ label, error, hint, required, counter, ...input }: BaseProps & Omit<InputHTMLAttributes<HTMLInputElement>, 'id'>) {
  const id = useId();
  return (
    <Wrapper id={id} label={label} error={error} hint={hint} required={required} counter={counter}>
      <input id={id} className="pg-input" aria-invalid={error ? true : undefined} aria-describedby={describe(id, error, hint)} aria-required={required || undefined} {...input} />
    </Wrapper>
  );
}

export function TextAreaField({ label, error, hint, required, counter, ...input }: BaseProps & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'id'>) {
  const id = useId();
  return (
    <Wrapper id={id} label={label} error={error} hint={hint} required={required} counter={counter}>
      <textarea id={id} className="pg-input pg-textarea" aria-invalid={error ? true : undefined} aria-describedby={describe(id, error, hint)} aria-required={required || undefined} {...input} />
    </Wrapper>
  );
}

export function SelectField({
  label, error, hint, required, options, ...input
}: BaseProps & Omit<SelectHTMLAttributes<HTMLSelectElement>, 'id' | 'children'> & { options: ReadonlyArray<{ value: string; label: string }> }) {
  const id = useId();
  return (
    <Wrapper id={id} label={label} error={error} hint={hint} required={required}>
      <select id={id} className="pg-input" aria-invalid={error ? true : undefined} aria-describedby={describe(id, error, hint)} {...input}>
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
    <div className="pg-check">
      <input id={id} type="checkbox" {...input} />
      <label htmlFor={id}>{label}</label>
    </div>
  );
}
