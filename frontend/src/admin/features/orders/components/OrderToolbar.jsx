import Dropdown from 'react-bootstrap/Dropdown';
import Form from 'react-bootstrap/Form';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/ui/Icon';

export default function OrderToolbar({ selectedCount, search, onSearch, onFilter, onReload, loading, onExport, onBulkAction, onCreate }) {
  return (
    <div className="tw-flex tw-flex-wrap tw-items-center tw-gap-2">
      <Dropdown>
        <Dropdown.Toggle variant="" disabled={!selectedCount} className="tw-h-11 tw-border tw-border-solid tw-border-field tw-bg-card tw-text-ink">
          Bulk actions {selectedCount ? `(${selectedCount})` : ''}<Icon name="chevron" size={16} />
        </Dropdown.Toggle>
        <Dropdown.Menu>
          {['confirmed', 'packed', 'shipped', 'delivered'].map((status) => <Dropdown.Item key={status} onClick={() => onBulkAction(status)}>Mark as {status}</Dropdown.Item>)}
          <Dropdown.Divider />
          <Dropdown.Item onClick={() => onBulkAction('cancelled')}>Cancel orders</Dropdown.Item>
          <Dropdown.Item onClick={() => onBulkAction('delete')}>Delete</Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
      <Button variant="brandOutline" onClick={onFilter}><Icon name="filter" size={16} /> Filters</Button>
      <div className="tw-relative tw-min-w-[220px] tw-flex-1 md:tw-max-w-[320px]">
        <Form.Label htmlFor="order-search" className="visually-hidden">Search orders</Form.Label>
        <Form.Control id="order-search" value={search} onChange={(event) => onSearch(event.target.value)} placeholder="Search..." className="tw-h-11 tw-pr-10" />
        <Icon name="search" size={17} className="tw-absolute tw-right-3 tw-top-3 tw-text-muted" />
      </div>
      <div className="tw-flex tw-flex-1 tw-justify-end tw-gap-2">
        <Button onClick={onCreate}><Icon name="plus" size={16} /> Create</Button>
        <Dropdown>
          <Dropdown.Toggle variant="" className="tw-h-11 tw-border tw-border-solid tw-border-field tw-bg-card tw-text-ink"><Icon name="download" size={16} /> Export <Icon name="chevron" size={16} /></Dropdown.Toggle>
          <Dropdown.Menu><Dropdown.Item onClick={() => onExport('csv')}>CSV</Dropdown.Item><Dropdown.Item onClick={() => onExport('xls')}>Excel (.xls)</Dropdown.Item></Dropdown.Menu>
        </Dropdown>
        <Button variant="brandOutline" aria-label="Reload orders" onClick={onReload} disabled={loading}><Icon name="refresh" size={17} className={loading ? 'tw-animate-spin' : ''} /></Button>
      </div>
    </div>
  );
}
