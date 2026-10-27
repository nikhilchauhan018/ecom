import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Pill from '../../components/ui/Pill';
import { formatMoney } from '../../utils/formatMoney';
import { listReturns } from '../../services/api/returns';
import { returnStatusLabel, returnStatusTone, RETURN_STATUS_LABELS } from './returnUtils';

export default function ReturnsPage() {
  const [params, setParams] = useSearchParams();
  const search = params.get('search') || '';
  const status = params.get('status') || '';
  const [searchInput, setSearchInput] = useState(search);
  const [returns, setReturns] = useState([]);
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
    listReturns({ search, status }).then((result) => {
      if (active) setReturns(result.data);
    }).catch((loadError) => {
      if (active) setError(loadError.message || 'Unable to load returns.');
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
      <h1 className="tw-mt-2 tw-text-2xl tw-font-semibold">Order Returns</h1>
    </header>
    <Card>
      <div className="tw-flex tw-flex-wrap tw-gap-3">
        <label className="tw-flex-1"><span className="visually-hidden">Search returns</span><input className="form-control tw-h-11" value={searchInput} onChange={(event) => { setLoading(true); setError(''); setSearchInput(event.target.value); }} placeholder="Search return, order, customer, or reason..." /></label>
        <select className="form-select tw-h-11 tw-max-w-[190px]" aria-label="Filter return status" value={status} onChange={(event) => setFilter('status', event.target.value)}>
          <option value="">All statuses</option>
          {Object.entries(RETURN_STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </div>
      {error && <div role="alert" className="tw-mt-4 tw-rounded-lg tw-bg-[var(--c-danger-bg)] tw-p-4 tw-text-[var(--c-danger-ink)]">{error}</div>}
      {loading ? <div role="status" aria-label="Loading returns" className="tw-mt-5 tw-h-40 tw-animate-pulse tw-rounded tw-bg-page" /> : <div className="tw-overflow-x-auto">
        <table className="admin-table tw-mt-5 tw-min-w-[1000px]">
          <caption className="visually-hidden">Order returns</caption>
          <thead><tr>{['Return', 'Order', 'Customer', 'Reason', 'Requested', 'Items', 'Amount', 'Status'].map((heading) => <th key={heading} scope="col" className="tw-text-xs tw-uppercase tw-text-muted">{heading}</th>)}</tr></thead>
          <tbody>{returns.map((returnItem) => <tr key={returnItem.id}>
            <td className="tw-font-medium">{returnItem.id}</td>
            <td>{returnItem.orderNumber}</td>
            <td><div>{returnItem.customer.name}</div><div className="tw-text-xs tw-text-muted">{returnItem.customer.email}</div></td>
            <td>{returnItem.reason}</td>
            <td>{new Date(returnItem.requestedAt).toLocaleDateString()}</td>
            <td>{returnItem.itemCount}</td>
            <td>{formatMoney(returnItem.amount)}</td>
            <td><Pill tone={returnStatusTone(returnItem.status)}>{returnStatusLabel(returnItem.status)}</Pill></td>
          </tr>)}</tbody>
        </table>
        {!returns.length && <p className="tw-py-8 tw-text-center tw-text-muted">No returns found.</p>}
      </div>}
    </Card>
  </div>;
}
