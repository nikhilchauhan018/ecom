import React, { useId } from 'react';
import { PHONE_COUNTRIES } from '../../config/dialCodes';
import { useT } from '../../hooks/useT';
import { cn } from '../../utils/cn';
import { matchDialCode } from '../../utils/phone';

const CONTROL =
  'tw-block tw-h-12 tw-rounded-xl tw-border tw-bg-[var(--c-page)] tw-text-[15px] tw-text-ink placeholder:tw-text-[var(--c-soft)] focus:tw-outline-none focus:tw-border-[var(--brand)] disabled:tw-bg-[var(--c-card)] tw-transition-colors';

/**
 * Phone input with a country-code picker.
 * Controlled: `value` is what the user typed (national part), `country` the selected ISO code.
 * Typing or pasting a number that starts with "+" (or "00") and matches a known dial code switches the
 * country automatically and keeps only the national digits.
 *
 * @param {{
 *   label: string,
 *   value: string,
 *   country: string,
 *   onChange: (next: { national: string, country: string }) => void,
 *   error?: string | null,
 *   hint?: string,
 *   autoDetected?: boolean,
 *   required?: boolean,
 *   disabled?: boolean,
 *   autoFocus?: boolean,
 *   name?: string,
 * }} props
 */
export function PhoneField({ label, value, country, onChange, error, hint, autoDetected, required, disabled, autoFocus, name = 'phone' }) {
  const { t } = useT();
  const id = useId();
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const note = error ? null : autoDetected ? t('auth.countryDetected') : hint;
  const describedBy = [error && errorId, note && hintId].filter(Boolean).join(' ') || undefined;

  const handleInput = (event) => {
    const raw = event.target.value;
    const digits = raw.replace(/\D/g, '');
    const international = raw.trimStart().startsWith('+') || /^\s*00\d/.test(raw);

    if (international) {
      const body = raw.trimStart().startsWith('+') ? digits : digits.slice(2);
      const match = matchDialCode(body, country);
      if (match) {
        onChange({ national: body.slice(match.dial.length), country: match.code });
        return;
      }
    }
    onChange({ national: raw, country });
  };

  return (
    <div>
      <label htmlFor={id} className="tw-m-0 tw-mb-1.5 tw-block tw-text-[13px] tw-font-medium tw-text-ink">
        {label}
        {required && (
          <span aria-hidden="true" className="tw-text-[var(--c-danger)]">
            {' '}*
          </span>
        )}
      </label>

      <div className="tw-flex tw-gap-2">
        <select
          aria-label={t('auth.countryLabel')}
          name={`${name}Country`}
          value={country}
          disabled={disabled}
          onChange={(event) => onChange({ national: value, country: event.target.value })}
          className={cn(CONTROL, 'tw-w-[8.5rem] tw-shrink-0 tw-border-[var(--c-line)] tw-pl-3 tw-pr-1')}
        >
          {PHONE_COUNTRIES.map((item) => (
            <option key={item.code} value={item.code}>
              {item.name} (+{item.dial})
            </option>
          ))}
        </select>

        <input
          id={id}
          name={name}
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          placeholder={t('auth.phoneNationalPlaceholder')}
          value={value}
          disabled={disabled}
          autoFocus={autoFocus}
          required={required}
          maxLength={24}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          onChange={handleInput}
          className={cn(CONTROL, 'tw-min-w-0 tw-flex-1 tw-px-3.5', error ? 'tw-border-[var(--c-danger)]' : 'tw-border-[var(--c-line)]')}
        />
      </div>

      {note && (
        <p id={hintId} className="tw-m-0 tw-mt-1.5 tw-text-xs tw-text-[var(--c-muted)]">
          {note}
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

export default PhoneField;
