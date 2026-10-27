import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Pill from '../../components/ui/Pill';
import { formatMoney } from '../../utils/formatMoney';
import { listDiscounts } from '../../services/api/discounts';
import { DISCOUNT_STATUS_LABELS, DISCOUNT_TYPE_LABELS, discountStatusLabel, discountStatusTone } from './discountUtils';

function formatDiscountValue(discount) {
  return discount.type === 'percentage' ? `${discount.value}%` : formatMoney(discount.value);
}

export default function DiscountsPage() {
  const [params, setParams] = useSearchParams();
  const search = params.get('search') || '';
  const status = params.get('status') || '';
  const type = params.get('type') || '';
  const [searchInput, setSearchInput] = useState(search);
  const [discounts, setDiscounts] = useState([]);
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
    listDiscounts({ search, status, type }).then((result) => {
      if (active) setDiscounts(result.data);
    }).catch((loadError) => {
      if (active) setError(loadError.message || 'Unable to load discounts.');
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [search, status, type]);

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
      <h1 className="tw-mt-2 tw-text-2xl tw-font-semibold">Discounts</h1>
    </header>
    <Card>
      <div className="tw-flex tw-flex-wrap tw-gap-3">
        <label className="tw-flex-1"><span className="visually-hidden">Search discounts</span><input className="form-control tw-h-11" value={searchInput} onChange={(event) => { setLoading(true); setError(''); setSearchInput(event.target.value); }} placeholder="Search discount code or name..." /></label>
        <select className="form-select tw-h-11 tw-max-w-[180px]" aria-label="Filter discount status" value={status} onChange={(event) => setFilter('status', event.target.value)}>
          <option value="">All statuses</option>
          {Object.entries(DISCOUNT_STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
        <select className="form-select tw-h-11 tw-max-w-[180px]" aria-label="Filter discount type" value={type} onChange={(event) => setFilter('type', event.target.value)}>
          <option value="">All types</option>
          {Object.entries(DISCOUNT_TYPE_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </div>
      {error && <div role="alert" className="tw-mt-4 tw-rounded-lg tw-bg-[var(--c-danger-bg)] tw-p-4 tw-text-[var(--c-danger-ink)]">{error}</div>}
      {loading ? <div role="status" aria-label="Loading discounts" className="tw-mt-5 tw-h-40 tw-animate-pulse tw-rounded tw-bg-page" /> : <div className="tw-overflow-x-auto">
        <table className="admin-table tw-mt-5 tw-min-w-[1000px]">
          <caption className="visually-hidden">Discounts</caption>
          <thead><tr>{['Code', 'Name', 'Type', 'Value', 'Usage', 'Start date', 'End date', 'Status'].map((heading) => <th key={heading} scope="col" className="tw-text-xs tw-uppercase tw-text-muted">{heading}</th>)}</tr></thead>
          <tbody>{discounts.map((discount) => <tr key={discount.id}>
            <td className="tw-font-medium">{discount.code}</td>
            <td>{discount.name}</td>
            <td>{DISCOUNT_TYPE_LABELS[discount.type]}</td>
            <td>{formatDiscountValue(discount)}</td>
            <td>{discount.usageCount} / {discount.usageLimit}</td>
            <td>{discount.startsAt}</td>
            <td>{discount.endsAt}</td>
            <td><Pill tone={discountStatusTone(discount.status)}>{discountStatusLabel(discount.status)}</Pill></td>
          </tr>)}</tbody>
        </table>
        {!discounts.length && <p className="tw-py-8 tw-text-center tw-text-muted">No discounts found.</p>}
      </div>}
    </Card>
  </div>;
}
