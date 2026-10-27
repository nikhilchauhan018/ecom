import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Pill from '../../components/ui/Pill';
import Button from '../../components/ui/Button';
import { formatMoney } from '../../utils/formatMoney';
import { listInvoices } from '../../services/api/invoices';
import { invoiceStatusLabel, invoiceStatusTone, INVOICE_STATUS_LABELS } from './invoiceUtils';
import Icon from '../../components/ui/Icon';

export default function InvoicesPage() {
  const [params, setParams] = useSearchParams();
  const search = params.get('search') || '';
  const status = params.get('status') || '';
  const [searchInput, setSearchInput] = useState(search);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setParams((current) => {
        if (searchInput.trim()) current.set('search', searchInput.trim());
        else current.delete('search');
        return current;
      });
    }, 250);
    return () => clearTimeout(timer);
  }, [searchInput, setParams]);

  useEffect(() => {
    let active = true;
    listInvoices({ search, status }).then((result) => {
      if (active) setInvoices(result.data);
    }).catch((loadError) => {
      if (active) setError(loadError.message || 'Unable to load invoices.');
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [search, status]);

  const setFilter = (key, value) => {
    setLoading(true);
    setError('');
    setParams((current) => {
      if (value) current.set(key, value);
      else current.delete(key);
      return current;
    });
  };

  return <div className="tw-flex tw-flex-col tw-gap-5">
    <header className="tw-flex tw-flex-wrap tw-items-end tw-justify-between tw-gap-3">
      <div><div className="tw-text-xs tw-uppercase tw-tracking-[0.12em]"><a href="/" className="link-brand">Dashboard</a><span className="tw-mx-2 tw-text-muted">/</span><span className="tw-text-muted">Ecommerce</span></div><h1 className="tw-mt-2 tw-text-2xl tw-font-semibold">Invoices</h1></div>
      <Button variant="brandOutline" className="print-hidden" onClick={() => window.print()}>Print list</Button>
    </header>
    <Card>
      <div className="tw-flex tw-flex-wrap tw-gap-3 print-hidden">
        <label className="tw-flex-1"><span className="visually-hidden">Search invoices</span><input className="form-control tw-h-11" value={searchInput} onChange={(event) => { setLoading(true); setError(''); setSearchInput(event.target.value); }} placeholder="Search invoice, order, or customer..." /></label>
        <select className="form-select tw-h-11 tw-max-w-[180px]" aria-label="Filter invoice status" value={status} onChange={(event) => setFilter('status', event.target.value)}>
          <option value="">All statuses</option>
          {Object.entries(INVOICE_STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </div>
      {error && <div role="alert" className="tw-mt-4 tw-rounded-lg tw-bg-[var(--c-danger-bg)] tw-p-4 tw-text-[var(--c-danger-ink)]">{error}</div>}
      {loading ? <div role="status" aria-label="Loading invoices" className="tw-mt-5 tw-h-40 tw-animate-pulse tw-rounded tw-bg-page" /> : <div className="tw-overflow-x-auto">
        <table className="admin-table tw-mt-5 tw-min-w-[950px]">
          <caption className="visually-hidden">Invoices</caption>
          <thead><tr>{['Invoice', 'Order', 'Customer', 'Issued', 'Items', 'Amount', 'Status', 'Operations'].map((heading) => <th key={heading} scope="col" className="tw-text-xs tw-uppercase tw-text-muted">{heading}</th>)}</tr></thead>
          <tbody>{invoices.map((invoice) => <tr key={invoice.id}>
            <td className="tw-font-medium">{invoice.id}</td>
            <td>{invoice.orderNumber}</td>
            <td><div>{invoice.customer.name}</div><div className="tw-text-xs tw-text-muted">{invoice.customer.email}</div></td>
            <td>{new Date(invoice.issueDate).toLocaleDateString()}</td>
            <td>{invoice.itemCount}</td>
            <td>{formatMoney(invoice.amounts.total)}</td>
            <td><Pill tone={invoiceStatusTone(invoice.status)}>{invoiceStatusLabel(invoice.status)}</Pill></td>
            <td><Link aria-label={`Edit invoice ${invoice.id}`} title={`Edit invoice ${invoice.id}`} to={`/ecommerce/invoices/${invoice.id}/edit`} className="tw-inline-flex tw-h-9 tw-w-9 tw-items-center tw-justify-center tw-rounded-md tw-bg-[var(--c-brand)] tw-text-[var(--c-brand-contrast)] hover:tw-opacity-90"><Icon name="edit" size={17} /></Link></td>
          </tr>)}</tbody>
        </table>
        {!invoices.length && <p className="tw-py-8 tw-text-center tw-text-muted">No invoices found.</p>}
      </div>}
    </Card>
  </div>;
}
