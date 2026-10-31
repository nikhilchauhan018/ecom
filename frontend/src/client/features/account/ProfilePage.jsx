import React, { useState } from 'react';
import { AccountShell } from './components/AccountShell';
import { ChangePhoneDialog } from './ChangePhoneDialog';
import { AsyncState } from '../../components/ui/AsyncState';
import { Button } from '../../components/ui/Button';
import { Field } from '../../components/ui/Field';
import { Icon } from '../../components/ui/Icon';
import { Notice } from '../../components/ui/Notice';
import { getProfile, updateProfile } from '../../services/account';
import { authStore } from '../../stores/authStore';
import { useResource } from '../../hooks/useResource';
import { useT } from '../../hooks/useT';
import { useUnsavedChangesWarning } from '../../hooks/useUnsavedChangesWarning';
import { getErrorMessage, translateFieldErrors } from '../../utils/errors';
import { LIMITS, validateProfile } from '../../utils/validators';

function ProfileForm({ initial }) {
  const { t } = useT();
  const [saved, setSaved] = useState(initial);
  const [values, setValues] = useState({ name: initial.name, email: initial.email });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [success, setSuccess] = useState('');
  const [busy, setBusy] = useState(false);
  const [changingPhone, setChangingPhone] = useState(false);

  const dirty = values.name !== saved.name || values.email !== saved.email;
  useUnsavedChangesWarning(dirty);

  const setField = (name) => (event) => {
    setValues((prev) => ({ ...prev, [name]: event.target.value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
    setSuccess('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (busy || !dirty) return;

    const result = validateProfile(values);
    if (!result.valid) {
      setErrors(translateFieldErrors(t, result.errors));
      return;
    }

    setBusy(true);
    setFormError('');
    setSuccess('');
    try {
      const updated = await updateProfile(result.values);
      setSaved(updated);
      setValues({ name: updated.name, email: updated.email });
      authStore.updateUser(updated);
      setSuccess(t('profile.saved'));
    } catch (error) {
      if (error?.fieldErrors) setErrors(translateFieldErrors(t, error.fieldErrors));
      setFormError(getErrorMessage(t, error));
    } finally {
      setBusy(false);
    }
  };

  const handleDiscard = () => {
    setValues({ name: saved.name, email: saved.email });
    setErrors({});
    setFormError('');
  };

  return (
    <>
      <form
        onSubmit={handleSubmit}
        noValidate
        className="tw-flex tw-flex-col tw-gap-4 tw-rounded-2xl tw-border tw-border-[var(--c-line)] tw-p-4 lg:tw-p-6"
      >
        <Field
          label={t('profile.name')}
          name="name"
          autoComplete="name"
          maxLength={LIMITS.name}
          value={values.name}
          onChange={setField('name')}
          error={errors.name}
          required
        />
        <Field
          label={t('profile.email')}
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          maxLength={LIMITS.email}
          hint={t('profile.emailHint')}
          value={values.email}
          onChange={setField('email')}
          error={errors.email}
        />

        {formError && <Notice tone="error">{formError}</Notice>}
        {success && <Notice tone="success">{success}</Notice>}
        {dirty && !success && <Notice tone="warning">{t('profile.unsaved')}</Notice>}

        <div className="tw-flex tw-flex-col tw-gap-2 sm:tw-flex-row-reverse">
          <Button type="submit" fullWidth loading={busy} disabled={!dirty}>
            {t('profile.save')}
          </Button>
          {dirty && (
            <Button variant="outline" fullWidth onClick={handleDiscard} disabled={busy}>
              {t('profile.discard')}
            </Button>
          )}
        </div>
      </form>

      <section className="tw-rounded-2xl tw-border tw-border-[var(--c-line)] tw-p-4 lg:tw-p-6">
        <Field
          label={t('profile.phone')}
          name="phone"
          value={saved.phoneMasked}
          hint={t('profile.phoneHint')}
          disabled
          readOnly
          autoComplete="off"
        />
        <div className="tw-mt-3 tw-flex tw-items-center tw-justify-between tw-gap-3">
          {saved.phoneVerified && (
            <span className="tw-flex tw-items-center tw-gap-1 tw-text-xs tw-font-semibold tw-text-[var(--c-success)]">
              <Icon name="check" size={12} />
              {t('account.mobileVerified')}
            </span>
          )}
          <Button variant="outline" size="sm" onClick={() => setChangingPhone(true)} className="tw-ml-auto">
            {t('profile.changePhone')}
          </Button>
        </div>
      </section>

      {changingPhone && (
        <ChangePhoneDialog
          onClose={() => setChangingPhone(false)}
          onChanged={(user) => {
            setSaved((prev) => ({ ...prev, ...user }));
            authStore.updateUser(user);
            setSuccess(t('profile.phoneChanged'));
          }}
        />
      )}
    </>
  );
}

export function ProfilePage() {
  const { t } = useT();
  const { data, loading, error, reload } = useResource(getProfile, []);

  return (
    <AccountShell title={t('profile.title')}>
      <AsyncState loading={loading} error={error} onRetry={reload}>
        {data && <ProfileForm initial={data} />}
      </AsyncState>
    </AccountShell>
  );
}

export default ProfilePage;
