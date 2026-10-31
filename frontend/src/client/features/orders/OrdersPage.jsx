import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AccountShell } from '../account/components/AccountShell';
import { OrderStatusPill } from './components/OrderStatusPill';
import { AsyncState, SkeletonBlocks } from '../../components/ui/AsyncState';
import { EmptyState } from '../../components/ui/EmptyState';
import { Icon } from '../../components/ui/Icon';
import { listOrders } from '../../services/account';
import { useResource } from '../../hooks/useResource';
import { useSettings } from '../../hooks/useSettings';
import { useT } from '../../hooks/useT';
import { ROUTES, orderRoute } from '../../config/constants';
import { cn } from '../../utils/cn';
import { formatDate } from '../../utils/format';
import { formatMoney } from '../../utils/formatMoney';
import { countItems, filterOrders } from '../../utils/orders';

const FILTERS = ['all', 'active', 'delivered', 'cancelled'];

function OrderCard({ order, settings }) {
  const { t } = useT();
  const count = countItems(order);
  const names = order.items.map((item) => item.name);
  const summary = names.length > 2 ? `${names.slice(0, 2).join(', ')} +${names.length - 2}` : names.join(', ');

  return (
    <li>
      <Link
        to={orderRoute(order.id)}
        className="tw-block tw-rounded-2xl tw-border tw-border-[var(--c-line)] tw-p-4 tw-text-ink hover:tw-bg-[var(--c-card)] tw-transition-colors lg:tw-p-5"
      >
        <div className="tw-flex tw-items-start tw-justify-between tw-gap-3">
          <div className="tw-min-w-0">
            <p className="tw-m-0 tw-text-base tw-font-bold">{t('orders.detailTitle', { id: order.id })}</p>
            <p className="tw-m-0 tw-text-xs tw-text-[var(--c-muted)]">
              {t('orders.placedOn', { date: formatDate(order.placedAt, settings.locale) })}
            </p>
          </div>
          <OrderStatusPill status={order.status} />
        </div>

        <div className="tw-mt-4 tw-flex tw-items-center tw-gap-3">
          <div className="tw-flex -tw-space-x-2" aria-hidden="true">
            {order.items.slice(0, 3).map((item) => (
              <span
                key={item.id}
                className="tw-h-10 tw-w-10 tw-rounded-lg tw-border-2 tw-border-[var(--c-page)]"
                style={{ backgroundColor: item.color }}
              />
            ))}
          </div>
          <p className="tw-m-0 tw-min-w-0 tw-flex-1 tw-truncate tw-text-sm tw-text-[var(--c-muted)]">{summary}</p>
        </div>

        <div className="tw-mt-4 tw-flex tw-items-center tw-justify-between tw-text-sm">
          <span className="tw-text-[var(--c-muted)]">
            {t(count === 1 ? 'account.order.itemOne' : 'account.order.itemMany', { count })} ·{' '}
            <strong className="tw-text-ink">{formatMoney(order.total, settings)}</strong>
          </span>
          <span className="tw-inline-flex tw-items-center tw-gap-1 tw-font-semibold tw-text-[var(--c-success)]">
            {t('orders.view')}
            <Icon name="chevron-right" size={16} />
          </span>
        </div>
      </Link>
    </li>
  );
}

export function OrdersPage() {
  const { t } = useT();
  const settings = useSettings();
  const { data, loading, error, reload } = useResource(listOrders, []);
  const [filter, setFilter] = useState('all');

  const visible = filterOrders(data, filter);

  return (
    <AccountShell title={t('orders.title')} wide>
      <div role="group" aria-label={t('orders.title')} className="tw-flex tw-gap-2 tw-overflow-x-auto tw-pb-1">
        {FILTERS.map((id) => (
          <button
            key={id}
            type="button"
            aria-pressed={filter === id}
            onClick={() => setFilter(id)}
            className={cn(
              'touch-target tw-shrink-0 tw-rounded-full tw-border tw-px-4 tw-text-sm tw-font-medium tw-transition-colors',
              filter === id
                ? 'tw-border-[var(--brand)] tw-bg-[var(--brand)] tw-text-[var(--brand-contrast)]'
                : 'tw-border-[var(--c-line)] tw-text-ink hover:tw-bg-[var(--c-card)]'
            )}
          >
            {t(`orders.filters.${id}`)}
          </button>
        ))}
      </div>

      <AsyncState loading={loading} error={error} onRetry={reload} skeleton={<SkeletonBlocks heights={[150, 150]} />}>
        {visible.length === 0 ? (
          <EmptyState
            icon="package"
            title={t('orders.emptyTitle')}
            body={t('orders.emptyBody')}
            actionLabel={t('orders.shopNow')}
            actionTo={ROUTES.SHOP}
          />
        ) : (
          <ul className="tw-m-0 tw-grid tw-list-none tw-gap-4 tw-p-0 lg:tw-grid-cols-2">
            {visible.map((order) => (
              <OrderCard key={order.id} order={order} settings={settings} />
            ))}
          </ul>
        )}
      </AsyncState>
    </AccountShell>
  );
}

export default OrdersPage;
