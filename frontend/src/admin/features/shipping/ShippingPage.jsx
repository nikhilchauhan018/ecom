import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Pill from '../../components/ui/Pill';
import { formatMoney } from '../../utils/formatMoney';
import { getShippingMetadata, listShippingMethods } from '../../services/api/shipping';
import { shippingStatusLabel, shippingStatusTone, SHIPPING_STATUS_LABELS } from './shippingUtils';

export default function ShippingPage() {
  const [params, setParams] = useSearchParams();
  const search = params.get('search') || '';
  const zoneId = params.get('zoneId') || '';
  const status = params.get('status') || '';
  const [searchInput, setSearchInput] = useState(search);
  const [methods, setMethods] = useState([]);
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [metadataError, setMetadataError] = useState('');

  useEffect(() => {
    getShippingMetadata().then(({ zones: availableZones }) => setZones(availableZones))
      .catch((loadError) => setMetadataError(loadError.message || 'Unable to load shipping zones.'));
  }, []);

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
    listShippingMethods({ search, zoneId, status }).then((result) => {
      if (active) setMethods(result.data);
    }).catch((loadError) => {
      if (active) setError(loadError.message || 'Unable to load shipping methods.');
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [search, status, zoneId]);

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
      <h1 className="tw-mt-2 tw-text-2xl tw-font-semibold">Shipping</h1>
    </header>
    <Card>
      <div className="tw-flex tw-flex-wrap tw-gap-3">
        <label className="tw-min-w-0 tw-flex-1"><span className="visually-hidden">Search shipping methods</span><input className="form-control tw-h-11" value={searchInput} onChange={(event) => { setLoading(true); setError(''); setSearchInput(event.target.value); }} placeholder="Search method or carrier..." /></label>
        <select className="form-select tw-h-11 tw-w-full sm:tw-max-w-[220px]" aria-label="Filter shipping zone" value={zoneId} onChange={(event) => setFilter('zoneId', event.target.value)}>
          <option value="">All zones</option>
          {zones.map((zone) => <option key={zone.id} value={zone.id}>{zone.name}</option>)}
        </select>
        <select className="form-select tw-h-11 tw-w-full sm:tw-max-w-[170px]" aria-label="Filter shipping status" value={status} onChange={(event) => setFilter('status', event.target.value)}>
          <option value="">All statuses</option>
          {Object.entries(SHIPPING_STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </div>
      {metadataError && <p role="status" className="tw-mt-3 tw-text-muted">{metadataError}</p>}
      {error && <div role="alert" className="tw-mt-4 tw-rounded-lg tw-bg-[var(--c-danger-bg)] tw-p-4 tw-text-[var(--c-danger-ink)]">{error}</div>}
      {loading ? <div role="status" aria-label="Loading shipping methods" className="tw-mt-5 tw-h-40 tw-animate-pulse tw-rounded tw-bg-page" /> : <div className="tw-overflow-x-auto">
        <table className="admin-table tw-mt-5 tw-min-w-[900px]">
          <caption className="visually-hidden">Shipping methods</caption>
          <thead><tr>{['Method', 'Zone', 'Carrier', 'Delivery time', 'Price', 'Status'].map((heading) => <th key={heading} scope="col" className="tw-text-xs tw-uppercase tw-text-muted">{heading}</th>)}</tr></thead>
          <tbody>{methods.map((method) => <tr key={method.id}>
            <td className="tw-font-medium">{method.name}</td>
            <td>{method.zoneName}</td>
            <td>{method.carrier}</td>
            <td>{method.deliveryTime}</td>
            <td>{method.price === 0 ? 'Free' : formatMoney(method.price)}</td>
            <td><Pill tone={shippingStatusTone(method.status)}>{shippingStatusLabel(method.status)}</Pill></td>
          </tr>)}</tbody>
        </table>
        {!methods.length && <p className="tw-py-8 tw-text-center tw-text-muted">No shipping methods found.</p>}
      </div>}
    </Card>
  </div>;
}
