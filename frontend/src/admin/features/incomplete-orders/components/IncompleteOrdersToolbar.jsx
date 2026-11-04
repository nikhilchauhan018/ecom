import Dropdown from 'react-bootstrap/Dropdown';
import Form from 'react-bootstrap/Form';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/ui/Icon';

const toggleClass = 'tw-h-11 tw-border tw-border-solid tw-border-field tw-bg-card tw-text-ink';

export default function IncompleteOrdersToolbar({ selectedCount, search, onSearch, onFilter, filtersOpen, onReload, loading, onExport, onBulkDelete, onCreate }) {
  return (
    <div className="tw-flex tw-flex-wrap tw-items-center tw-gap-2">
      <Dropdown>
        <Dropdown.Toggle variant="" disabled={!selectedCount} className={toggleClass}>
          Bulk actions {selectedCount ? `(${selectedCount})` : ''}<Icon name="chevron" size={16} />
        </Dropdown.Toggle>
        <Dropdown.Menu><Dropdown.Item onClick={onBulkDelete}>Delete</Dropdown.Item></Dropdown.Menu>
      </Dropdown>
      <Button variant="brandOutline" onClick={onFilter} aria-expanded={filtersOpen}><Icon name="filter" size={16} /> Filters</Button>
      <div className="tw-relative tw-min-w-[220px] tw-flex-1 md:tw-max-w-[320px]">
        <Form.Label htmlFor="incomplete-order-search" className="visually-hidden">Search incomplete orders</Form.Label>
        <Form.Control id="incomplete-order-search" type="search" value={search} onChange={(event) => onSearch(event.target.value)} placeholder="Search..." maxLength={100} className="tw-h-11 tw-pr-10" />
        <Icon name="search" size={17} className="tw-pointer-events-none tw-absolute tw-right-3 tw-top-3 tw-text-muted" />
      </div>
      <div className="tw-flex tw-flex-1 tw-justify-end tw-gap-2">
        <Button onClick={onCreate}><Icon name="plus" size={16} /> Create</Button>
        <Dropdown>
          <Dropdown.Toggle variant="" className={toggleClass}><Icon name="download" size={16} /> Export <Icon name="chevron" size={16} /></Dropdown.Toggle>
          <Dropdown.Menu><Dropdown.Item onClick={onExport}>CSV</Dropdown.Item></Dropdown.Menu>
        </Dropdown>
        <Button variant="brandOutline" aria-label="Reload incomplete orders" onClick={onReload} disabled={loading}><Icon name="refresh" size={17} className={loading ? 'tw-animate-spin' : ''} /></Button>
      </div>
    </div>
  );
}
