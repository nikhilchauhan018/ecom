import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AccountShell } from './components/AccountShell';
import { AsyncState } from '../../components/ui/AsyncState';
import { Button } from '../../components/ui/Button';
import { Dialog } from '../../components/ui/Dialog';
import { EmptyState } from '../../components/ui/EmptyState';
import { Icon } from '../../components/ui/Icon';
import { Notice } from '../../components/ui/Notice';
import { deleteAddress, listAddresses, setDefaultAddress } from '../../services/account';
import { useResource } from '../../hooks/useResource';
import { useT } from '../../hooks/useT';
import { ROUTES, addressEditRoute } from '../../config/constants';
import { getErrorMessage } from '../../utils/errors';
import { formatAddressLines } from '../../utils/format';
import { maskPhone } from '../../utils/validators';

function AddressCard({ address, busy, onSetDefault, onDelete }) {
  const { t } = useT();
  const lines = formatAddressLines(address);

  return (
    <li className="tw-rounded-2xl tw-border tw-border-[var(--c-line)] tw-p-4">
      <div className="tw-mb-2 tw-flex tw-items-center tw-gap-2">
        <span className="tw-flex tw-items-center tw-gap-1.5 tw-text-xs tw-font-semibold tw-uppercase tw-tracking-wider tw-text-[var(--c-muted)]">
          <Icon name={address.label === 'work' ? 'package' : address.label === 'home' ? 'home' : 'map-pin'} size={14} />
          {t(`addresses.labels.${address.label}`)}
        </span>
        {address.isDefault && (
          <span className="tw-rounded-full tw-bg-[var(--c-success-tint)] tw-px-2 tw-py-0.5 tw-text-[11px] tw-font-bold tw-text-[var(--c-success)]">
            {t('addresses.defaultBadge')}
          </span>
        )}
      </div>

      <address className="tw-m-0 tw-text-sm tw-not-italic tw-leading-relaxed tw-text-ink">
        {lines.map((line, index) => (
          <div key={index} className={index === 0 ? 'tw-font-semibold' : undefined}>
            {line}
          </div>
        ))}
        <div className="tw-mt-1 tw-text-[var(--c-muted)]">{maskPhone(address.phone)}</div>
      </address>

      <div className="tw-mt-3 tw-flex tw-flex-wrap tw-items-center tw-gap-x-4 tw-gap-y-1 tw-text-sm tw-font-semibold">
        <Link to={addressEditRoute(address.id)} className="touch-target tw-text-[var(--c-success)]">
          {t('addresses.edit')}
        </Link>
        {!address.isDefault && (
          <button
            type="button"
            disabled={busy}
            onClick={() => onSetDefault(address)}
            className="touch-target tw-text-[var(--c-success)] disabled:tw-opacity-60"
          >
            {t('addresses.setDefault')}
          </button>
        )}
        <button
          type="button"
          disabled={busy}
          onClick={() => onDelete(address)}
          className="touch-target tw-text-[var(--c-danger)] disabled:tw-opacity-60"
        >
          {t('addresses.delete')}
        </button>
      </div>
    </li>
  );
}

export function AddressesPage() {
  const { t } = useT();
  const location = useLocation();
  const { data, setData, loading, error, reload } = useResource(listAddresses, []);
  const [flash, setFlash] = useState(location.state?.flash === 'saved' ? t('addresses.saved') : '');
  const [actionError, setActionError] = useState('');
  const [busy, setBusy] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);

  const run = async (action, successMessage) => {
    setBusy(true);
    setActionError('');
    setFlash('');
    try {
      const next = await action();
      setData(next);
      setFlash(successMessage);
    } catch (err) {
      setActionError(getErrorMessage(t, err));
    } finally {
      setBusy(false);
    }
  };

  const confirmDelete = async () => {
    const target = pendingDelete;
    setPendingDelete(null);
    if (target) await run(() => deleteAddress(target.id), t('addresses.deleted'));
  };

  return (
    <AccountShell title={t('addresses.title')}>
      <div className="tw-flex tw-items-center tw-justify-between tw-gap-3">
        <p className="tw-m-0 tw-text-sm tw-text-[var(--c-muted)]">{t('addresses.intro')}</p>
        <Link
          to={ROUTES.ADDRESS_NEW}
          className="touch-target tw-shrink-0 tw-gap-1.5 tw-rounded-full tw-bg-[var(--brand)] tw-px-4 tw-text-sm tw-font-medium tw-text-[var(--brand-contrast)]"
        >
          <Icon name="plus" size={16} />
          {t('addresses.add')}
        </Link>
      </div>

      {flash && <Notice tone="success">{flash}</Notice>}
      {actionError && <Notice tone="error">{actionError}</Notice>}

      <AsyncState loading={loading} error={error} onRetry={reload}>
        {data && data.length === 0 ? (
          <EmptyState icon="map-pin" title={t('addresses.emptyTitle')} body={t('addresses.emptyBody')} />
        ) : (
          <ul className="tw-m-0 tw-grid tw-list-none tw-gap-4 tw-p-0 md:tw-grid-cols-2">
            {(data || []).map((address) => (
              <AddressCard
                key={address.id}
                address={address}
                busy={busy}
                onSetDefault={(item) => run(() => setDefaultAddress(item.id), t('addresses.defaultUpdated'))}
                onDelete={setPendingDelete}
              />
            ))}
          </ul>
        )}
      </AsyncState>

      {pendingDelete && (
        <Dialog open onClose={() => setPendingDelete(null)} title={t('addresses.deleteTitle')} closeLabel={t('common.close')}>
          <p className="tw-m-0 tw-mb-5 tw-text-sm tw-text-[var(--c-muted)]">{t('addresses.deleteBody')}</p>
          <div className="tw-flex tw-flex-col tw-gap-2 sm:tw-flex-row-reverse">
            <Button variant="danger" fullWidth onClick={confirmDelete}>
              {t('addresses.delete')}
            </Button>
            <Button variant="outline" fullWidth onClick={() => setPendingDelete(null)}>
              {t('common.cancel')}
            </Button>
          </div>
        </Dialog>
      )}
    </AccountShell>
  );
}

export default AddressesPage;
