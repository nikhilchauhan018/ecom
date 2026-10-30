import React from 'react';
import { Link } from 'react-router-dom';
import { useSettings } from '../../hooks/useSettings';
import { useT } from '../../hooks/useT';

/**
 * Responsive Desktop Footer (rendered on lg: breakpoints and above).
 */
export function DesktopFooter() {
  const settings = useSettings();
  const { t } = useT();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="tw-hidden lg:tw-block tw-bg-[var(--c-card)] tw-border-t tw-border-[var(--c-hair)] tw-mt-24 tw-text-ink">
      <div className="tw-max-w-7xl tw-mx-auto tw-px-8 tw-pt-16 tw-pb-12">
        <div className="tw-grid tw-grid-cols-4 tw-gap-12">
          {/* Column 1: Brand & Philosophy */}
          <div className="tw-flex tw-flex-col tw-gap-4">
            <div className="tw-flex tw-items-center tw-gap-2.5">
              <div className="tw-w-8 tw-h-8 tw-rounded-full tw-bg-[var(--brand)] tw-text-[var(--brand-contrast)] tw-flex tw-items-center tw-justify-center tw-font-bold tw-text-xs">
                {settings.storeName ? settings.storeName.charAt(0) : 'A'}
              </div>
              <span className="tw-font-bold tw-text-base tw-tracking-tight">
                {settings.storeName}
              </span>
            </div>
            <p className="tw-text-xs tw-text-muted tw-leading-relaxed">
              {t('footer.aboutDescription', { storeName: settings.storeName })}
            </p>
            <div className="tw-mt-2 tw-flex tw-flex-col tw-gap-2 tw-text-xs tw-text-muted">
              <span className="tw-flex tw-items-center tw-gap-2">
                <span className="tw-text-[var(--brand)]">✓</span> {t('footer.freeShipping')}
              </span>
              <span className="tw-flex tw-items-center tw-gap-2">
                <span className="tw-text-[var(--brand)]">✓</span> {t('footer.easyReturns')}
              </span>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="tw-flex tw-flex-col tw-gap-3">
            <h3 className="tw-text-xs tw-font-bold tw-uppercase tw-tracking-wider tw-text-ink">
              {t('footer.linksTitle')}
            </h3>
            <ul className="tw-flex tw-flex-col tw-gap-2 tw-list-none tw-p-0 tw-m-0 tw-text-xs tw-text-muted">
              <li><Link to="/shop" className="hover:tw-text-ink hover:tw-underline">All Apparel</Link></li>
              <li><Link to="/categories/women" className="hover:tw-text-ink hover:tw-underline">Women's Collection</Link></li>
              <li><Link to="/categories/men" className="hover:tw-text-ink hover:tw-underline">Men's Wardrobe</Link></li>
              <li><Link to="/seasons/summer" className="hover:tw-text-ink hover:tw-underline">Summer Linen</Link></li>
              <li><Link to="/categories/sale" className="tw-text-[#981b1b] hover:tw-underline">Seasonal Sale</Link></li>
            </ul>
          </div>

          {/* Column 3: Customer Care */}
          <div className="tw-flex tw-flex-col tw-gap-3">
            <h3 className="tw-text-xs tw-font-bold tw-uppercase tw-tracking-wider tw-text-ink">
              {t('footer.supportTitle')}
            </h3>
            <ul className="tw-flex tw-flex-col tw-gap-2 tw-list-none tw-p-0 tw-m-0 tw-text-xs tw-text-muted">
              <li><Link to="/account" className="hover:tw-text-ink hover:tw-underline">My Account</Link></li>
              <li><Link to="/wishlist" className="hover:tw-text-ink hover:tw-underline">Saved Wishlist</Link></li>
              <li><Link to="/cart" className="hover:tw-text-ink hover:tw-underline">Shopping Bag</Link></li>
              {settings.supportPhone && (
                <li className="tw-pt-2 tw-font-medium tw-text-ink">
                  {t('footer.supportPhoneLabel', { phone: settings.supportPhone })}
                </li>
              )}
            </ul>
          </div>

          {/* Column 4: Social & Community */}
          <div className="tw-flex tw-flex-col tw-gap-3">
            <h3 className="tw-text-xs tw-font-bold tw-uppercase tw-tracking-wider tw-text-ink">
              Connect
            </h3>
            <p className="tw-text-xs tw-text-muted">
              Follow our seasonal releases and sustainable style edits.
            </p>
            <div className="tw-flex tw-items-center tw-gap-3 tw-mt-2">
              {settings.social && settings.social.map((item, idx) => (
                <a
                  key={idx}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="tw-px-3 tw-py-1.5 tw-rounded-full tw-bg-white tw-border tw-border-[var(--c-hair)] tw-text-xs tw-font-medium tw-text-ink hover:tw-bg-[var(--brand)] hover:tw-text-[var(--brand-contrast)] tw-transition-colors"
                >
                  {item.platform}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom copyright & attribution */}
        <div className="tw-mt-12 tw-pt-8 tw-border-t tw-border-[var(--c-hair)] tw-flex tw-items-center tw-justify-between tw-text-xs tw-text-muted">
          <p>© {currentYear} {settings.storeName}. {t('footer.rights')}</p>
          <div className="tw-flex tw-items-center tw-gap-4">
            <span>SSL Encrypted</span>
            <span>•</span>
            <span>Worldwide Delivery</span>
            <span>•</span>
            <span>Eco-Friendly Packaging</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default React.memo(DesktopFooter);
