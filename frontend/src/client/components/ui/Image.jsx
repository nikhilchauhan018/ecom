import React from 'react';
import { getImageUrl, buildSrcSet } from '../../utils/image';
import { cn } from '../../utils/cn';

/**
 * Responsive Image component with tinted placeholder support and zero layout shift.
 * @param {{
 *   src?: string|null,
 *   alt: string,
 *   width?: number|string,
 *   height?: number|string,
 *   color?: string,
 *   isPriority?: boolean,
 *   className?: string,
 *   sizes?: string,
 *   placeholderText?: string
 * }} props
 */
export function Image({
  src,
  alt,
  width,
  height,
  color = '#e2e8f0',
  isPriority = false,
  className = '',
  sizes = '100vw',
  placeholderText,
}) {
  if (!src) {
    return (
      <div
        className={cn(
          'tw-flex tw-items-center tw-justify-center tw-relative tw-overflow-hidden',
          className
        )}
        style={{
          backgroundColor: color,
          width: width ? (typeof width === 'number' ? `${width}px` : width) : '100%',
          height: height ? (typeof height === 'number' ? `${height}px` : height) : '100%',
        }}
        role="img"
        aria-label={alt}
      >
        {placeholderText && (
          <span className="tw-text-xs tw-font-medium tw-text-muted tw-opacity-80 tw-select-none tw-px-2 tw-text-center">
            {placeholderText}
          </span>
        )}
      </div>
    );
  }

  const optimizedSrc = getImageUrl(src);
  const srcSet = buildSrcSet(src);

  return (
    <img
      src={optimizedSrc || undefined}
      srcSet={srcSet || undefined}
      sizes={sizes}
      alt={alt}
      width={width}
      height={height}
      loading={isPriority ? 'eager' : 'lazy'}
      decoding="async"
      fetchPriority={isPriority ? 'high' : 'auto'}
      className={cn('tw-object-cover tw-w-full tw-h-full', className)}
      style={{ backgroundColor: color }}
    />
  );
}

export default React.memo(Image);
