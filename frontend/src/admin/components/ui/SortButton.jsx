import Icon from './Icon';

/** Column heading button that sorts by `field`. The arrow shows the direction only on the active column. */
export default function SortButton({ field, label, sort, order, onSort }) {
  const active = sort === field;
  return <button type="button" className="tw-inline-flex tw-items-center tw-gap-1 tw-border-0 tw-bg-transparent tw-p-0 tw-text-xs tw-font-medium tw-uppercase tw-text-muted" onClick={() => onSort(field)}>
    {label}<Icon name={active && order === 'asc' ? 'arrowUp' : 'arrowDown'} size={13} className={active ? '' : 'tw-opacity-40'} />
  </button>;
}
