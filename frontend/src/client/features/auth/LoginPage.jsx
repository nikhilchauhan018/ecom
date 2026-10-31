import React, { useEffect, useState } from 'react';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Icon } from '../../components/ui/Icon';
import { Notice } from '../../components/ui/Notice';
import { PhoneField } from '../../components/ui/PhoneField';
import { OtpForm } from './components/OtpForm';
import { requestOtp, verifyOtp } from '../../services/auth';
import { authStore } from '../../stores/authStore';
import { useAuth } from '../../hooks/useAuth';
import { usePhoneCountry } from '../../hooks/usePhoneCountry';
import { useT } from '../../hooks/useT';
import { ROUTES } from '../../config/constants';
import { getErrorMessage } from '../../utils/errors';
import { resolvePhone } from '../../utils/phone';
import { safeRedirectPath } from '../../utils/safeRedirect';
import { validatePhone } from '../../utils/validators';

/**
 * Passwordless sign-in: mobile number -> one-time code.
 * `?next=` is validated by safeRedirectPath so it can never redirect off-site.
 */
export function LoginPage() {
  const { t } = useT();
  const { status, reason } = useAuth();
  const [searchParams] = useSearchParams();
  const next = safeRedirectPath(searchParams.get('next'), ROUTES.ACCOUNT);

  const [step, setStep] = useState('phone');
  const [phone, setPhone] = useState('');
  const [e164, setE164] = useState('');
  const { country, setCountry, autoDetected } = usePhoneCountry();
  const [phoneError, setPhoneError] = useState('');
  const [formError, setFormError] = useState('');
  const [challenge, setChallenge] = useState(null);
  const [busy, setBusy] = useState(false);
  // Capture the sign-out reason once, then forget it so it is not shown again later.
  const [shownReason] = useState(reason);

  useEffect(() => () => authStore.clearReason(), []);

  if (status === 'authenticated') return <Navigate to={next} replace />;
  if (status === 'loading') {
    return (
      <p role="status" className="tw-p-10 tw-text-center tw-text-sm tw-text-[var(--c-muted)]">
        {t('auth.checking')}
      </p>
    );
  }

  const reasonKey = shownReason ? `auth.reasons.${shownReason}` : null;
  const reasonText = reasonKey && t(reasonKey) !== reasonKey ? t(reasonKey) : '';

  const sendCode = async (event) => {
    event?.preventDefault();
    if (busy) return;

    const resolved = resolvePhone(phone, country);
    const checked = validatePhone(resolved.e164);
    if (!checked.valid) {
      setPhoneError(t(`validation.${checked.error}`));
      return;
    }

    setBusy(true);
    setPhoneError('');
    setFormError('');
    try {
      const result = await requestOtp({ phone: checked.value, purpose: 'login' });
      setE164(checked.value);
      if (resolved.country !== country) setCountry(resolved.country);
      setChallenge(result);
      setStep('otp');
    } catch (error) {
      setFormError(getErrorMessage(t, error));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="tw-mx-auto tw-w-full tw-max-w-md tw-px-4 tw-py-10 lg:tw-py-16">
      <div className="tw-mb-6 tw-flex tw-flex-col tw-items-center tw-text-center">
        <span className="tw-mb-4 tw-flex tw-h-14 tw-w-14 tw-items-center tw-justify-center tw-rounded-full tw-bg-[var(--c-success-tint)] tw-text-[var(--c-success)]">
          <Icon name={step === 'phone' ? 'user' : 'lock'} size={24} />
        </span>
        <h1 className="tw-m-0 tw-text-2xl tw-font-bold tw-text-ink">
          {step === 'phone' ? t('auth.title') : t('auth.otpTitle')}
        </h1>
        {step === 'phone' && (
          <p className="tw-m-0 tw-mt-2 tw-text-sm tw-text-[var(--c-muted)]">{t('auth.subtitle')}</p>
        )}
      </div>

      {reasonText && step === 'phone' && <Notice tone="info" className="tw-mb-4">{reasonText}</Notice>}

      <div className="tw-rounded-2xl tw-border tw-border-[var(--c-line)] tw-p-5">
        {step === 'phone' ? (
          <form onSubmit={sendCode} noValidate className="tw-flex tw-flex-col tw-gap-4">
            <PhoneField
              label={t('auth.phoneLabel')}
              hint={t('auth.phoneHint')}
              value={phone}
              country={country}
              autoDetected={autoDetected}
              onChange={({ national, country: next }) => {
                setPhone(national);
                if (next !== country) setCountry(next);
                setPhoneError('');
              }}
              error={phoneError}
              required
              autoFocus
            />
            {formError && <Notice tone="error">{formError}</Notice>}
            <Button type="submit" fullWidth size="lg" loading={busy}>
              {t('auth.sendCode')}
            </Button>
          </form>
        ) : (
          <OtpForm
            challenge={challenge}
            verify={(code) => verifyOtp({ phone: e164, code, purpose: 'login' })}
            resend={() => requestOtp({ phone: e164, purpose: 'login' })}
            onVerified={(result) => authStore.signedIn(result.user, result.expiresAt)}
            onBack={() => {
              setStep('phone');
              setChallenge(null);
            }}
          />
        )}
      </div>

      <p className="tw-m-0 tw-mt-5 tw-text-center tw-text-xs tw-text-[var(--c-muted)]">
        {t('auth.termsPrefix')}{' '}
        <Link to={ROUTES.POLICY_TERMS} className="tw-underline">
          {t('auth.terms')}
        </Link>{' '}
        {t('auth.and')}{' '}
        <Link to={ROUTES.POLICY_PRIVACY} className="tw-underline">
          {t('auth.privacy')}
        </Link>
        .
      </p>
    </div>
  );
}

export default LoginPage;
