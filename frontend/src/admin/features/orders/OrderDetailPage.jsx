import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Form from 'react-bootstrap/Form';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Icon from '../../components/ui/Icon';
import OrderStatusPill from './components/OrderStatusPill';
import { ORDER_STATUSES } from './orderStatus';
import { addOrderNote, deleteOrder, getOrder, refundOrder, updateOrder, updateOrderStatus } from '../../services/api/orders';
import { formatMoney } from '../../utils/formatMoney';
import { getStoreSettings } from '../../config/settings';

const settings = getStoreSettings();
const emptyAddress = { name: '', line1: '', city: '', region: '', postalCode: '', country: '' };

export default function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [notify, setNotify] = useState(true);
  const [note, setNote] = useState('');
  const [addressType, setAddressType] = useState(null);
  const [address, setAddress] = useState(emptyAddress);
  const [refundOpen, setRefundOpen] = useState(false);
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    let active = true;
    getOrder(id).then((result) => {
      if (!active) return;
      setOrder(result);
      setStatus(result?.status || '');
      setLoading(false);
      if (!result) setError('Order not found.');
    }).catch(() => { if (active) { setError('Unable to load order.'); setLoading(false); } });
    return () => { active = false; };
  }, [id]);

  const save = async (result, successMessage) => {
    if (result) {
      setOrder(result);
      setMessage(successMessage);
      window.setTimeout(() => setMessage(''), 3000);
    }
  };
  const changeStatus = async (event) => {
    event.preventDefault();
    if (!status || status === order.status) return;
    await save(await updateOrderStatus(id, status, { note: statusNote, notify }), 'Order status updated.');
    setStatusNote('');
  };
  const addNote = async (event) => {
    event.preventDefault();
    if (!note.trim()) return;
    await save(await addOrderNote(id, note.trim()), 'Note added.');
    setNote('');
  };
  const submitRefund = async (event) => {
    event.preventDefault();
    const amount = Number(refundAmount);
    if (!amount || amount <= 0 || amount > order.amounts.total) return;
    await save(await refundOrder(id, { amount, reason: refundReason }), 'Refund recorded.');
    setRefundOpen(false);
    setRefundAmount('');
    setRefundReason('');
  };
  const editAddress = (type) => { setAddressType(type); setAddress({ ...order[type] }); };
  const saveAddress = async (event) => {
    event.preventDefault();
    await save(await updateOrder(id, { [addressType]: address }), 'Address updated.');
    setAddressType(null);
  };
  const remove = async () => {
    if (!window.confirm('Delete this order?')) return;
    await deleteOrder(id);
    navigate('/ecommerce/orders');
  };

  if (loading) return <Card><div className="tw-h-32 tw-animate-pulse tw-rounded tw-bg-page" /></Card>;
  if (error || !order) return <Card><p className="tw-text-danger">{error || 'Order not found.'}</p><Link className="link-brand" to="/ecommerce/orders">Back to orders</Link></Card>;

  return <div className="tw-flex tw-flex-col tw-gap-5">
    <header className="tw-flex tw-flex-wrap tw-items-start tw-justify-between tw-gap-3">
      <div><Link to="/ecommerce/orders" className="link-brand tw-inline-flex tw-items-center tw-gap-1"><Icon name="arrowDown" size={14} className="tw-rotate-90" /> Back to orders</Link><div className="tw-mt-2 tw-flex tw-flex-wrap tw-items-center tw-gap-3"><h1 className="tw-text-2xl tw-font-semibold">Order #{order.number}</h1><OrderStatusPill status={order.status} /></div><p className="tw-mt-1 tw-text-muted">Created {new Date(order.createdAt).toLocaleString(settings.locale)}</p></div>
      <div className="print-hidden tw-flex tw-flex-wrap tw-gap-2"><Button variant="brandOutline" onClick={() => window.print()}><Icon name="download" size={16} /> Print invoice</Button><Button variant="brandOutline" onClick={() => window.print()}><Icon name="download" size={16} /> Packing slip</Button><Button variant="brandOutline" onClick={() => navigate(`/ecommerce/orders/${id}/edit`)}><Icon name="edit" size={16} /> Edit</Button></div>
    </header>
    {message && <div role="status" aria-live="polite" className="tw-rounded-lg tw-bg-[var(--c-success-bg)] tw-p-3 tw-text-[var(--c-success-ink)]">{message}</div>}
    <div className="tw-grid tw-items-start tw-gap-5 lg:tw-grid-cols-[minmax(0,1.5fr)_minmax(280px,1fr)]">
      <div className="tw-flex tw-flex-col tw-gap-5">
        <ItemsCard order={order} />
        <Card title="Order notes"><form onSubmit={addNote} className="tw-flex tw-flex-col tw-gap-2 sm:tw-flex-row"><Form.Control aria-label="Add internal note" value={note} onChange={(event) => setNote(event.target.value)} placeholder="Add an internal note" /><Button type="submit">Add note</Button></form><div className="tw-mt-4 tw-space-y-3">{order.notes.map((item) => <div key={item.id} className="tw-border-0 tw-border-t tw-border-solid tw-border-hair tw-pt-3"><p>{item.text}</p><small className="tw-text-muted">{item.by} · {new Date(item.at).toLocaleString(settings.locale)}</small></div>)}</div></Card>
        <Card title="Status timeline"><form onSubmit={changeStatus} className="tw-grid tw-gap-3 sm:tw-grid-cols-[1fr_1fr_auto]"><Form.Group><Form.Label>Change status</Form.Label><Form.Select value={status} onChange={(event) => setStatus(event.target.value)}>{Object.entries(ORDER_STATUSES).map(([key, value]) => <option key={key} value={key}>{value.label}</option>)}</Form.Select></Form.Group><Form.Group><Form.Label>Optional note</Form.Label><Form.Control value={statusNote} onChange={(event) => setStatusNote(event.target.value)} /></Form.Group><Button className="sm:tw-mt-8" type="submit">Save</Button></form><Form.Check className="tw-mt-3" type="checkbox" label="Notify customer" checked={notify} onChange={(event) => setNotify(event.target.checked)} /> <div className="tw-mt-5 tw-space-y-4">{[...order.history].reverse().map((item, index) => <div key={`${item.at}-${index}`} className="tw-flex tw-gap-3"><span className="tw-mt-1 tw-h-2.5 tw-w-2.5 tw-shrink-0 tw-rounded-full tw-bg-brand" /><div><strong>{ORDER_STATUSES[item.status]?.label || item.status}</strong><p className="tw-text-muted">{item.note || 'Status changed'} · {item.by} · {new Date(item.at).toLocaleString(settings.locale)}</p></div></div>)}</div></Card>
      </div>
      <div className="tw-flex tw-flex-col tw-gap-5">
        <InfoCard title="Customer"><strong>{order.customer.name}</strong><a className="link-brand tw-block" href={`mailto:${order.customer.email}`}>{order.customer.email}</a><span className="tw-text-muted">{order.customer.phone}</span></InfoCard>
        <AddressCard title="Shipping address" value={order.shippingAddress} onEdit={() => editAddress('shippingAddress')} />
        <AddressCard title="Billing address" value={order.billingAddress} onEdit={() => editAddress('billingAddress')} />
        <Card title="Payment"><p>{order.paymentMethod.label}</p><p className="tw-capitalize tw-text-muted">Status: {order.paymentStatus.replace('_', ' ')}</p><p className="tw-text-muted">Transaction: TX-{order.id}</p><Button variant="brandOutline" onClick={() => setRefundOpen(true)}>Refund payment</Button></Card>
        <InfoCard title="Delivery"><p>{order.delivery.courier}</p><p className="tw-text-muted">Tracking: {order.delivery.trackingNumber}</p><a className="link-brand" href={order.delivery.trackingUrl} target="_blank" rel="noreferrer">Track shipment</a><p className="tw-mt-1 tw-text-muted">Estimated {order.delivery.estimatedDate}</p></InfoCard>
        <Card><Button variant="brandOutline" onClick={() => setMessage('Confirmation resent.')}>Resend confirmation</Button><Button variant="brandOutline tw-ml-2" onClick={remove}>Delete order</Button></Card>
      </div>
    </div>
    {addressType && <AddressModal value={address} onChange={setAddress} onClose={() => setAddressType(null)} onSubmit={saveAddress} />}
    {refundOpen && <RefundModal amount={refundAmount} reason={refundReason} onAmount={setRefundAmount} onReason={setRefundReason} onClose={() => setRefundOpen(false)} onSubmit={submitRefund} max={order.amounts.total} />}
  </div>;
}

