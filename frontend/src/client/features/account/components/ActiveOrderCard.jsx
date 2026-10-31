import React from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../../../components/ui/Icon';
import { useT } from '../../../hooks/useT';
import { ORDER_STATUS_ICONS } from '../../../config/account';
import { useSettings } from '../../../hooks/useSettings';
import { orderTrackRoute } from '../../../config/constants';
import { formatMoney } from '../../../utils/formatMoney';
import { ORDER_STEPS, formatArrivalDate, getOrderProgress } from '../../../utils/account';
import { countItems } from '../../../utils/orders';

/**
 * Summary of the customer's in-flight order with a 4-step progress bar.
 * @param {{ order: { id: string, items: Array<{ qty: number }>, total: number, status: string, eta: string | null } }} props
 */
export function ActiveOrderCard({ order }) {
  const { t } = useT();
  const settings = useSettings();
  const { percent, stepsDone } = getOrderProgress(order.status);

  const itemCount = countItems(order);
  const items = t(itemCount === 1 ? 'account.order.itemOne' : 'account.order.itemMany', {
    count: itemCount,
  });
  const statusLabel = t(`account.order.status.${order.status}`);
  const arrival = formatArrivalDate(order.eta, settings.locale);

  return (
    <section
      aria-label={t('account.order.title', { id: order.id })}
      className="tw-rounded-2xl tw-border tw-border-[var(--c-line)] tw-p-4 lg:tw-p-6"
    >
      <div className="tw-flex tw-items-start tw-justify-between tw-gap-3">
        <div className="tw-min-w-0">
          <h2 className="tw-m-0 tw-text-base tw-font-bold tw-text-ink">
            {t('account.order.title', { id: order.id })}
          </h2>
          <p className="tw-m-0 tw-text-sm tw-text-[var(--c-muted)]">
            {items} · {formatMoney(order.total, settings)}
          </p>
        </div>
        <span className="tw-inline-flex tw-shrink-0 tw-items-center tw-gap-1.5 tw-rounded-full tw-bg-[var(--c-success-tint)] tw-px-3 tw-py-1.5 tw-text-xs tw-font-bold tw-text-[var(--c-success)]">
          {ORDER_STATUS_ICONS[order.status] && <Icon name={ORDER_STATUS_ICONS[order.status]} size={14} />}
          {statusLabel}
        </span>
      </div>

      <div
        role="progressbar"
        aria-label={t('account.order.progressAria', { status: statusLabel })}
        aria-valuemin={0}
        aria-valuemax={ORDER_STEPS.length}
        aria-valuenow={stepsDone}
        aria-valuetext={statusLabel}
        className="tw-mt-5 tw-h-1.5 tw-w-full tw-overflow-hidden tw-rounded-full tw-bg-[var(--c-line)]"
      >
        <div
          className="tw-h-full tw-rounded-full tw-bg-[var(--c-success)]"
          style={{ width: `${percent}%` }}
        />
      </div>

      <ol className="tw-list-none tw-m-0 tw-mt-2 tw-p-0 tw-flex tw-justify-between tw-text-xs tw-text-[var(--c-muted)]">
        {ORDER_STEPS.map((step) => (
          <li key={step}>{t(`account.order.steps.${step}`)}</li>
        ))}
      </ol>

      <div className="tw-mt-5 tw-flex tw-items-center tw-justify-between tw-gap-3">
        <p className="tw-m-0 tw-text-[13px] tw-text-[var(--c-muted)]">
          {arrival ? t('account.order.arriving', { date: arrival }) : ''}
        </p>
        <Link
          to={orderTrackRoute(order.id)}
          className="tw-text-[15px] tw-font-semibold tw-text-[var(--c-success)]"
        >
          <span className="tw-inline-flex tw-items-center tw-gap-1">
            {t('account.order.track')}
            <Icon name="arrow-right" size={16} />
          </span>
        </Link>
      </div>
    </section>
  );
}

export default React.memo(ActiveOrderCard);
