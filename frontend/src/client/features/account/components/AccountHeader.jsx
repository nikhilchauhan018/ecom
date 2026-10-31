import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Icon } from '../../../components/ui/Icon';
import { useT } from '../../../hooks/useT';
import { ROUTES } from '../../../config/constants';

/**
 * Page header with a back button and title.
 * Goes back in history when possible, otherwise to `fallbackTo` (e.g. after a deep link).
 * On desktop the back button is hidden (the site header handles navigation), the title becomes
 * a large page heading, and sub-pages can show a breadcrumb-style link via `desktopBackTo`.
 * @param {{ title?: string, fallbackTo?: string, desktopBackTo?: string, desktopBackLabel?: string }} props
 */
export function AccountHeader({ title, fallbackTo = ROUTES.HOME, desktopBackTo, desktopBackLabel }) {
  const navigate = useNavigate();
  const { t } = useT();

  const handleBack = () => {
    if (window.history.state?.idx > 0) {
      navigate(-1);
    } else {
      navigate(fallbackTo);
    }
  };

  return (
    <header className="tw-flex tw-items-center tw-gap-2 tw-px-2 tw-h-14 tw-border-b tw-border-[var(--c-hair)] lg:tw-h-auto lg:tw-px-0 lg:tw-pt-10 lg:tw-border-b-0">
      <button
        type="button"
        onClick={handleBack}
        className="touch-target tw-rounded-full tw-text-ink hover:tw-bg-[var(--c-card)] tw-transition-colors lg:tw-hidden"
        aria-label={t('account.back')}
      >
        <Icon name="chevron-left" size={22} />
      </button>
      <div className="tw-min-w-0">
        {desktopBackTo && (
          <Link
            to={desktopBackTo}
            className="tw-mb-2 tw-hidden tw-items-center tw-gap-1 tw-text-sm tw-text-[var(--c-muted)] hover:tw-text-ink lg:tw-inline-flex"
          >
            <Icon name="chevron-left" size={16} />
            {desktopBackLabel}
          </Link>
        )}
        <h1 className="tw-m-0 tw-text-lg tw-font-semibold tw-text-ink lg:tw-text-3xl lg:tw-font-bold lg:tw-tracking-tight">
          {title ?? t('account.title')}
        </h1>
      </div>
    </header>
  );
}

export default React.memo(AccountHeader);
