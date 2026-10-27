import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Form from 'react-bootstrap/Form';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Icon from '../../components/ui/Icon';
import { createOrder, getOrder, updateOrder } from '../../services/api/orders';
import { ordersMock, paymentMethods } from '../../data/orders.mock';
import { formatMoney } from '../../utils/formatMoney';
import { getStoreSettings } from '../../config/settings';

const settings = getStoreSettings();
const emptyAddress = { name: '', line1: '', city: '', region: '', postalCode: '', country: '' };
const emptyForm = {
  customer: { id: '', name: '', email: '', phone: '' },
  items: [],
  amounts: { discount: 0, shipping: 0 },
  paymentMethod: paymentMethods[0],
  paymentStatus: 'pending',
  shippingAddress: emptyAddress,
  billingAddress: emptyAddress,
  notes: [],
};
const products = Array.from(new Map(ordersMock.flatMap((order) => order.items).map((item) => [item.productId, item])).values());

export default function OrderFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const editing = Boolean(id);
  const [form, setForm] = useState(emptyForm);
  const [customerQuery, setCustomerQuery] = useState('');
  const [productId, setProductId] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(editing);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!editing) return undefined;
    let active = true;
    getOrder(id).then((order) => {
      if (!active) return;
      if (order) setForm({ ...order, amounts: { discount: order.amounts.discount, shipping: order.amounts.shipping } });
      setLoading(false);
    });
    return () => { active = false; };
  }, [editing, id]);

  useEffect(() => {
    const guard = (event) => {
      if (dirty) { event.preventDefault(); event.returnValue = ''; }
    };
    window.addEventListener('beforeunload', guard);
    return () => window.removeEventListener('beforeunload', guard);
  }, [dirty]);

  const totals = useMemo(() => {
    const subtotal = form.items.reduce((sum, item) => sum + item.total, 0);
    const tax = Math.round(subtotal * 0.18);
    return { subtotal, tax, total: subtotal - Number(form.amounts.discount || 0) + Number(form.amounts.shipping || 0) + tax };
  }, [form.amounts.discount, form.amounts.shipping, form.items]);
  const customers = useMemo(() => Array.from(new Map(ordersMock.map((order) => [order.customer.id, order.customer])).values()), []);
  const matchingCustomers = customers.filter((customer) => `${customer.name} ${customer.email} ${customer.phone}`.toLowerCase().includes(customerQuery.toLowerCase()));
  const setField = (key, value) => { setDirty(true); setForm((current) => ({ ...current, [key]: value })); };
  const setCustomer = (customer) => { setField('customer', customer); setField('shippingAddress', { ...form.shippingAddress, name: customer.name }); setField('billingAddress', { ...form.billingAddress, name: customer.name }); setCustomerQuery(''); };
  const addProduct = () => {
    const product = products.find((item) => item.productId === productId);
    if (!product) return;
    setDirty(true);
    setForm((current) => {
      const existing = current.items.find((item) => item.productId === product.productId);
      if (existing) return { ...current, items: current.items.map((item) => item.productId === product.productId ? { ...item, qty: item.qty + 1, total: (item.qty + 1) * item.unitPrice } : item) };
      return { ...current, items: [...current.items, { ...product, qty: 1, total: product.unitPrice }] };
    });
    setProductId('');
  };
  const updateQuantity = (product, quantity) => {
    const qty = Math.max(1, Number(quantity) || 1);
    setDirty(true);
    setForm((current) => ({ ...current, items: current.items.map((item) => item.productId === product.productId ? { ...item, qty, total: qty * item.unitPrice } : item) }));
  };
  const removeProduct = (productIdToRemove) => { setDirty(true); setForm((current) => ({ ...current, items: current.items.filter((item) => item.productId !== productIdToRemove) })); };
  const submit = async (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (!form.customer.name) nextErrors.customer = 'Select or enter a customer.';
    if (!form.customer.email) nextErrors.email = 'Customer email is required.';
    if (!form.items.length) nextErrors.items = 'Add at least one product.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    setSaving(true);
    const payload = { ...form, amounts: { ...form.amounts, ...totals, total: totals.total }, currency: settings.currency, status: form.status || 'pending', createdAt: form.createdAt || new Date().toISOString(), history: form.history || [] };
    const result = editing ? await updateOrder(id, payload) : await createOrder(payload);
    setSaving(false);
    if (result) { setDirty(false); setMessage('Order saved.'); window.setTimeout(() => navigate(`/ecommerce/orders/${result.id}`), 500); }
  };
  const cancel = () => {
    if (dirty && !window.confirm('Discard unsaved changes?')) return;
    navigate(editing ? `/ecommerce/orders/${id}` : '/ecommerce/orders');
  };

  if (loading) return <Card><div className="tw-h-32 tw-animate-pulse tw-rounded tw-bg-page" /></Card>;
  return <form onSubmit={submit} className="tw-flex tw-flex-col tw-gap-5">
    <header className="tw-flex tw-flex-wrap tw-items-center tw-justify-between tw-gap-3"><div><Link to={editing ? `/ecommerce/orders/${id}` : '/ecommerce/orders'} className="link-brand">← Orders</Link><h1 className="tw-mt-2 tw-text-2xl tw-font-semibold">{editing ? `Edit ${form.number}` : 'Create order'}</h1></div><div className="tw-flex tw-gap-2"><Button variant="brandOutline" onClick={cancel}>Cancel</Button><Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save order'}</Button></div></header>
    {message && <div role="status" aria-live="polite" className="tw-rounded-lg tw-bg-[var(--c-success-bg)] tw-p-3 tw-text-[var(--c-success-ink)]">{message}</div>}
    <div className="tw-grid tw-items-start tw-gap-5 lg:tw-grid-cols-[minmax(0,1.5fr)_minmax(280px,1fr)]">
      <div className="tw-flex tw-flex-col tw-gap-5">
        <Card title="Customer"><Form.Group><Form.Label htmlFor="customer-search">Search customer</Form.Label><Form.Control id="customer-search" value={customerQuery || form.customer.name} onChange={(event) => { setCustomerQuery(event.target.value); setField('customer', { ...form.customer, name: event.target.value }); }} placeholder="Name, email or phone" />{customerQuery && <div className="tw-mt-1 tw-rounded tw-border tw-border-solid tw-border-field tw-bg-card">{matchingCustomers.slice(0, 5).map((customer) => <button type="button" key={customer.id} onClick={() => setCustomer(customer)} className="tw-block tw-w-full tw-border-0 tw-border-b tw-border-solid tw-border-hair tw-bg-transparent tw-p-3 tw-text-left tw-text-ink">{customer.name} · {customer.email}</button>)}</div>}</Form.Group><div className="tw-mt-3 tw-grid tw-gap-3 sm:tw-grid-cols-2"><Form.Group><Form.Label>Email</Form.Label><Form.Control type="email" value={form.customer.email} onChange={(event) => setField('customer', { ...form.customer, email: event.target.value })} isInvalid={Boolean(errors.email)} /><Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback></Form.Group><Form.Group><Form.Label>Phone</Form.Label><Form.Control value={form.customer.phone} onChange={(event) => setField('customer', { ...form.customer, phone: event.target.value })} /></Form.Group></div>{errors.customer && <p className="tw-mt-2 tw-text-danger">{errors.customer}</p>}</Card>
        <Card title="Products"><div className="tw-flex tw-flex-wrap tw-gap-2"><Form.Select aria-label="Select product" value={productId} onChange={(event) => setProductId(event.target.value)}><option value="">Choose product</option>{products.map((product) => <option key={product.productId} value={product.productId}>{product.name} · {product.variant} ({formatMoney(product.unitPrice)})</option>)}</Form.Select><Button type="button" variant="brandOutline" onClick={addProduct}><Icon name="plus" size={16} /> Add product</Button></div>{errors.items && <p className="tw-mt-2 tw-text-danger">{errors.items}</p>}<div className="tw-mt-4 tw-space-y-2">{form.items.map((item) => <div key={item.productId} className="tw-grid tw-items-center tw-gap-2 tw-border-0 tw-border-t tw-border-solid tw-border-hair tw-py-3 sm:tw-grid-cols-[1fr_90px_100px_auto]"><div><strong>{item.name}</strong><span className="tw-block tw-text-sm tw-text-muted">{item.variant}</span></div><Form.Control aria-label={`Quantity for ${item.name}`} type="number" min="1" value={item.qty} onChange={(event) => updateQuantity(item, event.target.value)} /><span>{formatMoney(item.total)}</span><button type="button" aria-label={`Remove ${item.name}`} onClick={() => removeProduct(item.productId)} className="tw-border-0 tw-bg-transparent tw-text-danger">Remove</button></div>)}</div></Card>
        <Card title="Addresses"><AddressFields title="Shipping address" value={form.shippingAddress} onChange={(value) => setField('shippingAddress', value)} /><div className="tw-mt-5"><AddressFields title="Billing address" value={form.billingAddress} onChange={(value) => setField('billingAddress', value)} /></div></Card>
      </div>
      <div className="tw-flex tw-flex-col tw-gap-5"><Card title="Totals"><Total label="Subtotal" value={totals.subtotal} /><Total label="Discount" value={-Number(form.amounts.discount || 0)} /><Total label="Shipping" value={Number(form.amounts.shipping || 0)} /><Total label={settings.taxName} value={totals.tax} /><Total label="Grand total" value={totals.total} strong /><div className="tw-mt-4 tw-grid tw-gap-3"><Form.Group><Form.Label>Discount</Form.Label><Form.Control type="number" min="0" value={form.amounts.discount} onChange={(event) => setField('amounts', { ...form.amounts, discount: event.target.value })} /></Form.Group><Form.Group><Form.Label>Shipping charge</Form.Label><Form.Control type="number" min="0" value={form.amounts.shipping} onChange={(event) => setField('amounts', { ...form.amounts, shipping: event.target.value })} /></Form.Group></div></Card><Card title="Payment"><Form.Group><Form.Label>Payment method</Form.Label><Form.Select value={form.paymentMethod.code} onChange={(event) => setField('paymentMethod', paymentMethods.find((method) => method.code === event.target.value))}>{paymentMethods.map((method) => <option key={method.code} value={method.code}>{method.label}</option>)}</Form.Select></Form.Group><Form.Group className="tw-mt-3"><Form.Label>Payment status</Form.Label><Form.Select value={form.paymentStatus} onChange={(event) => setField('paymentStatus', event.target.value)}><option value="pending">Pending</option><option value="completed">Completed</option><option value="failed">Failed</option></Form.Select></Form.Group></Card><Card title="Notes"><Form.Label htmlFor="order-notes">Internal notes</Form.Label><Form.Control id="order-notes" as="textarea" rows={4} value={form.notes[0]?.text || ''} onChange={(event) => setField('notes', [{ id: form.notes[0]?.id || `note-${Date.now()}`, text: event.target.value, by: 'Owner', at: new Date().toISOString() }])} /></Card></div>
    </div>
  </form>;
}

function AddressFields({ title, value, onChange }) { return <div><h2 className="tw-mb-3 tw-text-base tw-font-semibold">{title}</h2><div className="tw-grid tw-gap-3 sm:tw-grid-cols-2">{['name', 'line1', 'city', 'region', 'postalCode', 'country'].map((key) => <Form.Group key={key}><Form.Label>{key}</Form.Label><Form.Control required value={value[key]} onChange={(event) => onChange({ ...value, [key]: event.target.value })} /></Form.Group>)}</div></div>; }
function Total({ label, value, strong }) { return <div className={`tw-flex tw-justify-between tw-py-1 ${strong ? 'tw-text-base tw-font-semibold' : 'tw-text-muted'}`}><span>{label}</span><span>{formatMoney(value)}</span></div>; }
