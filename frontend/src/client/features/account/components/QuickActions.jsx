import React from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../../../components/ui/Icon';
import { useT } from '../../../hooks/useT';
import { QUICK_ACTIONS } from '../../../config/account';

/** Four-up grid of shortcuts: Orders, Track, Returns, Wishlist. */
export function QuickActions() {
  const { t } = useT();

  return (
    <nav aria-label={t('account.quickActionsAria')} className="tw-grid tw-grid-cols-4 tw-gap-2 lg:tw-gap-4">
      {QUICK_ACTIONS.map((action) => (
        <Link
          key={action.id}
          to={action.to}
          className="tw-flex tw-flex-col tw-items-center tw-justify-center tw-gap-2.5 tw-h-[84px] lg:tw-h-24 lg:tw-gap-3 tw-rounded-2xl tw-border tw-border-[var(--c-line)] tw-text-[13px] lg:tw-text-sm tw-text-ink hover:tw-bg-[var(--c-card)] tw-transition-colors"
        >
          <Icon name={action.icon} size={20} className="tw-text-[var(--c-success)]" />
          <span className="tw-leading-none">{t(action.labelKey)}</span>
        </Link>
      ))}
    </nav>
  );
}

export default React.memo(QuickActions);
