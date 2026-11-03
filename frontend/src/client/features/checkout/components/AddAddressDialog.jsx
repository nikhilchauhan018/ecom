import React from 'react';
import { Dialog } from '../../../components/ui/Dialog';
import { AddressForm } from '../../account/components/AddressForm';
import { useT } from '../../../hooks/useT';

/**
 * "Add a new address" dialog. Reuses the account AddressForm (same validation) so the shopper
 * never leaves checkout. `onSubmit` receives validated values and may throw to show a form error.
 * @param {{ open: boolean, onClose: () => void, onSubmit: (values: object) => Promise<void> }} props
 */
export function AddAddressDialog({ open, onClose, onSubmit, initial, editing = false }) {
  const { t } = useT();
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={editing ? t('checkout.editAddressTitle') : t('checkout.addAddressTitle')}
      closeLabel={t('common.close')}
    >
      <div className="sf-checkout-dialog-form">
        <AddressForm key={initial?.id || 'new-address'} initial={initial} onSubmit={onSubmit} onCancel={onClose} />
      </div>
    </Dialog>
  );
}

export default AddAddressDialog;
