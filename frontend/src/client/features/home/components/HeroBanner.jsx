import React from 'react';
import { Link } from 'react-router-dom';
import { Image } from '../../../components/ui/Image';
import { TopBar } from './TopBar';

/**
 * Full-bleed Hero banner starting at y=0 with clamped height and LCP image.
 * @param {{ hero: import('../../../types/home').HeroSection }} props
 */
export function HeroBanner({ hero }) {
  if (!hero) return null;

  return (
    <header className="tw-relative tw-w-full hero-container tw-overflow-hidden tw-bg-[#cbd5cf]">
      {/* Top Floating Controls for Mobile */}
      <div className="lg:tw-hidden">
        <TopBar />
      </div>

      {/* LCP Hero Image background */}
      <div className="tw-absolute tw-inset-0 tw-w-full tw-h-full">
        <Image
          src={hero.image?.src}
          alt={hero.image?.alt || hero.title}
          width={hero.image?.width || 780}
          height={hero.image?.height || 800}
          color={hero.image?.color || '#cbd5cf'}
          placeholderText="Hero photo (New arrivals)"
          isPriority
          className="tw-w-full tw-h-full tw-object-cover"
        />
        {/* Subtle gradient to ensure bottom text contrast */}
        <div className="tw-absolute tw-inset-0 tw-bg-gradient-to-t tw-from-black/40 tw-via-transparent tw-to-black/10" />
      </div>

      {/* Bottom-left Content */}
      <div className="tw-absolute tw-bottom-12 lg:tw-bottom-16 tw-left-0 tw-right-0 tw-px-5 lg:tw-px-8 tw-z-10 tw-max-w-md tw-mx-auto lg:tw-max-w-7xl">
        <div className="tw-flex tw-flex-col tw-items-start tw-gap-2.5 lg:tw-gap-3.5">
          {hero.eyebrow && (
            <span className="tw-inline-flex tw-items-center tw-px-3 tw-py-1 tw-rounded-full tw-bg-white/90 tw-text-ink tw-text-xs lg:tw-text-sm tw-font-medium tw-shadow-xs">
              {hero.eyebrow}
            </span>
          )}

          <h1 className="tw-text-2xl sm:tw-text-3xl lg:tw-text-5xl tw-font-semibold tw-text-white tw-leading-tight lg:tw-leading-tight tw-whitespace-pre-line tw-drop-shadow-xs">
            {hero.title}
          </h1>

          {hero.ctaLabel && (
            <Link
              to={hero.ctaUrl || '/shop'}
              className="touch-target tw-mt-1 tw-px-6 tw-py-2.5 tw-rounded-full tw-bg-[var(--brand)] tw-text-[var(--brand-contrast)] tw-font-medium tw-text-sm tw-shadow-sm hover:tw-opacity-90 tw-transition-opacity"
            >
              {hero.ctaLabel}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

export default React.memo(HeroBanner);
