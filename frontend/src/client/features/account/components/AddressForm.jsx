import React, { useState } from 'react';
import { Button } from '../../../components/ui/Button';
import { Field } from '../../../components/ui/Field';
import { Notice } from '../../../components/ui/Notice';
import { useT } from '../../../hooks/useT';
import { useUnsavedChangesWarning } from '../../../hooks/useUnsavedChangesWarning';
import { COUNTRIES } from '../../../config/countries';
import { getErrorMessage, translateFieldErrors } from '../../../utils/errors';
import { ADDRESS_LABELS, LIMITS, validateAddress } from '../../../utils/validators';

export const EMPTY_ADDRESS = {
  label: 'home',
  fullName: '',
  phone: '',
  line1: '',
  line2: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'US',
  isDefault: false,
};

/**
 * Add / edit address form. Validates with the same rules as the server, shows per-field
 * errors, warns before the tab closes with unsaved edits.
 * @param {{ initial?: object, lockDefault?: boolean, onSubmit: (values: object) => Promise<void>, onCancel: () => void }} props
 */
export function AddressForm({ initial = EMPTY_ADDRESS, lockDefault = false, onSubmit, onCancel }) {
  const { t } = useT();
  const [values, setValues] = useState({ ...EMPTY_ADDRESS, ...initial });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const dirty = !done && JSON.stringify(values) !== JSON.stringify({ ...EMPTY_ADDRESS, ...initial });
  useUnsavedChangesWarning(dirty);

  const setField = (name) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (busy) return;

    const result = validateAddress(values);
    if (!result.valid) {
      setErrors(translateFieldErrors(t, result.errors));
      return;
    }

    setBusy(true);
    setFormError('');
    try {
      await onSubmit(result.values);
      setDone(true);
    } catch (error) {
      if (error?.fieldErrors) setErrors(translateFieldErrors(t, error.fieldErrors));
      setFormError(getErrorMessage(t, error));
      setBusy(false);
    }
  };

  const f = (key) => t(`addresses.fields.${key}`);

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="tw-flex tw-flex-col tw-gap-4 tw-rounded-2xl tw-border tw-border-[var(--c-line)] tw-p-4 lg:tw-p-6"
    >
      <Field as="select" label={f('label')} name="label" value={values.label} onChange={setField('label')} error={errors.label} required>
        {ADDRESS_LABELS.map((label) => (
          <option key={label} value={label}>
            {t(`addresses.labels.${label}`)}
          </option>
        ))}
      </Field>

      <div className="tw-grid tw-gap-4 sm:tw-grid-cols-2">
        <Field label={f('fullName')} name="fullName" autoComplete="name" maxLength={LIMITS.name} value={values.fullName} onChange={setField('fullName')} error={errors.fullName} required />
        <Field label={f('phone')} name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder={t('auth.phonePlaceholder')} value={values.phone} onChange={setField('phone')} error={errors.phone} required />
      </div>

      <Field label={f('line1')} name="line1" autoComplete="address-line1" maxLength={LIMITS.addressLine} value={values.line1} onChange={setField('line1')} error={errors.line1} required />
      <Field label={f('line2')} name="line2" autoComplete="address-line2" maxLength={LIMITS.addressLine} value={values.line2} onChange={setField('line2')} error={errors.line2} />

      <div className="tw-grid tw-gap-4 sm:tw-grid-cols-2">
        <Field label={f('city')} name="city" autoComplete="address-level2" maxLength={LIMITS.city} value={values.city} onChange={setField('city')} error={errors.city} required />
        <Field label={f('state')} name="state" autoComplete="address-level1" maxLength={LIMITS.state} value={values.state} onChange={setField('state')} error={errors.state} required />
      </div>

      <div className="tw-grid tw-gap-4 sm:tw-grid-cols-2">
        <Field label={f('postalCode')} name="postalCode" autoComplete="postal-code" maxLength={LIMITS.postalCode} value={values.postalCode} onChange={setField('postalCode')} error={errors.postalCode} required />
        <Field as="select" label={f('country')} name="country" autoComplete="country" value={values.country} onChange={setField('country')} error={errors.country} required>
          {COUNTRIES.map((country) => (
            <option key={country.code} value={country.code}>
              {country.name}
            </option>
          ))}
        </Field>
      </div>

      <label className="tw-m-0 tw-flex tw-items-center tw-gap-2.5 tw-text-sm tw-text-ink">
        <input
          type="checkbox"
          name="isDefault"
          checked={values.isDefault}
          onChange={setField('isDefault')}
          disabled={lockDefault}
          className="tw-h-4 tw-w-4"
        />
        {f('makeDefault')}
      </label>

      {formError && <Notice tone="error">{formError}</Notice>}

      <div className="tw-flex tw-flex-col tw-gap-2 sm:tw-flex-row-reverse">
        <Button type="submit" fullWidth loading={busy}>
          {t('addresses.save')}
        </Button>
        <Button variant="outline" fullWidth onClick={onCancel} disabled={busy}>
          {t('common.cancel')}
        </Button>
      </div>
    </form>
  );
}

export default AddressForm;
