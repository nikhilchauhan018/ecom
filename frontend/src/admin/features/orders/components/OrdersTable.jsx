import Table from 'react-bootstrap/Table';
import Icon from '../../../components/ui/Icon';
import OrderStatusPill from './OrderStatusPill';
import { formatMoney } from '../../../utils/formatMoney';

const paymentTone = { pending: 'wait', completed: 'ok', failed: 'bad', refunded: 'bad', partially_refunded: 'wait' };
const paymentToneClass = { wait: 'tw-bg-[var(--c-warning-bg)] tw-text-[var(--c-warning-ink)]', ok: 'tw-bg-[var(--c-success-bg)] tw-text-[var(--c-success-ink)]', bad: 'tw-bg-[var(--c-danger-bg)] tw-text-[var(--c-danger-ink)]' };
const headings = [['id', 'ID'], ['customer', 'EMAIL'], ['amounts', 'AMOUNT'], ['paymentMethod', 'PAYMENT METHOD'], ['paymentStatus', 'PAYMENT STATUS'], ['status', 'STATUS'], ['tax', 'TAX AMOUNT']];

function SortButton({ field, label, sort, order, onSort }) {
  const active = sort === field;
  return <button type="button" className="tw-inline-flex tw-items-center tw-gap-1 tw-border-0 tw-bg-transparent tw-p-0 tw-text-xs tw-font-medium tw-uppercase tw-text-muted" onClick={() => onSort(field)}>{label}<Icon name={active && order === 'asc' ? 'arrowUp' : 'arrowDown'} size={13} /></button>;
}

export default function OrdersTable({ orders, selected, expanded, onSelect, onExpand, onSort, sort, order, onEdit, onDelete }) {
  return (
    <div className="tw-overflow-x-auto">
      <Table className="admin-table tw-mb-0 tw-min-w-[1060px]">
        <thead><tr><th><input type="checkbox" aria-label="Select all orders" checked={selected.length === orders.length && orders.length > 0} onChange={(e) => onSelect(e.target.checked ? orders.map((item) => item.id) : [])} /></th><th aria-label="Expand" />{headings.map(([field, label]) => <th key={field} className={field === 'paymentMethod' || field === 'tax' ? 'tw-hidden md:tw-table-cell' : ''}><SortButton field={field} label={label} sort={sort} order={order} onSort={onSort} /></th>)}<th className="tw-text-xs tw-font-medium tw-uppercase tw-text-muted">Operations</th></tr></thead>
        <tbody>{orders.map((item) => <OrderRow key={item.id} item={item} selected={selected.includes(item.id)} expanded={expanded.includes(item.id)} onSelect={onSelect} onExpand={onExpand} onEdit={onEdit} onDelete={onDelete} />)}</tbody>
      </Table>
    </div>
  );
}

function OrderRow({ item, selected, expanded, onSelect, onExpand, onEdit, onDelete }) {
  return <><tr className="hover:tw-bg-page">
    <td><input type="checkbox" aria-label={`Select order ${item.number}`} checked={selected} onChange={() => onSelect(item.id)} /></td>
    <td><button type="button" aria-label={`${expanded ? 'Collapse' : 'Expand'} ${item.number}`} aria-expanded={expanded} onClick={() => onExpand(item.id)} className="tw-border-0 tw-bg-transparent tw-text-ink">{expanded ? '▼' : '▶'}</button></td>
    <td><a href={`/ecommerce/orders/${item.id}`} className="link-brand tw-font-semibold">{item.number}</a></td>
    <td><div className="tw-max-w-[210px] tw-truncate"><strong>{item.customer.name}</strong><br /><a className="link-brand" href={`mailto:${item.customer.email}`}>{item.customer.email}</a><br /><span className="tw-text-muted">{item.customer.phone}</span></div></td>
    <td>{formatMoney(item.amounts.total)}</td><td className="tw-whitespace-normal tw-hidden md:tw-table-cell">{item.paymentMethod.label}</td><td><span className={`tw-rounded-full tw-px-2 tw-py-1 tw-text-xs tw-capitalize ${paymentToneClass[paymentTone[item.paymentStatus]]}`}>{item.paymentStatus.replace('_', ' ')}</span></td><td><OrderStatusPill status={item.status} /></td><td className="tw-hidden md:tw-table-cell">{formatMoney(item.amounts.tax)}</td>
    <td><div className="tw-flex tw-gap-1"><button type="button" aria-label={`Edit ${item.number}`} onClick={() => onEdit(item.id)} className="tw-grid tw-h-10 tw-w-10 tw-place-items-center tw-border-0 tw-bg-transparent tw-text-brand"><Icon name="edit" size={17} /></button><button type="button" aria-label={`Delete ${item.number}`} onClick={() => onDelete(item.id)} className="tw-grid tw-h-10 tw-w-10 tw-place-items-center tw-border-0 tw-bg-transparent tw-text-danger"><Icon name="trash" size={17} /></button></div></td>
  </tr>{expanded && <tr><td colSpan="11" className="tw-bg-page"><div className="tw-grid tw-gap-3 tw-p-3 md:tw-grid-cols-2"><div><strong>Items</strong>{item.items.map((line) => <div key={line.id} className="tw-flex tw-justify-between tw-gap-3 tw-py-1"><span>{line.name} · {line.variant} × {line.qty}</span><span>{formatMoney(line.total)}</span></div>)}</div><div><strong>Shipping address</strong><p className="tw-mt-1 tw-text-muted">{item.shippingAddress.name}<br />{item.shippingAddress.line1}, {item.shippingAddress.city}<br />{item.shippingAddress.region} {item.shippingAddress.postalCode}, {item.shippingAddress.country}</p></div></div></td></tr>}</>;
}
