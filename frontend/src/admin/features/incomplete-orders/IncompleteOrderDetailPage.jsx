import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Breadcrumb from '../../components/ui/Breadcrumb';
import { LoadError, LoadingBlock, Notice } from '../../components/ui/AsyncState';
import { deleteIncompleteOrders, getIncompleteOrder } from '../../services/api/incompleteOrders';
import { customerLabel, incompleteOrderErrorSentence } from './incompleteOrderQuery';
import { useResource } from '../../hooks/useResource';
import { formatMoney } from '../../utils/formatMoney';
import { site } from '../../config/site';

const LIST_PATH = '/ecommerce/incomplete-orders';
// useResource calls the fetcher with its params object. Module-level so the reference stays stable.
const fetchRecord = ({ id }) => getIncompleteOrder(id);
// Same red as the `danger` colour in tailwind.config.js. Button reads its colours from CSS variables, so a class would not win.
const DANGER = { '--bs-btn-bg': '#d92d20', '--bs-btn-border-color': '#d92d20', '--bs-btn-color': '#fff', '--bs-btn-hover-bg': '#b42318', '--bs-btn-hover-border-color': '#b42318', '--bs-btn-hover-color': '#fff', '--bs-btn-active-bg': '#b42318', '--bs-btn-active-color': '#fff' };

export default function IncompleteOrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: record, error, loading, reload } = useResource(fetchRecord, { id });
  const [deleting, setDeleting] = useState(false);
  const [actionError, setActionError] = useState('');

  const remove = async () => {
    if (deleting || !window.confirm(`Delete incomplete order ${id}?`)) return;
    setDeleting(true);
    setActionError('');
    try {
      const outcome = await deleteIncompleteOrders([id]);
      if (outcome.deleted.length) navigate(LIST_PATH);
      else setActionError(incompleteOrderErrorSentence(outcome.failed[0]?.code));
    } catch (deleteError) {
      setActionError(incompleteOrderErrorSentence(deleteError?.code));
    } finally {
      setDeleting(false);
    }
  };

  const crumbs = [{ label: 'Dashboard', to: '/ecommerce' }, { label: 'Ecommerce' }, { label: 'Orders', to: '/ecommerce/orders' }, { label: 'Incomplete orders', to: LIST_PATH }, { label: `#${id}` }];

  if (error) return <Card><LoadError message="Unable to load this incomplete order." onRetry={reload} /></Card>;
  if (loading) return <Card><LoadingBlock label="Loading incomplete order" className="tw-h-48" /></Card>;
  if (!record) return <Card><h1 className="tw-m-0 tw-text-xl tw-font-semibold">Incomplete order not found</h1><p className="tw-mt-1 tw-text-muted">It may have been deleted.</p><Link to={LIST_PATH} className="link-brand">← Back to incomplete orders</Link></Card>;

  return <div className="tw-flex tw-flex-col tw-gap-5">
    <header className="tw-flex tw-flex-wrap tw-items-end tw-justify-between tw-gap-3">
      <div><Breadcrumb items={crumbs} /><h1 className="tw-mt-2 tw-text-2xl tw-font-semibold">Incomplete order #{record.id}</h1></div>
      <div className="tw-flex tw-gap-2">
        <Button variant="brandOutline" onClick={() => navigate(LIST_PATH)}>Back</Button>
        <Button onClick={remove} loading={deleting} style={DANGER}>Delete</Button>
      </div>
    </header>
    {actionError && <Notice tone="error" text={actionError} onDismiss={() => setActionError('')} />}
    <div className="tw-grid tw-items-start tw-gap-5 lg:tw-grid-cols-[minmax(0,1.5fr)_minmax(260px,1fr)]">
      <Card title="Items in the cart">
        <div className="tw-overflow-x-auto">
          <table className="admin-table tw-min-w-[420px]">
            <caption className="visually-hidden">Items in the cart</caption>
            <thead><tr>{['Product', 'Qty', 'Price', 'Total'].map((heading) => <th key={heading} scope="col" className="tw-text-xs tw-uppercase tw-text-muted">{heading}</th>)}</tr></thead>
            <tbody>{record.items.map((line) => <tr key={line.id}><td><div className="tw-font-medium">{line.name}</div><div className="tw-text-xs tw-text-muted">{line.variant}</div></td><td>{line.qty}</td><td>{formatMoney(line.unitPrice)}</td><td>{formatMoney(line.qty * line.unitPrice)}</td></tr>)}</tbody>
            <tfoot><tr><th scope="row" colSpan="3" className="tw-text-right">Cart total</th><td className="tw-font-semibold">{formatMoney(record.amount)}</td></tr></tfoot>
          </table>
        </div>
      </Card>
      <Card title="Details">
        <dl className="tw-m-0 tw-grid tw-gap-3">
          <Row label="Customer" value={record.customer.name.trim() ? customerLabel(record) : <span className="tw-text-muted">Guest (left before entering details)</span>} />
          <Row label="Email" value={record.customer.email || <span className="tw-text-muted">Not provided</span>} />
          <Row label="Created at" value={record.createdAt.slice(0, 10)} />
          <Row label="Store" value={<a href={site.storeUrl} target="_blank" rel="noreferrer" className="link-brand">{site.name}</a>} />
        </dl>
      </Card>
    </div>
  </div>;
}

function Row({ label, value }) {
  return <div><dt className="tw-text-xs tw-uppercase tw-text-muted">{label}</dt><dd className="tw-m-0">{value}</dd></div>;
}