function ItemsCard({ order }) {
  const totals = useMemo(() => order.amounts, [order.amounts]);
  return <Card title="Items"><div className="tw-overflow-x-auto"><table className="tw-w-full tw-min-w-[540px]"><thead><tr className="tw-text-left tw-text-xs tw-uppercase tw-text-muted"><th className="tw-py-2">Product</th><th>SKU</th><th>Qty</th><th>Unit price</th><th className="tw-text-right">Line total</th></tr></thead><tbody>{order.items.map((item) => <tr key={item.id} className="tw-border-0 tw-border-t tw-border-solid tw-border-hair"><td className="tw-py-3"><strong>{item.name}</strong><br /><span className="tw-text-muted">{item.variant}</span></td><td>{item.sku}</td><td>{item.qty}</td><td>{formatMoney(item.unitPrice)}</td><td className="tw-text-right">{formatMoney(item.total)}</td></tr>)}</tbody></table></div><div className="tw-ml-auto tw-mt-5 tw-max-w-xs tw-space-y-2 tw-border-0 tw-border-t tw-border-solid tw-border-hair tw-pt-3"><Total label="Subtotal" value={totals.subtotal} /><Total label="Discount" value={-totals.discount} /><Total label="Shipping" value={totals.shipping} /><Total label={settings.taxName} value={totals.tax} /><Total label="Grand total" value={totals.total} strong /></div></Card>;
}

