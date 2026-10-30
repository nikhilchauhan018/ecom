import React from 'react';
import { Icon } from '../../../components/ui/Icon';
import { useSettings } from '../../../hooks/useSettings';
import { useT } from '../../../hooks/useT';

/**
 * Accessible search launcher form floating over the Hero bottom edge by 28px.
 * Operates natively as standard GET form for JS-disabled environments.
 */
export function SearchLauncher() {
  const settings = useSettings();
  const { t } = useT();

  const placeholder = t('search.placeholder', {
    storeName: settings.storeName || 'Your Brand',
  });

  return (
    <div className="tw-relative -tw-mt-7 tw-z-30 tw-px-5 tw-max-w-md tw-mx-auto lg:tw-max-w-2xl">
      <form
        role="search"
        method="get"
        action="/search"
        className="tw-h-14 tw-w-full tw-bg-white tw-rounded-full tw-shadow-md tw-flex tw-items-center tw-justify-between tw-pl-5 tw-pr-1.5 tw-border tw-border-[var(--c-hair)] focus-within:tw-border-[var(--brand)] tw-transition-colors"
      >
        <label htmlFor="home-search-input" className="tw-sr-only">
          {t('search.ariaLabel')}
        </label>
        <input
          id="home-search-input"
          type="search"
          name="q"
          autoComplete="off"
          placeholder={placeholder}
          className="tw-flex-1 tw-bg-transparent tw-border-0 tw-text-sm tw-text-ink placeholder:tw-text-muted focus:tw-outline-none"
        />
        <button
          type="submit"
          aria-label={t('search.buttonLabel')}
          className="touch-target tw-w-11 tw-h-11 tw-rounded-full tw-bg-[var(--brand)] tw-text-[var(--brand-contrast)] tw-border-0 tw-flex tw-items-center tw-justify-center tw-shadow-xs hover:tw-opacity-95 tw-transition-opacity"
        >
          <Icon name="search" size={18} />
        </button>
      </form>
    </div>
  );
}

export default React.memo(SearchLauncher);
