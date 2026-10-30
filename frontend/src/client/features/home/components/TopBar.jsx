import React from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../../../components/ui/Icon';
import { useSettings } from '../../../hooks/useSettings';
import { useT } from '../../../hooks/useT';

/**
 * Top floating navigation bar overlaid inside the Hero banner.
 */
export function TopBar() {
  const settings = useSettings();
  const { t } = useT();

  return (
    <div className="tw-absolute tw-top-4 tw-left-0 tw-right-0 tw-z-20 tw-flex tw-items-center tw-justify-between tw-px-5">
      {/* Brand logo button (44px) */}
      <Link
        to="/"
        className="touch-target tw-w-11 tw-h-11 tw-rounded-full tw-bg-white/90 hover:tw-bg-white tw-shadow-sm tw-flex tw-items-center tw-justify-center tw-px-2 tw-backdrop-blur-xs tw-text-ink tw-font-semibold tw-text-xs tw-tracking-tight tw-transition-colors"
        aria-label={t('home.hero.logoAria', { storeName: settings.storeName })}
      >
        {settings.logo?.src ? (
          <img
            src={settings.logo.src}
            alt={settings.logo.alt || settings.storeName}
            className="tw-max-h-6 tw-w-auto tw-object-contain"
          />
        ) : (
          <span>{settings.storeName ? settings.storeName.split(' ')[0] : 'Logo'}</span>
        )}
      </Link>

      {/* Account button (44px) */}
      <Link
        to="/account"
        className="touch-target tw-w-11 tw-h-11 tw-rounded-full tw-bg-white/90 hover:tw-bg-white tw-shadow-sm tw-flex tw-items-center tw-justify-center tw-backdrop-blur-xs tw-text-ink tw-transition-colors"
        aria-label={t('home.hero.accountAria')}
      >
        <Icon name="user" size={20} className="tw-text-ink" />
      </Link>
    </div>
  );
}

export default React.memo(TopBar);
