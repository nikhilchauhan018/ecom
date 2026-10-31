import React, { useEffect, useRef, useState } from 'react';
import { Button } from '../../../components/ui/Button';
import { Field } from '../../../components/ui/Field';
import { Notice } from '../../../components/ui/Notice';
import { useCountdown } from '../../../hooks/useCountdown';
import { useT } from '../../../hooks/useT';
import { SECURITY } from '../../../config/security';
import { getErrorMessage } from '../../../utils/errors';

/**
 * One-time-code entry shared by login, step-up re-auth and phone change.
 * The parent supplies `verify(code)` and `resend()` so this stays purpose-agnostic.
 *
 * Security notes: numeric-only input, `autocomplete="one-time-code"` for OS autofill,
 * code is cleared after a failure, resend is rate limited (UI countdown + server cap),
 * server errors are shown through getErrorMessage (never raw server text).
 *
 * @param {{
 *   challenge: { maskedPhone: string, resendInSec: number, demoCode?: string },
 *   verify: (code: string) => Promise<any>,
 *   resend: () => Promise<{ maskedPhone: string, resendInSec: number, demoCode?: string }>,
 *   onVerified: (result: any) => void,
 *   onBack?: () => void,
 *   backLabel?: string,
 *   submitLabel?: string,
 *   submitVariant?: 'brand' | 'danger',
 * }} props
 */
export function OtpForm({ challenge: initialChallenge, verify, resend, onVerified, onBack, backLabel, submitLabel, submitVariant = 'brand' }) {
  const { t } = useT();
  const [challenge, setChallenge] = useState(initialChallenge);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [resending, setResending] = useState(false);
  const { secondsLeft, start } = useCountdown(initialChallenge.resendInSec);
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleChange = (event) => {
    setError('');
    setCode(event.target.value.replace(/\D/g, '').slice(0, SECURITY.OTP_LENGTH));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (busy) return;
    if (code.length !== SECURITY.OTP_LENGTH) {
      setError(t('errors.otp_invalid'));
      return;
    }

    setBusy(true);
    setError('');
    try {
      const result = await verify(code);
      onVerified(result);
    } catch (err) {
      setError(getErrorMessage(t, err));
      setCode('');
      if (err?.code === 'rate_limited') start(err.meta?.retryAfterSec || 0);
      inputRef.current?.focus();
    } finally {
      setBusy(false);
    }
  };

  const handleResend = async () => {
    if (resending || secondsLeft > 0) return;
    setResending(true);
    setError('');
    try {
      const next = await resend();
      setChallenge(next);
      start(next.resendInSec);
      setCode('');
      inputRef.current?.focus();
    } catch (err) {
      setError(getErrorMessage(t, err));
      if (err?.code === 'rate_limited') start(err.meta?.retryAfterSec || 0);
    } finally {
      setResending(false);
    }
  };

  const showDemo = import.meta.env?.DEV && challenge.demoCode;

  return (
    <form onSubmit={handleSubmit} noValidate className="tw-flex tw-flex-col tw-gap-4">
      <p className="tw-m-0 tw-text-sm tw-text-[var(--c-muted)]">
        {t('auth.otpSubtitle', { length: SECURITY.OTP_LENGTH, phone: challenge.maskedPhone })}
      </p>

      <Field
        ref={inputRef}
        label={t('auth.otpLabel')}
        name="otp"
        type="text"
        inputMode="numeric"
        autoComplete="one-time-code"
        pattern="[0-9]*"
        maxLength={SECURITY.OTP_LENGTH}
        value={code}
        onChange={handleChange}
        error={error}
        required
        inputClassName="tw-text-center tw-text-xl tw-font-semibold tw-tracking-[0.5em]"
      />

      {showDemo && <Notice tone="info">{t('auth.demoHint', { code: challenge.demoCode })}</Notice>}

      <Button type="submit" variant={submitVariant} fullWidth size="lg" loading={busy}>
        {submitLabel || t('auth.verify')}
      </Button>

      <div className="tw-flex tw-items-center tw-justify-between tw-gap-3 tw-text-sm">
        <button
          type="button"
          onClick={handleResend}
          disabled={secondsLeft > 0 || resending}
          className="touch-target tw-font-semibold tw-text-[var(--c-success)] disabled:tw-text-[var(--c-muted)] disabled:tw-font-normal"
        >
          {secondsLeft > 0 ? t('auth.resendIn', { seconds: secondsLeft }) : t('auth.resend')}
        </button>
        {onBack && (
          <button type="button" onClick={onBack} className="touch-target tw-text-[var(--c-muted)] tw-underline">
            {backLabel || t('auth.changeNumber')}
          </button>
        )}
      </div>

      <p className="tw-m-0 tw-text-xs tw-text-[var(--c-muted)]">{t('auth.shareWarning')}</p>
    </form>
  );
}

export default OtpForm;
