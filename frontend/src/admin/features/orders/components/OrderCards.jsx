import Icon from '../../../components/ui/Icon';
import OrderStatusPill from './OrderStatusPill';
import { formatMoney } from '../../../utils/formatMoney';

export default function OrderCards({ orders, selected, onSelect, onEdit, onDelete }) {
  return <div className="tw-space-y-3">
    {orders.map((item) => <article key={item.id} className="tw-rounded-lg tw-border tw-border-solid tw-border-hair tw-p-4">
      <div className="tw-flex tw-items-start tw-justify-between tw-gap-3">
        <div className="tw-flex tw-items-start tw-gap-3"><input type="checkbox" aria-label={`Select order ${item.number}`} checked={selected.includes(item.id)} onChange={() => onSelect(item.id)} /><div><a href={`/ecommerce/orders/${item.id}`} className="link-brand tw-font-semibold">{item.number}</a><div className="tw-mt-1"><OrderStatusPill status={item.status} /></div></div></div>
        <div className="tw-flex tw-gap-1"><button type="button" aria-label={`Edit ${item.number}`} onClick={() => onEdit(item.id)} className="tw-grid tw-h-10 tw-w-10 tw-place-items-center tw-border-0 tw-bg-transparent tw-text-brand"><Icon name="edit" size={17} /></button><button type="button" aria-label={`Delete ${item.number}`} onClick={() => onDelete(item.id)} className="tw-grid tw-h-10 tw-w-10 tw-place-items-center tw-border-0 tw-bg-transparent tw-text-danger"><Icon name="trash" size={17} /></button></div>
      </div>
      <div className="tw-mt-3 tw-grid tw-grid-cols-2 tw-gap-3 tw-text-sm"><div><span className="tw-block tw-text-xs tw-uppercase tw-text-muted">Customer</span><strong className="tw-block tw-truncate">{item.customer.name}</strong><a className="link-brand tw-block tw-truncate" href={`mailto:${item.customer.email}`}>{item.customer.email}</a></div><div className="tw-text-right"><span className="tw-block tw-text-xs tw-uppercase tw-text-muted">Amount</span><strong>{formatMoney(item.amounts.total)}</strong><span className="tw-block tw-capitalize tw-text-muted">{item.paymentStatus.replace('_', ' ')}</span></div></div>
    </article>)}
  </div>;
}
