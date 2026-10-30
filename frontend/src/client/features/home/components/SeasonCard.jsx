import React from 'react';
import { Link } from 'react-router-dom';
import { Image } from '../../../components/ui/Image';

/**
 * Arch-shaped season card (top fully rounded, bottom 16px radius, aspect-ratio 1:1.2).
 * @param {{ season: import('../../../types/home').Season }} props
 */
export function SeasonCard({ season }) {
  const { name, description, slug, image } = season;

  return (
    <article className="tw-group tw-flex tw-flex-col">
      <Link
        to={`/seasons/${slug}`}
        className="tw-block focus:tw-outline-none"
        aria-label={`Explore ${name} season collection: ${description}`}
      >
        <div className="card-arch tw-w-full tw-shadow-xs tw-transition-transform tw-duration-300 group-hover:tw-scale-[1.02]">
          <Image
            src={image?.src}
            alt={image?.alt || name}
            color={image?.color || '#fae8cd'}
            placeholderText="Photo"
            className="tw-w-full tw-h-full tw-object-cover"
          />
        </div>
      </Link>
      <div className="tw-mt-2.5 tw-flex tw-flex-col tw-px-1">
        <Link
          to={`/seasons/${slug}`}
          className="tw-font-semibold tw-text-sm tw-text-ink hover:tw-text-[var(--brand)] tw-leading-tight"
        >
          {name}
        </Link>
        <p className="tw-text-xs tw-text-muted tw-leading-normal tw-truncate tw-mt-0.5">
          {description}
        </p>
      </div>
    </article>
  );
}

export default React.memo(SeasonCard);
