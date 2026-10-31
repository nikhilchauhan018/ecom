import React from 'react';
import { AccountShell } from '../account/components/AccountShell';
import { Icon } from '../../components/ui/Icon';
import { CONTENT_PAGES } from '../../data/content';
import { useSettings } from '../../hooks/useSettings';
import { ROUTES } from '../../config/constants';
import { buildWhatsAppUrl } from '../../utils/account';

function ContactCards({ settings }) {
  const phone = settings.supportPhone;
  const telHref = phone ? `tel:${phone.replace(/[^\d+]/g, '')}` : null;
  const whatsappHref = buildWhatsAppUrl(phone);

  const cards = [
    telHref && { id: 'call', icon: 'phone', label: phone, href: telHref, external: false },
    whatsappHref && { id: 'wa', icon: 'message-circle', label: 'WhatsApp', href: whatsappHref, external: true },
  ].filter(Boolean);

  if (cards.length === 0) return null;

  return (
    <ul className="tw-m-0 tw-grid tw-list-none tw-gap-3 tw-p-0 sm:tw-grid-cols-2">
      {cards.map((card) => (
        <li key={card.id}>
          <a
            href={card.href}
            {...(card.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            className="tw-flex tw-items-center tw-gap-3 tw-rounded-2xl tw-border tw-border-[var(--c-line)] tw-p-4 tw-text-ink hover:tw-bg-[var(--c-card)]"
          >
            <span className="tw-flex tw-h-9 tw-w-9 tw-items-center tw-justify-center tw-rounded-xl tw-bg-[var(--c-success-tint)] tw-text-[var(--c-success)]">
              <Icon name={card.icon} size={18} />
            </span>
            <span className="tw-text-[15px] tw-font-medium">{card.label}</span>
          </a>
        </li>
      ))}
    </ul>
  );
}

/**
 * Renders one of the static pages from data/content.js (About, Contact, policies).
 * Public: no sign-in needed. Content is plain text rendered through React (no HTML injection).
 * @param {{ pageId: keyof typeof CONTENT_PAGES }} props
 */
export function ContentPage({ pageId }) {
  const settings = useSettings();
  const page = CONTENT_PAGES[pageId];
  const fill = (text) => text.replaceAll('{store}', settings.storeName);

  if (!page) return null;

  return (
    <AccountShell title={page.title} fallbackTo={ROUTES.HOME} desktopBackTo={null}>
      <p className="tw-m-0 tw-text-[15px] tw-leading-relaxed tw-text-[var(--c-muted)]">{fill(page.intro)}</p>

      {pageId === 'contact' && <ContactCards settings={settings} />}

      {page.sections.map((section) => (
        <section key={section.heading}>
          <h2 className="tw-m-0 tw-mb-2 tw-text-base tw-font-semibold tw-text-ink">{section.heading}</h2>
          {section.paragraphs?.map((paragraph) => (
            <p key={paragraph} className="tw-m-0 tw-mb-2 tw-text-sm tw-leading-relaxed tw-text-ink">
              {fill(paragraph)}
            </p>
          ))}
          {section.list && (
            <ul className="tw-m-0 tw-flex tw-list-none tw-flex-col tw-gap-2 tw-p-0 tw-text-sm tw-text-ink">
              {section.list.map((item) => (
                <li key={item} className="tw-flex tw-items-start tw-gap-2.5">
                  <Icon name="check" size={16} className="tw-mt-0.5 tw-shrink-0 tw-text-[var(--c-success)]" />
                  {fill(item)}
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}
    </AccountShell>
  );
}

export default ContentPage;
