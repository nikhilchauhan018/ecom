import React, { useState } from 'react';
import { AccountShell } from './components/AccountShell';
import { AsyncState, SkeletonBlocks } from '../../components/ui/AsyncState';
import { Notice } from '../../components/ui/Notice';
import { Switch } from '../../components/ui/Switch';
import { getNotificationPrefs, updateNotificationPrefs } from '../../services/account';
import { useResource } from '../../hooks/useResource';
import { useT } from '../../hooks/useT';

const GROUPS = [
  { id: 'orders', items: ['orderUpdates', 'deliverySms', 'emailReceipts'] },
  { id: 'marketing', items: ['promotions', 'restock'] },
];

/** Transactional messages the customer cannot opt out of. */
const REQUIRED = ['orderUpdates'];

export function NotificationsPage() {
  const { t } = useT();
  const { data, setData, loading, error, reload } = useResource(getNotificationPrefs, []);
  const [busyKey, setBusyKey] = useState(null);
  const [flash, setFlash] = useState('');
  const [failure, setFailure] = useState('');

  // Optimistic update: flip immediately, roll back only that key if the server rejects it.
  const toggle = async (key, value) => {
    setFlash('');
    setFailure('');
    setBusyKey(key);
    setData((prev) => ({ ...prev, [key]: value }));
    try {
      const next = await updateNotificationPrefs({ [key]: value });
      setData(next);
      setFlash(t('notifications.saved'));
    } catch {
      setData((prev) => ({ ...prev, [key]: !value }));
      setFailure(t('notifications.failed'));
    } finally {
      setBusyKey(null);
    }
  };

  return (
    <AccountShell title={t('notifications.title')}>
      <p className="tw-m-0 tw-text-sm tw-text-[var(--c-muted)]">{t('notifications.intro')}</p>

      {flash && <Notice tone="success">{flash}</Notice>}
      {failure && <Notice tone="error">{failure}</Notice>}

      <AsyncState loading={loading} error={error} onRetry={reload} skeleton={<SkeletonBlocks heights={[170, 120]} />}>
        {data &&
          GROUPS.map((group) => (
            <section key={group.id} aria-labelledby={`notif-${group.id}`}>
              <h2
                id={`notif-${group.id}`}
                className="tw-m-0 tw-mb-2 tw-px-1 tw-text-xs tw-font-semibold tw-uppercase tw-tracking-wider tw-text-[var(--c-muted)]"
              >
                {t(`notifications.groups.${group.id}`)}
              </h2>
              <div className="tw-overflow-hidden tw-rounded-2xl tw-border tw-border-[var(--c-line)] tw-divide-y tw-divide-[var(--c-hair)]">
                {group.items.map((key) => (
                  <Switch
                    key={key}
                    label={t(`notifications.items.${key}.label`)}
                    description={t(`notifications.items.${key}.description`)}
                    checked={Boolean(data[key])}
                    disabled={REQUIRED.includes(key)}
                    busy={busyKey === key}
                    onChange={(value) => toggle(key, value)}
                  />
                ))}
              </div>
            </section>
          ))}
      </AsyncState>
    </AccountShell>
  );
}

export default NotificationsPage;
