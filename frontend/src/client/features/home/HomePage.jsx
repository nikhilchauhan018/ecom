import React, { useEffect, useState } from 'react';
import { HeroBanner } from './components/HeroBanner';
import { SearchLauncher } from './components/SearchLauncher';
import { CategoryCircles } from './components/CategoryCircles';
import { SeasonCollections } from './components/SeasonCollections';
import { NewArrivals } from './components/NewArrivals';
import { getHomeCriticalData, getNewArrivals } from '../../services/home';
import { useSettings } from '../../hooks/useSettings';
import { buildHomeJsonLd, safeJsonLd } from '../../utils/seo';

/**
 * Customer-facing Storefront Home page (mobile-first).
 * Single vertically scrolling page, zero layout shifts, accessible semantic landmarks.
 */
export function HomePage() {
  const settings = useSettings();
  const [criticalData, setCriticalData] = useState(null);
  const [products, setProducts] = useState(null);
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    let active = true;

    // Load critical above-the-fold content
    getHomeCriticalData().then((data) => {
      if (active) {
        setCriticalData(data);
      }
    });

    // Stream new arrivals (below the fold)
    getNewArrivals(100).then((items) => {
      if (active) {
        setProducts(items);
        setLoadingProducts(false);
      }
    });

    return () => {
      active = false;
    };
  }, []);

  const jsonLdData = buildHomeJsonLd(settings);

  return (
    <div className="tw-w-full">
      {/* JSON-LD Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLdData) }}
      />

      {/* Hero Banner (Starts at y=0, full-bleed) */}
      {criticalData?.hero && <HeroBanner hero={criticalData.hero} />}

      {/* Floating Search Launcher */}
      <SearchLauncher />

      {/* Main content sections in max-width container */}
      <div className="tw-w-full tw-max-w-md lg:tw-max-w-7xl tw-mx-auto lg:tw-px-8 tw-flex tw-flex-col tw-gap-4 lg:tw-gap-12">
        {/* Category Circles */}
        {criticalData?.categories && (
          <CategoryCircles categories={criticalData.categories} />
        )}

        {/* Season Collections */}
        {criticalData?.seasons && (
          <SeasonCollections seasons={criticalData.seasons} />
        )}

        {/* New Arrivals */}
        <NewArrivals products={products || []} isLoading={loadingProducts} />
      </div>
    </div>
  );
}

export default HomePage;
