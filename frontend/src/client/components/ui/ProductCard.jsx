import React from 'react';
import { Link } from 'react-router-dom';
import { Image } from './Image';
import { Price } from './Price';
import { Badge } from './Badge';
import { Icon } from './Icon';
import { useWishlist } from '../../hooks/useWishlist';
import { useT } from '../../hooks/useT';

/**
 * Memoized Product Card with 4:5 image ratio, wishlist button, and badge.
 * @param {{ product: import('../../types/home').Product }} props
 */
export function ProductCard({ product }) {
  const { id, name, slug, price, compareAtPrice, badge, image } = product;
  const { inWishlist, toggleWishlist } = useWishlist(id);
  const { t } = useT();

  const handleWishlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist();
  };

  const badgeVariant = badge === 'Sale' ? 'sale' : badge === 'Low stock' ? 'lowStock' : 'default';

  return (
    <article className="tw-group tw-flex tw-flex-col tw-relative">
      <div className="tw-relative tw-w-full tw-rounded-2xl tw-overflow-hidden tw-bg-[var(--c-card)] tw-aspect-[4/5]">
        <Link
          to={`/product/${slug}`}
          className="tw-block tw-w-full tw-h-full"
          aria-label={t('product.viewProduct', { name })}
        >
          <Image
            src={image?.src}
            alt={image?.alt || name}
            color={image?.color || '#e2e8f0'}
            placeholderText="Product photo"
            className="tw-transition-transform tw-duration-300 group-hover:tw-scale-105"
          />
        </Link>

        {badge && (
          <div className="tw-absolute tw-top-2.5 tw-left-2.5 tw-z-10">
            <Badge variant={badgeVariant}>{badge}</Badge>
          </div>
        )}

        <button
          type="button"
          onClick={handleWishlistClick}
          aria-pressed={inWishlist}
          aria-label={
            inWishlist
              ? t('product.removeFromWishlist', { name })
              : t('product.addToWishlist', { name })
          }
          className="touch-target tw-absolute tw-top-1.5 tw-right-1.5 tw-z-10 tw-p-2 tw-rounded-full tw-bg-white/70 hover:tw-bg-white tw-backdrop-blur-xs tw-border-0 tw-text-ink tw-transition-colors"
        >
          <Icon
            name="heart"
            size={18}
            filled={inWishlist}
            className={inWishlist ? 'tw-text-[#d92d20]' : 'tw-text-ink'}
          />
        </button>
      </div>

      <div className="tw-mt-2.5 tw-flex tw-flex-col tw-gap-1">
        <Link
          to={`/product/${slug}`}
          className="tw-font-medium tw-text-sm tw-text-ink tw-truncate hover:tw-underline"
        >
          {name}
        </Link>
        <Price price={price} compareAtPrice={compareAtPrice} />
      </div>
    </article>
  );
}

export default React.memo(ProductCard);
