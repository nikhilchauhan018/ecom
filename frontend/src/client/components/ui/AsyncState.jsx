import React from 'react';
import { Button } from './Button';
import { Notice } from './Notice';
import { useT } from '../../hooks/useT';
import { getErrorMessage } from '../../utils/errors';

export function SkeletonBlocks({ heights = [96, 96, 96] }) {
  return (
    <div className="tw-flex tw-flex-col tw-gap-4 tw-animate-pulse" aria-hidden="true">
      {heights.map((height, index) => (
        <div key={index} className="tw-rounded-2xl tw-bg-[var(--c-field)]" style={{ height }} />
      ))}
    </div>
  );
}

/**
 * Renders a skeleton while loading, an error notice with retry on failure, otherwise children.
 * Announces loading politely for screen readers.
 * @param {{ loading: boolean, error?: any, onRetry?: () => void, skeleton?: React.ReactNode, children: React.ReactNode }} props
 */
export function AsyncState({ loading, error, onRetry, skeleton, children }) {
  const { t } = useT();

  if (loading) {
    return (
      <div role="status" aria-live="polite" aria-busy="true">
        <span className="tw-sr-only">{t('common.loading')}</span>
        {skeleton ?? <SkeletonBlocks />}
      </div>
    );
  }

  if (error) {
    return (
      <div className="tw-flex tw-flex-col tw-items-start tw-gap-3">
        <Notice tone="error">{getErrorMessage(t, error)}</Notice>
        {onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry}>
            {t('common.tryAgain')}
          </Button>
        )}
      </div>
    );
  }

  return children;
}

export default AsyncState;
