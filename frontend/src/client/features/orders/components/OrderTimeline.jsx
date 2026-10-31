import React from 'react';
import { Icon } from '../../../components/ui/Icon';
import { useT } from '../../../hooks/useT';
import { cn } from '../../../utils/cn';
import { buildTimeline } from '../../../utils/orders';
import { formatDateTime } from '../../../utils/format';

/**
 * Vertical tracking timeline. Done steps are filled, the current step is ringed,
 * upcoming steps are muted. Exposed as an ordered list for screen readers.
 * @param {{ order: object, locale?: string }} props
 */
export function OrderTimeline({ order, locale }) {
  const { t } = useT();
  const steps = buildTimeline(order);

  return (
    <ol className="tw-m-0 tw-list-none tw-p-0">
      {steps.map((step, index) => {
        const last = index === steps.length - 1;
        const cancelled = step.status === 'cancelled';
        const reached = step.state !== 'upcoming';

        return (
          <li key={step.status} className="tw-relative tw-flex tw-gap-3 tw-pb-5 last:tw-pb-0" aria-current={step.state === 'current' ? 'step' : undefined}>
            {!last && (
              <span
                aria-hidden="true"
                className={cn(
                  'tw-absolute tw-left-[13px] tw-top-7 tw-bottom-0 tw-w-0.5',
                  step.state === 'done' ? 'tw-bg-[var(--c-success)]' : 'tw-bg-[var(--c-line)]'
                )}
              />
            )}
            <span
              aria-hidden="true"
              className={cn(
                'tw-relative tw-z-[1] tw-flex tw-h-7 tw-w-7 tw-shrink-0 tw-items-center tw-justify-center tw-rounded-full',
                cancelled && 'tw-bg-[var(--c-danger)] tw-text-white',
                !cancelled && step.state === 'done' && 'tw-bg-[var(--c-success)] tw-text-white',
                !cancelled && step.state === 'current' && 'tw-bg-[var(--c-success-tint)] tw-text-[var(--c-success)] tw-ring-2 tw-ring-[var(--c-success)]',
                step.state === 'upcoming' && 'tw-bg-[var(--c-field)] tw-text-[var(--c-soft)]'
              )}
            >
              <Icon name={cancelled ? 'x' : step.state === 'done' ? 'check' : 'package'} size={14} />
            </span>
            <div className="tw-pt-0.5">
              <p className={cn('tw-m-0 tw-text-[15px]', reached ? 'tw-font-semibold tw-text-ink' : 'tw-text-[var(--c-muted)]')}>
                {t(`orders.status.${step.status}`)}
              </p>
              {step.at && <p className="tw-m-0 tw-text-xs tw-text-[var(--c-muted)]">{formatDateTime(step.at, locale)}</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export default React.memo(OrderTimeline);
