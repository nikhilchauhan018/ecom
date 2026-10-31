import React from 'react';
import { AccountHeader } from './AccountHeader';
import { useT } from '../../../hooks/useT';
import { ROUTES } from '../../../config/constants';
import { cn } from '../../../utils/cn';

/**
 * Shared frame for account sub-pages: header with back navigation + a padded, centered body.
 * @param {{ title: string, children: React.ReactNode, fallbackTo?: string, wide?: boolean, desktopBackTo?: string | null }} props
 */
export function AccountShell({ title, children, fallbackTo = ROUTES.ACCOUNT, wide = false, desktopBackTo = ROUTES.ACCOUNT }) {
  const { t } = useT();

  return (
    <div
      className={cn(
        'tw-w-full tw-max-w-md md:tw-max-w-2xl tw-mx-auto lg:tw-px-8',
        wide ? 'lg:tw-max-w-5xl' : 'lg:tw-max-w-3xl'
      )}
    >
      <AccountHeader
        title={title}
        fallbackTo={fallbackTo}
        desktopBackTo={desktopBackTo || undefined}
        desktopBackLabel={t('account.desktopBack')}
      />
      <div className="tw-flex tw-flex-col tw-gap-5 tw-px-4 tw-pt-4 tw-pb-10 lg:tw-px-0 lg:tw-pt-6 lg:tw-pb-16">
        {children}
      </div>
    </div>
  );
}

export default AccountShell;
