import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AccountShell } from './components/AccountShell';
import { AsyncState } from '../../components/ui/AsyncState';
import { Button } from '../../components/ui/Button';
import { Field } from '../../components/ui/Field';
import { Icon } from '../../components/ui/Icon';
import { Notice } from '../../components/ui/Notice';
import { OtpForm } from '../auth/components/OtpForm';
import {
  deleteAccount,
  getAccountOverview,
  requestStepUpOtp,
  verifyStepUpOtp,
} from '../../services/account';
import { authStore } from '../../stores/authStore';
import { useResource } from '../../hooks/useResource';
import { useT } from '../../hooks/useT';
import { ROUTES } from '../../config/constants';
import { SECURITY } from '../../config/security';
import { getErrorMessage } from '../../utils/errors';

/**
 * Account deletion with three safeguards:
 *   1. blocked while an order is in flight,
 *   2. the customer must type the confirmation word exactly,
 *   3. step-up re-authentication: a fresh OTP is required, exchanged for a short-lived,
 *      single-use token that the delete call must carry (a stolen session alone is not enough).
 */
export function DeleteAccountPage() {
  const { t } = useT();
  const navigate = useNavigate();
  const { data, loading, error, reload } = useResource(getAccountOverview, []);
  const [step, setStep] = useState('confirm');
  const [typed, setTyped] = useState('');
  const [challenge, setChallenge] = useState(null);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState('');

  const word = SECURITY.DELETE_CONFIRM_WORD;
  const hasActiveOrder = Boolean(data?.activeOrder);
  const confirmed = typed === word;

  const startVerification = async () => {
    if (!confirmed || hasActiveOrder || busy) return;
    setBusy(true);
    setFormError('');
    try {
      setChallenge(await requestStepUpOtp());
      setStep('verify');
    } catch (err) {
      setFormError(getErrorMessage(t, err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AccountShell title={t('deleteAccount.title')} fallbackTo={ROUTES.ACCOUNT_SECURITY} desktopBackTo={ROUTES.ACCOUNT_SECURITY}>
      <AsyncState loading={loading} error={error} onRetry={reload}>
        {step === 'confirm' ? (
          <div className="tw-flex tw-flex-col tw-gap-4 tw-rounded-2xl tw-border tw-border-[var(--c-line)] tw-p-4 lg:tw-p-6">
            <div className="tw-flex tw-items-start tw-gap-3">
              <span className="tw-flex tw-h-9 tw-w-9 tw-shrink-0 tw-items-center tw-justify-center tw-rounded-xl tw-bg-[var(--c-badge-sale-bg)] tw-text-[var(--c-danger)]">
                <Icon name="alert" size={18} />
              </span>
              <div>
                <h2 className="tw-m-0 tw-text-base tw-font-semibold tw-text-ink">{t('deleteAccount.warningTitle')}</h2>
                <p className="tw-m-0 tw-mt-1 tw-text-sm tw-text-[var(--c-muted)]">{t('deleteAccount.warningBody')}</p>
              </div>
            </div>

            <ul className="tw-m-0 tw-list-disc tw-pl-9 tw-text-sm tw-text-ink tw-space-y-1.5">
              {['one', 'two', 'three'].map((key) => (
                <li key={key}>{t(`deleteAccount.consequences.${key}`)}</li>
              ))}
            </ul>

            {hasActiveOrder && <Notice tone="warning">{t('deleteAccount.activeOrder')}</Notice>}

            <Field
              label={t('deleteAccount.confirmLabel', { word })}
              name="confirmation"
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              value={typed}
              onChange={(event) => setTyped(event.target.value)}
              disabled={hasActiveOrder}
            />

            {formError && <Notice tone="error">{formError}</Notice>}

            <div className="tw-flex tw-flex-col tw-gap-2 sm:tw-flex-row-reverse">
              <Button variant="danger" fullWidth loading={busy} disabled={!confirmed || hasActiveOrder} onClick={startVerification}>
                {t('deleteAccount.continue')}
              </Button>
              <Button variant="outline" fullWidth onClick={() => navigate(ROUTES.ACCOUNT_SECURITY)}>
                {t('deleteAccount.keep')}
              </Button>
            </div>
          </div>
        ) : (
          <div className="tw-rounded-2xl tw-border tw-border-[var(--c-line)] tw-p-4 lg:tw-p-6">
            <h2 className="tw-m-0 tw-text-base tw-font-semibold tw-text-ink">{t('deleteAccount.verifyTitle')}</h2>
            <p className="tw-m-0 tw-mb-4 tw-mt-1 tw-text-sm tw-text-[var(--c-muted)]">{t('deleteAccount.verifyBody')}</p>
            <OtpForm
              challenge={challenge}
              verify={async (code) => {
                const { reauthToken } = await verifyStepUpOtp(code);
                return deleteAccount({ reauthToken, confirmation: typed });
              }}
              resend={requestStepUpOtp}
              onVerified={() => authStore.expire('deleted')}
              onBack={() => {
                setStep('confirm');
                setChallenge(null);
              }}
              backLabel={t('common.back')}
              submitLabel={t('deleteAccount.delete')}
              submitVariant="danger"
            />
          </div>
        )}
      </AsyncState>
    </AccountShell>
  );
}

export default DeleteAccountPage;
