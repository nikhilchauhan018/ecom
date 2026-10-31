import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AccountShell } from '../account/components/AccountShell';
import { OrderStatusPill } from './components/OrderStatusPill';
import { OrderTimeline } from './components/OrderTimeline';
import { AsyncState } from '../../components/ui/AsyncState';
import { EmptyState } from '../../components/ui/EmptyState';
import { Icon } from '../../components/ui/Icon';
import { Notice } from '../../components/ui/Notice';
import { getOrder, listReturns } from '../../services/account';
import { useResource } from '../../hooks/useResource';
import { useSettings } from '../../hooks/useSettings';
import { useT } from '../../hooks/useT';
import { ROUTES, returnRequestRoute } from '../../config/constants';
import { formatAddressLines, formatDate } from '../../utils/format';
import { formatMoney } from '../../utils/formatMoney';
import { getReturnDeadline, isReturnEligible } from '../../utils/orders';

function Card({ title, children, className = '' }) {
  return (
    <section className={`tw-rounded-2xl tw-border tw-border-[var(--c-line)] tw-p-4 lg:tw-p-5 ${className}`}>
      {title && <h2 className="tw-m-0 tw-mb-3 tw-text-base tw-font-semibold tw-text-ink">{title}</h2>}
      {children}
    </section>
  );
}

function Row({ label, value, strong = false }) {
  return (
    <div className={`tw-flex tw-items-center tw-justify-between tw-gap-3 tw-text-sm ${strong ? 'tw-font-bold tw-text-ink' : 'tw-text-[var(--c-muted)]'}`}>
      <span>{label}</span>
      <span className={strong ? '' : 'tw-text-ink'}>{value}</span>
    </div>
  );
}

function CopyButton({ value }) {
  const { t } = useT();
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard blocked (insecure context / permissions): the ID stays selectable on screen
    }
  };

  return (
    <button type="button" onClick={copy} className="touch-target tw-text-xs tw-font-semibold tw-text-[var(--c-success)]" aria-live="polite">
      {copied ? t('orders.copied') : t('orders.copyTracking')}
    </button>
  );
}

