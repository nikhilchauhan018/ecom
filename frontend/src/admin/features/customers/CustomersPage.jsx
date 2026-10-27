import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Pill from '../../components/ui/Pill';
import { formatMoney } from '../../utils/formatMoney';
import { listCustomers } from '../../services/api/customers';
import { customerInitials, customerStatusLabel, CUSTOMER_STATUS_LABELS } from './customerUtils';

export default function CustomersPage() {
  const [params, setParams] = useSearchParams();
  const search = params.get('search') || '';
  const status = params.get('status') || '';
  const [searchInput, setSearchInput] = useState(search);
  const [customers, setCustomers] = useState([]);
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
    listCustomers({ search, status }).then((result) => {
      if (active) setCustomers(result.data);
    }).catch((loadError) => {
      if (active) setError(loadError.message || 'Unable to load customers.');
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
    <header>
      <div className="tw-text-xs tw-uppercase tw-tracking-[0.12em]"><a href="/" className="link-brand">Dashboard</a><span className="tw-mx-2 tw-text-muted">/</span><span className="tw-text-muted">Ecommerce</span></div>
      <h1 className="tw-mt-2 tw-text-2xl tw-font-semibold">Customers</h1>
    </header>
    <Card>
      <div className="tw-flex tw-flex-wrap tw-gap-3">
        <label className="tw-flex-1"><span className="visually-hidden">Search customers</span><input className="form-control tw-h-11" value={searchInput} onChange={(event) => { setLoading(true); setError(''); setSearchInput(event.target.value); }} placeholder="Search name, email, or phone..." /></label>
        <select className="form-select tw-h-11 tw-max-w-[180px]" aria-label="Filter customer status" value={status} onChange={(event) => setFilter('status', event.target.value)}>
          <option value="">All statuses</option>
          {Object.entries(CUSTOMER_STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </div>
      {error && <div role="alert" className="tw-mt-4 tw-rounded-lg tw-bg-[var(--c-danger-bg)] tw-p-4 tw-text-[var(--c-danger-ink)]">{error}</div>}
      {loading ? <div role="status" aria-label="Loading customers" className="tw-mt-5 tw-h-40 tw-animate-pulse tw-rounded tw-bg-page" /> : <div className="tw-overflow-x-auto">
        <table className="admin-table tw-mt-5 tw-min-w-[1000px]">
          <caption className="visually-hidden">Customers</caption>
          <thead><tr>{['Customer', 'Phone', 'Orders', 'Total spent', 'Last order', 'Status'].map((heading) => <th key={heading} scope="col" className="tw-text-xs tw-uppercase tw-text-muted">{heading}</th>)}</tr></thead>
          <tbody>{customers.map((customer) => <tr key={customer.id}>
            <td><div className="tw-flex tw-items-center tw-gap-3"><span aria-hidden="true" className="tw-flex tw-h-9 tw-w-9 tw-items-center tw-justify-center tw-rounded-full tw-bg-[var(--c-brand)] tw-text-xs tw-font-semibold tw-text-[var(--c-brand-contrast)]">{customerInitials(customer.name)}</span><div><div className="tw-font-medium">{customer.name}</div><div className="tw-text-xs tw-text-muted">{customer.email}</div></div></div></td>
            <td>{customer.phone}</td>
            <td>{customer.ordersCount}</td>
            <td>{formatMoney(customer.totalSpent)}</td>
            <td>{new Date(customer.lastOrderAt).toLocaleDateString()}</td>
            <td><Pill tone={customer.status === 'active' ? 'success' : 'neutral'}>{customerStatusLabel(customer.status)}</Pill></td>
          </tr>)}</tbody>
        </table>
        {!customers.length && <p className="tw-py-8 tw-text-center tw-text-muted">No customers found.</p>}
      </div>}
    </Card>
  </div>;
}
