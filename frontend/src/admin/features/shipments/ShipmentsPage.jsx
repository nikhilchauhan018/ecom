import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Pill from '../../components/ui/Pill';
import { listShipments } from '../../services/api/shipments';
import { safeHttpUrl } from '../../utils/safeUrl';
import { shipmentStatusLabel, shipmentStatusTone, SHIPMENT_STATUS_LABELS } from './shipmentUtils';

export default function ShipmentsPage() {
  const [params, setParams] = useSearchParams();
  const search = params.get('search') || '';
  const status = params.get('status') || '';
  const [searchInput, setSearchInput] = useState(search);
  const [shipments, setShipments] = useState([]);
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
    listShipments({ search, status }).then((result) => {
      if (active) setShipments(result.data);
    }).catch((loadError) => {
      if (active) setError(loadError.message || 'Unable to load shipments.');
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
      <h1 className="tw-mt-2 tw-text-2xl tw-font-semibold">Shipments</h1>
    </header>
    <Card>
      <div className="tw-flex tw-flex-wrap tw-gap-3">
        <label className="tw-flex-1"><span className="visually-hidden">Search shipments</span><input className="form-control tw-h-11" value={searchInput} onChange={(event) => { setLoading(true); setError(''); setSearchInput(event.target.value); }} placeholder="Search shipment, order, tracking..." /></label>
        <select className="form-select tw-h-11 tw-max-w-[220px]" aria-label="Filter shipment status" value={status} onChange={(event) => setFilter('status', event.target.value)}>
          <option value="">All statuses</option>
          {Object.entries(SHIPMENT_STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </div>
      {error && <div role="alert" className="tw-mt-4 tw-rounded-lg tw-bg-[var(--c-danger-bg)] tw-p-4 tw-text-[var(--c-danger-ink)]">{error}</div>}
      {loading ? <div role="status" aria-label="Loading shipments" className="tw-mt-5 tw-h-40 tw-animate-pulse tw-rounded tw-bg-page" /> : <div className="tw-overflow-x-auto">
        <table className="admin-table tw-mt-5 tw-min-w-[1000px]">
          <caption className="visually-hidden">Shipments</caption>
          <thead><tr>{['Shipment', 'Order', 'Customer', 'Courier', 'Tracking', 'Items', 'Status'].map((heading) => <th key={heading} scope="col" className="tw-text-xs tw-uppercase tw-text-muted">{heading}</th>)}</tr></thead>
          <tbody>{shipments.map((shipment) => <tr key={shipment.id}>
            <td className="tw-font-medium">{shipment.id}<div className="tw-text-xs tw-text-muted">ETA {shipment.estimatedDate}</div></td>
            <td>{shipment.orderNumber}</td>
            <td><div>{shipment.customer.name}</div><div className="tw-text-xs tw-text-muted">{shipment.customer.email}</div></td>
            <td>{shipment.courier}</td>
            <td><a className="link-brand" href={safeHttpUrl(shipment.trackingUrl)} target="_blank" rel="noreferrer">{shipment.trackingNumber}</a></td>
            <td>{shipment.itemCount}</td>
            <td><Pill tone={shipmentStatusTone(shipment.status)}>{shipmentStatusLabel(shipment.status)}</Pill></td>
          </tr>)}</tbody>
        </table>
        {!shipments.length && <p className="tw-py-8 tw-text-center tw-text-muted">No shipments found.</p>}
      </div>}
    </Card>
  </div>;
}
