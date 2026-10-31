import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AccountHeader } from './components/AccountHeader';
import { ProfileCard } from './components/ProfileCard';
import { QuickActions } from './components/QuickActions';
import { ActiveOrderCard } from './components/ActiveOrderCard';
import { MenuSection } from './components/MenuSection';
import { AsyncState, SkeletonBlocks } from '../../components/ui/AsyncState';
import { Button } from '../../components/ui/Button';
import { Dialog } from '../../components/ui/Dialog';
import { Icon } from '../../components/ui/Icon';
import { ACCOUNT_SECTIONS } from '../../config/account';
import { ROUTES } from '../../config/constants';
import { getAccountOverview } from '../../services/account';
import { authStore } from '../../stores/authStore';
import { useResource } from '../../hooks/useResource';
import { useSettings } from '../../hooks/useSettings';
import { useT } from '../../hooks/useT';
import { buildWhatsAppUrl } from '../../utils/account';

/**
 * Customer Account hub (signed-in only, guarded by RequireAuth): profile, quick actions,
 * active order, account + help menus, and session actions.
 */
export function AccountPage() {
  const { t } = useT();
  const settings = useSettings();
  const { data: overview, loading, error, reload } = useResource(getAccountOverview, []);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const handleLogout = async () => {
    setSigningOut(true);
    await authStore.signOut('logout');
  };

  const whatsappUrl = buildWhatsAppUrl(settings.supportPhone);
  const sections = ACCOUNT_SECTIONS.map((section) => ({
    ...section,
    items: section.items.map((item) => (item.external === 'whatsapp' ? { ...item, href: whatsappUrl } : item)),
  }));

  return (
    <div className="tw-w-full tw-max-w-md md:tw-max-w-2xl lg:tw-max-w-6xl tw-mx-auto lg:tw-px-8">
      <AccountHeader />

      {/* Mobile/tablet: single column. Desktop: overview (left) + sticky menu sidebar (right). */}
      <div className="tw-flex tw-flex-col tw-gap-4 tw-px-4 tw-pt-4 tw-pb-8 lg:tw-grid lg:tw-grid-cols-[minmax(0,1fr)_360px] lg:tw-gap-8 lg:tw-items-start lg:tw-px-0 lg:tw-pt-6 lg:tw-pb-16">
        <div className="tw-flex tw-flex-col tw-gap-4 lg:tw-gap-6">
          <AsyncState loading={loading} error={error} onRetry={reload} skeleton={<SkeletonBlocks heights={[96, 84, 170]} />}>
            {overview && (
              <>
                <ProfileCard profile={overview.profile} />
                <QuickActions />
                {overview.activeOrder && <ActiveOrderCard order={overview.activeOrder} />}
              </>
            )}
          </AsyncState>
        </div>

        <div className="tw-flex tw-flex-col tw-gap-4 lg:tw-gap-6 lg:tw-sticky lg:tw-top-28">
          {sections.map((section) => (
            <MenuSection
              key={section.id}
              titleId={`account-section-${section.id}`}
              title={t(section.titleKey)}
              items={section.items}
            />
          ))}

          <button
            type="button"
            onClick={() => setConfirmLogout(true)}
            className="tw-mt-2 tw-h-12 tw-w-full tw-rounded-2xl tw-border tw-border-[var(--c-line)] tw-bg-transparent tw-inline-flex tw-items-center tw-justify-center tw-gap-2 tw-text-base tw-font-semibold tw-text-[var(--c-danger)] hover:tw-bg-[var(--c-card)] tw-transition-colors"
          >
            <Icon name="log-out" size={18} />
            {t('account.logout')}
          </button>

          <Link
            to={ROUTES.ACCOUNT_DELETE}
            className="touch-target tw-self-center tw-gap-1.5 tw-text-[13px] tw-text-[var(--c-muted)] hover:tw-text-[var(--c-danger)] tw-transition-colors"
          >
            <Icon name="trash" size={14} />
            <span className="tw-underline">{t('account.deleteAccount')}</span>
          </Link>
        </div>
      </div>

      {confirmLogout && (
        <Dialog
          open
          onClose={() => !signingOut && setConfirmLogout(false)}
          dismissible={!signingOut}
          title={t('account.logout')}
          closeLabel={t('common.close')}
        >
          <p className="tw-m-0 tw-mb-5 tw-text-sm tw-text-[var(--c-muted)]">{t('account.logoutConfirm')}</p>
          <div className="tw-flex tw-flex-col tw-gap-2 sm:tw-flex-row-reverse">
            <Button variant="danger" fullWidth loading={signingOut} onClick={handleLogout}>
              {t('account.logout')}
            </Button>
            <Button variant="outline" fullWidth disabled={signingOut} onClick={() => setConfirmLogout(false)}>
              {t('common.cancel')}
            </Button>
          </div>
        </Dialog>
      )}
    </div>
  );
}

export default AccountPage;
