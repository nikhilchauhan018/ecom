import React from 'react';
import { useT } from '../../hooks/useT';

/**
 * Accessible skip-to-content link targeting #main-content.
 */
export function SkipLink() {
  const { t } = useT();

  return (
    <a
      href="#main-content"
      className="tw-sr-only focus:tw-not-sr-only focus:tw-fixed focus:tw-top-4 focus:tw-left-4 focus:tw-z-50 focus:tw-bg-[var(--brand)] focus:tw-text-[var(--brand-contrast)] focus:tw-px-4 focus:tw-py-2 focus:tw-rounded-md focus:tw-shadow-lg"
    >
      {t('nav.skipToContent')}
    </a>
  );
}

export default React.memo(SkipLink);
