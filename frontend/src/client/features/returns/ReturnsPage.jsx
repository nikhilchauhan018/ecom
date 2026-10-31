import React from 'react';
import { Link } from 'react-router-dom';
import { AccountShell } from '../account/components/AccountShell';
import { AsyncState, SkeletonBlocks } from '../../components/ui/AsyncState';
import { EmptyState } from '../../components/ui/EmptyState';
import { Icon } from '../../components/ui/Icon';
import { listReturns } from '../../services/account';
import { useResource } from '../../hooks/useResource';
import { useSettings } from '../../hooks/useSettings';
import { useT } from '../../hooks/useT';
import { ROUTES, orderRoute } from '../../config/constants';
import { cn } from '../../utils/cn';
import { formatDate } from '../../utils/format';
import { formatMoney } from '../../utils/formatMoney';

const STATUS_TONES = {
  requested: 'tw-bg-[var(--c-badge-low-bg)] tw-text-[var(--c-badge-low-fg)]',
  approved: 'tw-bg-[var(--c-success-tint)] tw-text-[var(--c-success)]',
  refunded: 'tw-bg-[var(--c-success-tint)] tw-text-[var(--c-success)]',
  rejected: 'tw-bg-[var(--c-badge-sale-bg)] tw-text-[var(--c-badge-sale-fg)]',
};

function ReturnCard({ request, settings }) {
  const { t } = useT();

  return (
    <li className="tw-rounded-2xl tw-border tw-border-[var(--c-line)] tw-p-4 lg:tw-p-5">
      <div className="tw-flex tw-items-start tw-justify-between tw-gap-3">
        <div className="tw-min-w-0">
          <Link to={orderRoute(request.orderId)} className="tw-text-base tw-font-bold tw-text-ink tw-no-underline hover:tw-underline">
            {t('returns.orderRef', { id: request.orderId })}
          </Link>
          <p className="tw-m-0 tw-text-xs tw-text-[var(--c-muted)]">
            {t('returns.requestedOn', { date: formatDate(request.createdAt, settings.locale) })}
          </p>
        </div>
        <span className={cn('tw-shrink-0 tw-rounded-full tw-px-3 tw-py-1.5 tw-text-xs tw-font-bold', STATUS_TONES[request.status])}>
          {t(`returns.status.${request.status}`)}
        </span>
      </div>

      <ul className="tw-m-0 tw-mt-3 tw-list-none tw-p-0 tw-text-sm tw-text-ink">
        {request.items.map((item) => (
          <li key={item.itemId}>
            {item.name} <span className="tw-text-[var(--c-muted)]">× {item.qty}</span>
          </li>
        ))}
      </ul>

      <div className="tw-mt-3 tw-flex tw-items-center tw-justify-between tw-text-sm">
        <span className="tw-text-[var(--c-muted)]">{t(`returns.reasons.${request.reason}`)}</span>
        <span className="tw-text-[var(--c-muted)]">
          {t('returns.refund')}: <strong className="tw-text-ink">{formatMoney(request.refundAmount, settings)}</strong>
        </span>
      </div>
    </li>
  );
}

export function ReturnsPage() {
  const { t } = useT();
  const settings = useSettings();
  const { data, loading, error, reload } = useResource(listReturns, []);

  return (
    <AccountShell title={t('returns.title')}>
      <div className="tw-flex tw-items-center tw-justify-between tw-gap-3">
        <p className="tw-m-0 tw-text-sm tw-text-[var(--c-muted)]">{t('returns.intro')}</p>
        <Link
          to={ROUTES.RETURN_NEW}
          className="touch-target tw-shrink-0 tw-gap-1.5 tw-rounded-full tw-bg-[var(--brand)] tw-px-4 tw-text-sm tw-font-medium tw-text-[var(--brand-contrast)]"
        >
          <Icon name="undo" size={16} />
          {t('returns.requestReturn')}
        </Link>
      </div>

      <AsyncState loading={loading} error={error} onRetry={reload} skeleton={<SkeletonBlocks heights={[130, 130]} />}>
        {data && data.length === 0 ? (
          <EmptyState icon="undo" title={t('returns.emptyTitle')} body={t('returns.emptyBody')} />
        ) : (
          <ul className="tw-m-0 tw-grid tw-list-none tw-gap-4 tw-p-0 md:tw-grid-cols-2">
            {(data || []).map((request) => (
              <ReturnCard key={request.id} request={request} settings={settings} />
            ))}
          </ul>
        )}
      </AsyncState>
    </AccountShell>
  );
}

export default ReturnsPage;
