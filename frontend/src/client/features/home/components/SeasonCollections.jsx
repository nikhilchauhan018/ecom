import React from 'react';
import { SectionHeader } from './SectionHeader';
import { SeasonCard } from './SeasonCard';
import { useT } from '../../../hooks/useT';

/**
 * Staggered 2-column layout of arch-shaped seasonal collection cards on mobile,
 * and 4-column inline grid on tablet+.
 * @param {{ seasons: import('../../../types/home').Season[] }} props
 */
export function SeasonCollections({ seasons }) {
  const { t } = useT();

  if (!seasons || seasons.length === 0) return null;

  const leftCol = [seasons[0], seasons[2]].filter(Boolean);
  const rightCol = [seasons[1], seasons[3]].filter(Boolean);

  return (
    <section aria-labelledby="section-seasons" className="tw-mt-10 lg:tw-mt-14 tw-px-5 lg:tw-px-0">
      <SectionHeader
        id="section-seasons"
        title={t('home.sections.seasons.title')}
        seeAllLabel={t('home.sections.seasons.seeAll')}
        seeAllTo="/seasons"
      />

      {/* Mobile staggered two-column layout */}
      <div className="tw-grid tw-grid-cols-2 tw-gap-3 sm:tw-hidden">
        {/* Left column: items 1 and 3 */}
        <div className="tw-flex tw-flex-col tw-gap-5">
          {leftCol.map((season) => (
            <SeasonCard key={season.id} season={season} />
          ))}
        </div>

        {/* Right column: items 2 and 4 (offset 24px lower) */}
        <div className="tw-flex tw-flex-col tw-gap-5 stagger-col-2">
          {rightCol.map((season) => (
            <SeasonCard key={season.id} season={season} />
          ))}
        </div>
      </div>

      {/* Tablet & Desktop 4-in-a-row layout */}
      <div className="tw-hidden sm:tw-grid sm:tw-grid-cols-4 sm:tw-gap-4 lg:tw-gap-6">
        {seasons.slice(0, 4).map((season) => (
          <SeasonCard key={season.id} season={season} />
        ))}
      </div>
    </section>
  );
}

export default React.memo(SeasonCollections);
