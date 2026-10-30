import React from 'react';
import { SectionHeader } from './SectionHeader';
import { ProductCard } from '../../../components/ui/ProductCard';
import { NewArrivalsSkeleton } from './NewArrivalsSkeleton';
import { useT } from '../../../hooks/useT';

/**
 * 2-column (mobile) and 4-column (tablet+) product grid for newly arrived inventory.
 * @param {{ products: import('../../../types/home').Product[], isLoading?: boolean }} props
 */
export function NewArrivals({ products, isLoading = false }) {
  const { t } = useT();

  return (
    <section aria-labelledby="section-new-arrivals" className="tw-mt-10 lg:tw-mt-14 tw-px-5 lg:tw-px-0">
      <SectionHeader
        id="section-new-arrivals"
        title={t('home.sections.newArrivals.title')}
        seeAllLabel={t('home.sections.newArrivals.seeAll')}
        seeAllTo="/shop"
      />

      {isLoading ? (
        <NewArrivalsSkeleton count={4} />
      ) : (
        <div className="tw-grid tw-grid-cols-2 md:tw-grid-cols-4 tw-gap-3.5 sm:tw-gap-4 lg:tw-gap-6">
          {products && products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}

export default React.memo(NewArrivals);
