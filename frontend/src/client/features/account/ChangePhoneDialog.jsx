import React, { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Dialog } from '../../components/ui/Dialog';
import { Notice } from '../../components/ui/Notice';
import { PhoneField } from '../../components/ui/PhoneField';
import { OtpForm } from '../auth/components/OtpForm';
import { requestPhoneChangeOtp, verifyPhoneChangeOtp } from '../../services/account';
import { usePhoneCountry } from '../../hooks/usePhoneCountry';
import { useT } from '../../hooks/useT';
import { getErrorMessage } from '../../utils/errors';
import { resolvePhone } from '../../utils/phone';
import { validatePhone } from '../../utils/validators';

/**
 * Changes the account's mobile number. The NEW number must be proven with a one-time code
 * before the server swaps it, so a hijacked session cannot silently redirect future codes.
 * Mount it only while open (state resets on unmount).
 * @param {{ onClose: () => void, onChanged: (user: object) => void }} props
 */
export function ChangePhoneDialog({ onClose, onChanged }) {
  const { t } = useT();
  const [step, setStep] = useState('phone');
  const [phone, setPhone] = useState('');
  const [e164, setE164] = useState('');
  const { country, setCountry, autoDetected } = usePhoneCountry();
  const [phoneError, setPhoneError] = useState('');
  const [formError, setFormError] = useState('');
  const [challenge, setChallenge] = useState(null);
  const [busy, setBusy] = useState(false);

  const sendCode = async (event) => {
    event.preventDefault();
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
      const result = await requestPhoneChangeOtp(checked.value);
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
    <Dialog open onClose={onClose} title={t('profile.changePhoneTitle')} closeLabel={t('common.close')}>
      {step === 'phone' ? (
        <form onSubmit={sendCode} noValidate className="tw-flex tw-flex-col tw-gap-4">
          <PhoneField
            label={t('profile.newPhone')}
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
          <div className="tw-flex tw-flex-col tw-gap-2 sm:tw-flex-row-reverse">
            <Button type="submit" fullWidth loading={busy}>
              {t('auth.sendCode')}
            </Button>
            <Button variant="outline" fullWidth onClick={onClose}>
              {t('common.cancel')}
            </Button>
          </div>
        </form>
      ) : (
        <OtpForm
          challenge={challenge}
          verify={(code) => verifyPhoneChangeOtp(e164, code)}
          resend={() => requestPhoneChangeOtp(e164)}
          onVerified={(result) => {
            onChanged(result.user);
            onClose();
          }}
          onBack={() => {
            setStep('phone');
            setChallenge(null);
          }}
        />
      )}
    </Dialog>
  );
}

export default ChangePhoneDialog;
