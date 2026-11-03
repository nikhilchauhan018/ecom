import { PRODUCT_SIZES } from '../productConstants';

export default function SizeSelector({ sizes, onChange }) {
  const toggle = (size) => onChange(sizes.includes(size) ? sizes.filter((value) => value !== size) : [...sizes, size]);
  return <div className="tw-flex tw-flex-wrap tw-gap-2">{PRODUCT_SIZES.map((size) => <button key={size} type="button" aria-pressed={sizes.includes(size)} onClick={() => toggle(size)} className={`tw-rounded-md tw-border tw-px-3 tw-py-2 tw-text-sm tw-font-medium tw-transition focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-[var(--c-brand)] ${sizes.includes(size) ? 'tw-border-[var(--c-brand)] tw-bg-[var(--c-brand)] tw-text-[var(--c-brand-contrast)]' : 'tw-border-line tw-bg-card'}`}>{size}</button>)}</div>;
}
