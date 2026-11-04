import { Link } from 'react-router-dom';
import Table from 'react-bootstrap/Table';
import Icon from '../../../components/ui/Icon';
import SortButton from '../../../components/ui/SortButton';
import { formatMoney } from '../../../utils/formatMoney';
import { customerLabel } from '../incompleteOrderQuery';

const SORTABLE = [['id', 'ID'], ['customer', 'Customer'], ['amount', 'Amount'], ['createdAt', 'Created at']];
const ariaSort = (field, sort, order) => (sort === field ? (order === 'asc' ? 'ascending' : 'descending') : 'none');

export default function IncompleteOrdersTable({ records, selected, onSelectAll, onSelect, onSort, sort, order, store, onDelete }) {
  const allSelected = records.length > 0 && selected.length === records.length;
  return (
    <div className="tw-overflow-x-auto">
      <Table className="admin-table tw-mb-0 tw-min-w-[820px]">
        <caption className="visually-hidden">Incomplete orders</caption>
        <thead>
          <tr>
            <th scope="col"><input type="checkbox" aria-label="Select all incomplete orders" checked={allSelected} onChange={(event) => onSelectAll(event.target.checked)} /></th>
            {SORTABLE.map(([field, label]) => <th key={field} scope="col" aria-sort={ariaSort(field, sort, order)}><SortButton field={field} label={label} sort={sort} order={order} onSort={onSort} /></th>)}
            <th scope="col" className="tw-text-xs tw-font-medium tw-uppercase tw-text-muted">Store</th>
            <th scope="col" className="tw-text-xs tw-font-medium tw-uppercase tw-text-muted">Operations</th>
          </tr>
        </thead>
        <tbody>
          {records.map((record) => (
            <tr key={record.id} className="hover:tw-bg-page">
              <td><input type="checkbox" aria-label={`Select incomplete order ${record.id}`} checked={selected.includes(record.id)} onChange={() => onSelect(record.id)} /></td>
              <td className="tw-font-medium">{record.id}</td>
              <td>
                {record.customer.name.trim() ? <div>{customerLabel(record)}</div> : <div className="tw-text-muted">{customerLabel(record)}</div>}
                {record.customer.email && <div className="tw-text-xs tw-text-muted">{record.customer.email}</div>}
              </td>
              <td>{formatMoney(record.amount)}</td>
              <td>{record.createdAt.slice(0, 10)}</td>
              <td><a href={store.url} target="_blank" rel="noreferrer" className="link-brand">{store.name}</a></td>
              <td>
                <div className="tw-flex tw-gap-1">
                  <Link to={`/ecommerce/incomplete-orders/${record.id}`} aria-label={`View incomplete order ${record.id}`} title="View" className="tw-grid tw-h-9 tw-w-9 tw-place-items-center tw-rounded-md tw-border tw-border-solid tw-border-field tw-bg-card tw-text-ink"><Icon name="eye" size={17} /></Link>
                  <button type="button" aria-label={`Delete incomplete order ${record.id}`} title="Delete" onClick={() => onDelete(record.id)} className="tw-grid tw-h-9 tw-w-9 tw-cursor-pointer tw-place-items-center tw-rounded-md tw-border-0 tw-bg-danger tw-text-white"><Icon name="trash" size={17} /></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}
