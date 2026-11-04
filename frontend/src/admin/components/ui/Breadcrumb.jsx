import { Link } from 'react-router-dom';

/** `items` is `[{ label, to? }]`. Items with `to` are links, the rest (and always the last one) are plain text. */
export default function Breadcrumb({ items }) {
  return (
    <nav aria-label="Breadcrumb" className="tw-text-xs tw-uppercase tw-tracking-[0.12em]">
      {items.map((item, index) => {
        const last = index === items.length - 1;
        return (
          <span key={item.label}>
            {index > 0 && <span aria-hidden="true" className="tw-mx-2 tw-text-muted">/</span>}
            {item.to && !last
              ? <Link to={item.to} className="link-brand">{item.label}</Link>
              : <span className="tw-text-muted" aria-current={last ? 'page' : undefined}>{item.label}</span>}
          </span>
        );
      })}
    </nav>
  );
}
