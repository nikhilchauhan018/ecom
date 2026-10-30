import React from 'react';
import { formatMoney } from '../../utils/formatMoney';
import { useSettings } from '../../hooks/useSettings';
import { cn } from '../../utils/cn';

/**
 * Renders product prices according to white-label locale and currency settings.
 * @param {{ price: number, compareAtPrice?: number|null, className?: string }} props
 */
export function Price({ price, compareAtPrice, className = '' }) {
  const settings = useSettings();
  const formattedPrice = formatMoney(price, settings);
  const formattedCompare = compareAtPrice ? formatMoney(compareAtPrice, settings) : null;

  return (
    <div className={cn('tw-flex tw-items-baseline tw-gap-1.5', className)}>
      <span className="tw-font-semibold tw-text-sm tw-text-ink">
        {formattedPrice}
      </span>
      {formattedCompare && (
        <span className="tw-text-xs tw-text-muted tw-line-through">
          {formattedCompare}
        </span>
      )}
    </div>
  );
}

export default React.memo(Price);
