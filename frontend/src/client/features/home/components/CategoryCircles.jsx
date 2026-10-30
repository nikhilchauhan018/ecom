import React from 'react';
import { SectionHeader } from './SectionHeader';
import { CategoryItem } from './CategoryItem';
import { useT } from '../../../hooks/useT';

/**
 * 4-column grid of circular categories (8 in one row on tablet+).
 * @param {{ categories: import('../../../types/home').Category[] }} props
 */
export function CategoryCircles({ categories }) {
  const { t } = useT();

  if (!categories || categories.length === 0) return null;

  return (
    <section aria-labelledby="section-categories" className="tw-mt-8 lg:tw-mt-12 tw-px-5 lg:tw-px-0">
      <SectionHeader
        id="section-categories"
        title={t('home.sections.categories.title')}
        seeAllLabel={t('home.sections.categories.seeAll')}
        seeAllTo="/categories"
      />
      <div className="tw-grid tw-grid-cols-4 md:tw-grid-cols-8 tw-gap-x-2 sm:tw-gap-x-4 lg:tw-gap-x-6 tw-gap-y-4">
        {categories.map((category) => (
          <CategoryItem key={category.id} category={category} />
        ))}
      </div>
    </section>
  );
}

export default React.memo(CategoryCircles);
