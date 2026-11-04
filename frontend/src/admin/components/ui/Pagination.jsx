import Icon from './Icon';
import { getPageItems, pageRange } from '../../utils/pagination';

function PageButton({ label, onClick, disabled, active, ariaLabel }) {
  return <button type="button" disabled={disabled} aria-label={ariaLabel || label} aria-current={active ? 'page' : undefined} onClick={onClick} className={`tw-min-h-10 tw-rounded-md tw-border-0 tw-px-3 tw-text-[15px] ${active ? 'tw-bg-brand tw-font-semibold tw-text-white' : 'tw-bg-transparent tw-text-muted hover:tw-bg-page'} disabled:tw-cursor-not-allowed disabled:tw-opacity-50`}>{label}</button>;
}

/** Page size selector, "Showing from X to Y in N records" and page buttons. `noun` names the things listed, e.g. "Orders". */
export default function Pagination({ page, pageSize, total, totalPages, onPage, onPageSize, noun = 'Records' }) {
  const { first, last } = pageRange(page, pageSize, total);
  const pageSizeId = `page-size-${noun.toLowerCase().replace(/\s+/g, '-')}`;
  return <footer className="tw-mt-5 tw-flex tw-flex-wrap tw-items-center tw-justify-between tw-gap-4 tw-border-0 tw-border-t tw-border-solid tw-border-hair tw-pt-5">
    <div className="tw-flex tw-items-center tw-gap-4">
      <label htmlFor={pageSizeId} className="visually-hidden">{noun} per page</label>
      <select id={pageSizeId} value={pageSize} onChange={(event) => onPageSize(event.target.value)} className="tw-h-10 tw-w-[90px] tw-rounded tw-border tw-border-solid tw-border-field tw-bg-card tw-px-2 tw-text-ink">
        <option value="10">10</option><option value="20">20</option><option value="50">50</option>
      </select>
      <span className="tw-inline-flex tw-items-center tw-gap-2 tw-whitespace-nowrap tw-text-[15px] tw-text-muted"><Icon name="globe" size={22} /> Showing from {first} to {last} in <strong className="tw-rounded tw-bg-muted tw-px-2 tw-py-1 tw-text-sm tw-text-card">{total}</strong> records</span>
    </div>
    <nav aria-label={`${noun} pagination`} className="tw-flex tw-items-center tw-gap-1">
      <PageButton disabled={page === 1} onClick={() => onPage(page - 1)} label="« Previous" />
      {getPageItems(page, totalPages).map((item, index) => item === 'ellipsis' ? <span key={`ellipsis-${index}`} className="tw-px-2 tw-text-muted">…</span> : <PageButton key={item} active={item === page} onClick={() => onPage(item)} label={item} ariaLabel={`Page ${item}`} />)}
      <PageButton disabled={page === totalPages} onClick={() => onPage(page + 1)} label="Next »" />
    </nav>
  </footer>;
}
