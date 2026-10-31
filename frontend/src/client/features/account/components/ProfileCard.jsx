import React from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../../../components/ui/Icon';
import { useT } from '../../../hooks/useT';
import { ROUTES } from '../../../config/constants';
import { getInitials } from '../../../utils/account';

/**
 * Customer identity card: avatar initials, name, masked phone and verification state.
 * @param {{ profile: { name: string, phoneMasked: string, phoneVerified: boolean } }} props
 */
export function ProfileCard({ profile }) {
  const { t } = useT();

  return (
    <section
      aria-label={profile.name || t('account.unnamed')}
      className="tw-flex tw-items-center tw-gap-4 tw-rounded-2xl tw-border tw-border-[var(--c-line)] tw-p-4 lg:tw-p-6 lg:tw-gap-5"
    >
      <div
        aria-hidden="true"
        className="tw-w-14 tw-h-14 lg:tw-w-16 lg:tw-h-16 tw-shrink-0 tw-rounded-full tw-bg-[var(--c-avatar-bg)] tw-flex tw-items-center tw-justify-center tw-text-sm tw-font-semibold tw-text-ink"
      >
        {getInitials(profile.name) || <Icon name="user" size={22} />}
      </div>

      <div className="tw-min-w-0 tw-flex-1">
        <p className="tw-m-0 tw-text-lg tw-font-semibold tw-text-ink tw-leading-tight tw-truncate">
          {profile.name || t('account.unnamed')}
        </p>
        <p className="tw-m-0 tw-text-[15px] tw-text-[var(--c-muted)] tw-truncate">{profile.phoneMasked}</p>
        {profile.phoneVerified && (
          <p className="tw-m-0 tw-mt-0.5 tw-flex tw-items-center tw-gap-1 tw-text-xs tw-font-semibold tw-text-[var(--c-success)]">
            <Icon name="check" size={12} />
            {t('account.mobileVerified')}
          </p>
        )}
      </div>

      <Link
        to={ROUTES.ACCOUNT_PROFILE}
        className="touch-target tw-px-1 tw-text-[15px] tw-font-semibold tw-text-[var(--c-success)]"
        aria-label={t('account.editProfileAria')}
      >
        {t('account.edit')}
      </Link>
    </section>
  );
}

export default React.memo(ProfileCard);
