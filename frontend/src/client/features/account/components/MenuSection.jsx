import React from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../../../components/ui/Icon';
import { useT } from '../../../hooks/useT';

const ROW_CLASS =
  'tw-group tw-flex tw-items-center tw-gap-3 tw-min-h-[56px] tw-px-4 tw-text-[15px] tw-text-ink hover:tw-bg-[var(--c-card)] tw-transition-colors';

/**
 * A titled card of navigation rows.
 * Items without a resolvable destination (`to` or `href`) are skipped.
 * @param {{ titleId: string, title: string, items: Array<{ id: string, labelKey: string, icon?: string, to?: string, href?: string | null }> }} props
 */
export function MenuSection({ titleId, title, items }) {
  const { t } = useT();
  const visible = items.filter((item) => item.to || item.href);

  if (visible.length === 0) return null;

  return (
    <section aria-labelledby={titleId}>
      <h2
        id={titleId}
        className="tw-m-0 tw-mb-2 tw-px-1 tw-text-xs tw-font-semibold tw-uppercase tw-tracking-wider tw-text-[var(--c-muted)]"
      >
        {title}
      </h2>
      <ul className="tw-list-none tw-m-0 tw-p-0 tw-overflow-hidden tw-rounded-2xl tw-border tw-border-[var(--c-line)] tw-divide-y tw-divide-[var(--c-hair)]">
        {visible.map((item) => {
          const content = (
            <>
              {item.icon && (
                <span className="tw-flex tw-h-9 tw-w-9 tw-shrink-0 tw-items-center tw-justify-center tw-rounded-xl tw-bg-[var(--c-success-tint)] tw-text-[var(--c-success)]">
                  <Icon name={item.icon} size={18} />
                </span>
              )}
              <span className="tw-flex-1">{t(item.labelKey)}</span>
              <Icon
                name="chevron-right"
                size={18}
                className="tw-text-[var(--c-muted)] tw-transition-transform group-hover:tw-translate-x-0.5"
              />
            </>
          );

          return (
            <li key={item.id}>
              {item.href ? (
                <a href={item.href} target="_blank" rel="noopener noreferrer" className={ROW_CLASS}>
                  {content}
                </a>
              ) : (
                <Link to={item.to} className={ROW_CLASS}>
                  {content}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export default React.memo(MenuSection);
