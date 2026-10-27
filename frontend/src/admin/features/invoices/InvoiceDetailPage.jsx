import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Icon from '../../components/ui/Icon';
import { formatMoney } from '../../utils/formatMoney';
import { getStoreSettings } from '../../config/settings';
import { getInvoice } from '../../services/api/invoices';
import { invoiceAddressLines, invoiceFileName, invoiceStatusLabel, invoiceStatusTone } from './invoiceUtils';
import Pill from '../../components/ui/Pill';

const settings = getStoreSettings();

function downloadInvoice(invoice) {
  const rows = invoice.items.map((item) => `${item.name} (${item.variant}) - ${item.qty} x ${formatMoney(item.unitPrice)} = ${formatMoney(item.total)}`).join('\n');
  const content = `Invoice ${invoice.id}\nOrder: ${invoice.orderNumber}\nCustomer: ${invoice.customer.name}\n${invoice.customer.email}\n\n${rows}\n\nSubtotal: ${formatMoney(invoice.amounts.subtotal)}\nDiscount: ${formatMoney(invoice.amounts.discount)}\nShipping: ${formatMoney(invoice.amounts.shipping)}\nTax: ${formatMoney(invoice.amounts.tax)}\nTotal: ${formatMoney(invoice.amounts.total)}`;
  const url = URL.createObjectURL(new Blob([content], { type: 'text/plain;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = invoiceFileName(invoice).replace(/\.pdf$/, '.txt');
  link.click();
  URL.revokeObjectURL(url);
}

function Address({ title, address }) {
  return <div><h2 className="tw-text-sm tw-font-semibold tw-uppercase tw-tracking-wide tw-text-muted">{title}</h2><div className="tw-mt-2 tw-space-y-1">{invoiceAddressLines(address).map((line) => <p key={line}>{line}</p>)}</div></div>;
}

export default function InvoiceDetailPage() {
  const { id } = useParams();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    getInvoice(id).then((result) => {
      if (!active) return;
      setInvoice(result);
      if (!result) setError('Invoice not found.');
    }).catch((loadError) => {
      if (active) setError(loadError.message || 'Unable to load invoice.');
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [id]);

  if (loading) return <Card><div role="status" aria-label="Loading invoice" className="tw-h-48 tw-animate-pulse tw-rounded tw-bg-page" /></Card>;
  if (error || !invoice) return <Card><p role="alert" className="tw-text-[var(--c-danger-ink)]">{error || 'Invoice not found.'}</p><Link className="link-brand" to="/ecommerce/invoices">Back to invoices</Link></Card>;

  return <div className="tw-flex tw-flex-col tw-gap-5">
    <header className="tw-flex tw-flex-wrap tw-items-start tw-justify-between tw-gap-3 print-hidden">
      <div><div className="tw-flex tw-flex-wrap tw-items-center tw-gap-2 tw-text-xs tw-uppercase tw-tracking-[0.12em]"><Link to="/ecommerce/invoices" className="link-brand">Invoices</Link><span className="tw-text-muted">/</span><span className="tw-text-muted">Edit {invoice.id}</span></div><h1 className="tw-mt-2 tw-text-2xl tw-font-semibold">{invoice.id}</h1></div>
      <div className="tw-flex tw-flex-wrap tw-gap-2"><Button variant="brandOutline" onClick={() => window.print()}><Icon name="download" size={16} /> Print invoice</Button><Button variant="brandOutline" onClick={() => downloadInvoice(invoice)}><Icon name="download" size={16} /> Download invoice</Button></div>
    </header>
    <Card className="tw-p-6 sm:tw-p-10">
      <div className="tw-flex tw-flex-wrap tw-justify-between tw-gap-8">
        <div><p className="tw-text-sm tw-font-semibold tw-uppercase tw-tracking-[0.14em] tw-text-muted">Invoice code</p><p className="tw-mt-2 tw-text-xl tw-font-semibold">{invoice.id}</p><p className="tw-mt-1 tw-text-muted">Order {invoice.orderNumber}</p></div>
        <div className="tw-text-left sm:tw-text-right"><h2 className="tw-text-3xl tw-font-semibold">Invoice</h2><p className="tw-mt-3 tw-font-medium">{invoice.customer.name}</p><a className="link-brand tw-block" href={`mailto:${invoice.customer.email}`}>{invoice.customer.email}</a><p>{invoice.customer.phone}</p></div>
      </div>
      <div className="tw-my-8 tw-border-0 tw-border-t tw-border-solid tw-border-hair" />
      <div className="tw-grid tw-gap-8 md:tw-grid-cols-3">
        <Address title="Billing address" address={invoice.billingAddress} />
        <Address title="Shipping address" address={invoice.shippingAddress} />
        <div><h2 className="tw-text-sm tw-font-semibold tw-uppercase tw-tracking-wide tw-text-muted">Invoice details</h2><p className="tw-mt-2">Issue date: {new Date(invoice.issueDate).toLocaleDateString(settings.locale)}</p><p className="tw-mt-1">Payment: {invoice.paymentMethod.label}</p><div className="tw-mt-2"><Pill tone={invoiceStatusTone(invoice.status)}>{invoiceStatusLabel(invoice.status)}</Pill></div></div>
      </div>
      <div className="tw-mt-10 tw-overflow-x-auto"><table className="admin-table tw-min-w-[700px]"><caption className="visually-hidden">Invoice line items</caption><thead><tr>{['#', 'Product', 'Amount', 'Quantity', 'Total'].map((heading) => <th key={heading} scope="col" className="tw-text-xs tw-uppercase tw-text-muted">{heading}</th>)}</tr></thead><tbody>{invoice.items.map((item, index) => <tr key={item.id}><td>{index + 1}</td><td><div className="tw-font-medium">{item.name}</div><div className="tw-text-xs tw-text-muted">{item.variant} · {item.sku}</div></td><td>{formatMoney(item.unitPrice)}</td><td>{item.qty}</td><td>{formatMoney(item.total)}</td></tr>)}</tbody></table></div>
      <div className="tw-mt-6 tw-flex tw-justify-end"><div className="tw-w-full tw-max-w-sm tw-space-y-3"><div className="tw-flex tw-justify-between"><span className="tw-text-muted">Subtotal</span><span>{formatMoney(invoice.amounts.subtotal)}</span></div><div className="tw-flex tw-justify-between"><span className="tw-text-muted">Discount</span><span>- {formatMoney(invoice.amounts.discount)}</span></div><div className="tw-flex tw-justify-between"><span className="tw-text-muted">Shipping</span><span>{formatMoney(invoice.amounts.shipping)}</span></div><div className="tw-flex tw-justify-between"><span className="tw-text-muted">{settings.taxName}</span><span>{formatMoney(invoice.amounts.tax)}</span></div><div className="tw-flex tw-justify-between tw-border-0 tw-border-t tw-border-solid tw-border-hair tw-pt-3 tw-text-lg tw-font-semibold"><span>Total</span><span>{formatMoney(invoice.amounts.total)}</span></div></div></div>
    </Card>
  </div>;
}