function Total({ label, value, strong }) { return <div className={`tw-flex tw-justify-between ${strong ? 'tw-text-base tw-font-semibold' : 'tw-text-muted'}`}><span>{label}</span><span>{formatMoney(value)}</span></div>; }
function InfoCard({ title, children }) { return <Card title={title}><div className="tw-flex tw-flex-col tw-gap-1">{children}</div></Card>; }
function AddressCard({ title, value, onEdit }) { return <Card title={title}><p className="tw-leading-6">{value.name}<br />{value.line1}<br />{value.city}, {value.region} {value.postalCode}<br />{value.country}</p><button type="button" className="tw-mt-2 tw-border-0 tw-bg-transparent tw-p-0 tw-text-brand" onClick={onEdit}>Edit address</button></Card>; }
function AddressModal({ value, onChange, onClose, onSubmit }) { return <div className="tw-fixed tw-inset-0 tw-z-20 tw-grid tw-place-items-center tw-bg-black/50 tw-p-4"><Card title="Edit address" className="tw-w-full tw-max-w-lg"><form onSubmit={onSubmit} className="tw-grid tw-gap-3">{['name', 'line1', 'city', 'region', 'postalCode', 'country'].map((key) => <Form.Group key={key}><Form.Label>{key}</Form.Label><Form.Control value={value[key]} onChange={(event) => onChange({ ...value, [key]: event.target.value })} required /></Form.Group>)}<div className="tw-flex tw-justify-end tw-gap-2"><Button variant="brandOutline" onClick={onClose}>Cancel</Button><Button type="submit">Save</Button></div></form></Card></div>; }
function RefundModal({ amount, reason, onAmount, onReason, onClose, onSubmit, max }) { return <div className="tw-fixed tw-inset-0 tw-z-20 tw-grid tw-place-items-center tw-bg-black/50 tw-p-4"><Card title="Refund payment" className="tw-w-full tw-max-w-md"><form onSubmit={onSubmit} className="tw-grid tw-gap-3"><Form.Group><Form.Label>Amount (maximum {formatMoney(max)})</Form.Label><Form.Control type="number" min="1" max={max} value={amount} onChange={(event) => onAmount(event.target.value)} required /></Form.Group><Form.Group><Form.Label>Reason</Form.Label><Form.Control as="textarea" rows={3} value={reason} onChange={(event) => onReason(event.target.value)} required /></Form.Group><div className="tw-flex tw-justify-end tw-gap-2"><Button variant="brandOutline" onClick={onClose}>Cancel</Button><Button type="submit">Issue refund</Button></div></form></Card></div>; }
