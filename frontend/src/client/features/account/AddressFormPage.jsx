import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AccountShell } from './components/AccountShell';
import { AddressForm } from './components/AddressForm';
import { AsyncState } from '../../components/ui/AsyncState';
import { EmptyState } from '../../components/ui/EmptyState';
import { listAddresses, saveAddress } from '../../services/account';
import { useResource } from '../../hooks/useResource';
import { useT } from '../../hooks/useT';
import { ROUTES } from '../../config/constants';
import { isValidId } from '../../utils/validators';

/** Add (`/account/addresses/new`) or edit (`/account/addresses/:id`) an address. */
export function AddressFormPage() {
  const { t } = useT();
  const navigate = useNavigate();
  const { id } = useParams();
  const editing = Boolean(id);

  const { data, loading, error, reload } = useResource(
    () => (editing ? listAddresses() : Promise.resolve(null)),
    [id]
  );

  const existing = editing && data ? data.find((address) => address.id === id) : null;
  const missing = editing && data && (!isValidId(id) || !existing);

  const goBack = (flash) => navigate(ROUTES.ACCOUNT_ADDRESSES, { state: flash ? { flash } : undefined });

  return (
    <AccountShell
      title={editing ? t('addresses.editTitle') : t('addresses.newTitle')}
      fallbackTo={ROUTES.ACCOUNT_ADDRESSES}
      desktopBackTo={ROUTES.ACCOUNT_ADDRESSES}
    >
      <AsyncState loading={loading} error={error} onRetry={reload}>
        {missing ? (
          <EmptyState
            icon="map-pin"
            title={t('orders.notFoundTitle')}
            body={t('orders.notFoundBody')}
            actionLabel={t('addresses.title')}
            actionTo={ROUTES.ACCOUNT_ADDRESSES}
          />
        ) : (
          <AddressForm
            initial={existing || undefined}
            lockDefault={Boolean(existing?.isDefault)}
            onSubmit={async (values) => {
              await saveAddress(values, existing?.id);
              goBack('saved');
            }}
            onCancel={() => goBack()}
          />
        )}
      </AsyncState>
    </AccountShell>
  );
}

export default AddressFormPage;
