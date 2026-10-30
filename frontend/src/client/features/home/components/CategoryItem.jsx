import React from 'react';
import { Link } from 'react-router-dom';
import { Image } from '../../../components/ui/Image';

/**
 * Individual category circle item with subtle ring and centered label.
 * @param {{ category: import('../../../types/home').Category }} props
 */
export function CategoryItem({ category }) {
  const { name, slug, image } = category;

  return (
    <Link
      to={`/categories/${slug}`}
      className="tw-group tw-flex tw-flex-col tw-items-center tw-justify-start tw-text-center tw-p-1 focus:tw-outline-none"
      aria-label={`Shop ${name} collection`}
    >
      <div className="tw-w-[72px] tw-h-[72px] tw-rounded-full tw-overflow-hidden tw-p-0.5 tw-bg-white tw-shadow-xs tw-border tw-border-[var(--c-hair)] tw-transition-transform tw-duration-200 group-hover:tw-scale-105">
        <div className="tw-w-full tw-h-full tw-rounded-full tw-overflow-hidden">
          <Image
            src={image?.src}
            alt={image?.alt || name}
            color={image?.color || '#f1f5f9'}
            placeholderText="Photo"
            className="tw-w-full tw-h-full tw-object-cover"
          />
        </div>
      </div>
      <span className="tw-mt-2 tw-text-xs tw-font-medium tw-text-ink tw-leading-tight tw-truncate tw-w-full group-hover:tw-text-[var(--brand)]">
        {name}
      </span>
    </Link>
  );
}

export default React.memo(CategoryItem);
