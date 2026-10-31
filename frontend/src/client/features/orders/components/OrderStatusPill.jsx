import React from 'react';
import { Icon } from '../../../components/ui/Icon';
import { useT } from '../../../hooks/useT';
import { ORDER_STATUS_ICONS } from '../../../config/account';
import { cn } from '../../../utils/cn';

const TONES = {
  active: 'tw-bg-[var(--c-success-tint)] tw-text-[var(--c-success)]',
  delivered: 'tw-bg-[var(--c-card)] tw-text-ink',
  cancelled: 'tw-bg-[var(--c-badge-sale-bg)] tw-text-[var(--c-badge-sale-fg)]',
};

/** Colored order status label with an icon. @param {{ status: string, className?: string }} props */
export function OrderStatusPill({ status, className = '' }) {
  const { t } = useT();
  const tone = status === 'delivered' ? 'delivered' : status === 'cancelled' ? 'cancelled' : 'active';
  const icon = status === 'cancelled' ? 'x' : ORDER_STATUS_ICONS[status];

  return (
    <span
      className={cn(
        'tw-inline-flex tw-shrink-0 tw-items-center tw-gap-1.5 tw-rounded-full tw-px-3 tw-py-1.5 tw-text-xs tw-font-bold',
        TONES[tone],
        className
      )}
    >
      {icon && <Icon name={icon} size={14} />}
      {t(`orders.status.${status}`)}
    </span>
  );
}

export default React.memo(OrderStatusPill);