function OrderView({ order, returns, settings }) {
  const { t } = useT();
  const money = (amount) => formatMoney(amount, settings);
  const eligible = isReturnEligible(order, returns);
  const deadline = getReturnDeadline(order);
  const hasReturn = returns.some((item) => item.orderId === order.id && item.status !== 'rejected');

  return (
    <div className="tw-grid tw-gap-5 lg:tw-grid-cols-[minmax(0,1fr)_340px] lg:tw-items-start lg:tw-gap-8">
      <div className="tw-flex tw-flex-col tw-gap-5">
        <div className="tw-flex tw-items-center tw-justify-between tw-gap-3">
          <p className="tw-m-0 tw-text-sm tw-text-[var(--c-muted)]">
            {t('orders.placedOn', { date: formatDate(order.placedAt, settings.locale) })}
          </p>
          <OrderStatusPill status={order.status} />
        </div>

        <Card title={t('orders.timeline')}>
          <OrderTimeline order={order} locale={settings.locale} />
          {order.eta && order.status !== 'delivered' && order.status !== 'cancelled' && (
            <p className="tw-m-0 tw-mt-4 tw-flex tw-items-center tw-gap-2 tw-text-sm tw-text-ink">
              <Icon name="truck" size={16} className="tw-text-[var(--c-success)]" />
              {t('orders.eta')}: <strong>{formatDate(order.eta, settings.locale)}</strong>
            </p>
          )}
        </Card>

        <Card title={t('orders.itemsTitle')}>
          <ul className="tw-m-0 tw-list-none tw-p-0 tw-divide-y tw-divide-[var(--c-hair)]">
            {order.items.map((item) => (
              <li key={item.id} className="tw-flex tw-items-center tw-gap-3 tw-py-3 first:tw-pt-0 last:tw-pb-0">
                <span aria-hidden="true" className="tw-h-14 tw-w-14 tw-shrink-0 tw-rounded-xl" style={{ backgroundColor: item.color }} />
                <div className="tw-min-w-0 tw-flex-1">
                  <p className="tw-m-0 tw-truncate tw-text-[15px] tw-font-medium tw-text-ink">{item.name}</p>
                  <p className="tw-m-0 tw-text-xs tw-text-[var(--c-muted)]">
                    {item.variant} · {t('orders.qty', { count: item.qty })}
                  </p>
                </div>
                <p className="tw-m-0 tw-text-sm tw-font-semibold tw-text-ink">{money(item.price * item.qty)}</p>
              </li>
            ))}
          </ul>
        </Card>

        {order.status === 'delivered' && (
          <>
            {eligible && (
              <Notice tone="info">
                <div className="tw-flex tw-flex-wrap tw-items-center tw-justify-between tw-gap-3">
                  <span>{t('orders.returnBy', { date: formatDate(deadline, settings.locale) })}</span>
                  <Link to={returnRequestRoute(order.id)} className="tw-font-semibold tw-text-[var(--c-success)]">
                    {t('orders.returnItems')}
                  </Link>
                </div>
              </Notice>
            )}
            {!eligible && hasReturn && <Notice tone="success">{t('orders.returnRequested')}</Notice>}
            {!eligible && !hasReturn && <Notice tone="warning">{t('orders.returnClosed')}</Notice>}
          </>
        )}
      </div>

      <div className="tw-flex tw-flex-col tw-gap-5 lg:tw-sticky lg:tw-top-28">
        <Card title={t('orders.summary')}>
          <div className="tw-flex tw-flex-col tw-gap-2">
            <Row label={t('orders.subtotal')} value={money(order.subtotal)} />
            <Row label={t('orders.shipping')} value={order.shipping ? money(order.shipping) : t('orders.free')} />
            {order.discount > 0 && <Row label={t('orders.discount')} value={`-${money(order.discount)}`} />}
            <div className="tw-my-1 tw-border-t tw-border-[var(--c-hair)]" />
            <Row strong label={t('orders.total')} value={money(order.total)} />
          </div>
        </Card>

        <Card title={t('orders.deliveryAddress')}>
          <address className="tw-m-0 tw-text-sm tw-not-italic tw-leading-relaxed tw-text-ink">
            {formatAddressLines(order.shippingAddress).map((line, index) => (
              <div key={index} className={index === 0 ? 'tw-font-semibold' : undefined}>
                {line}
              </div>
            ))}
          </address>
        </Card>

        <Card title={t('orders.payment')}>
          <p className="tw-m-0 tw-text-sm tw-text-ink">{order.paymentMethod}</p>
        </Card>

        {order.trackingId && (
          <Card title={t('orders.tracking')}>
            <div className="tw-flex tw-flex-col tw-gap-2">
              <Row label={t('orders.carrier')} value={order.carrier} />
              <Row label={t('orders.trackingId')} value={order.trackingId} />
            </div>
            <div className="tw-mt-1 tw-flex tw-justify-end">
              <CopyButton value={order.trackingId} />
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

/**
 * Order detail + tracking (`/orders/:id` and `/orders/:id/track`).
 * The id is only ever sent to the server, which returns 404 for orders that
 * do not belong to the signed-in customer (no data leak between accounts).
 */
export function OrderDetailPage() {
  const { t } = useT();
  const settings = useSettings();
  const { id } = useParams();
  const { data, loading, error, reload } = useResource(
    async () => {
      const [order, returns] = await Promise.all([getOrder(id), listReturns()]);
      return { order, returns };
    },
    [id]
  );

  const notFound = error?.code === 'not_found';

  return (
    <AccountShell title={t('orders.detailTitle', { id: String(id).slice(0, 40) })} fallbackTo={ROUTES.ORDERS} desktopBackTo={ROUTES.ORDERS} wide>
      {notFound ? (
        <EmptyState
          icon="package"
          title={t('orders.notFoundTitle')}
          body={t('orders.notFoundBody')}
          actionLabel={t('orders.backToOrders')}
          actionTo={ROUTES.ORDERS}
        />
      ) : (
        <AsyncState loading={loading} error={error} onRetry={reload}>
          {data && <OrderView order={data.order} returns={data.returns} settings={settings} />}
        </AsyncState>
      )}
    </AccountShell>
  );
}

export default OrderDetailPage;
