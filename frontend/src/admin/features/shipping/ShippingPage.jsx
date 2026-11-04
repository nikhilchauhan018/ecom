import Card from '../../components/ui/Card';
import Pill from '../../components/ui/Pill';
import { LoadError, LoadingBlock } from '../../components/ui/AsyncState';
import { formatMoney } from '../../utils/formatMoney';
import { getShippingMetadata, listShippingMethods } from '../../services/api/shipping';
import { useResource } from '../../hooks/useResource';
import { useQueryState } from '../../hooks/useQueryState';
import { useSearchInput } from '../../hooks/useSearchInput';
import { shippingStatusLabel, shippingStatusTone, SHIPPING_STATUS_LABELS } from './shippingUtils';

const NO_METHODS = [];
const NO_ZONES = [];
const NO_PARAMS = {};
const QUERY = { search: '', zoneId: '', status: '' };

export default function ShippingPage() {
  const [query, setQuery] = useQueryState(QUERY);
  const { zoneId, status } = query;
  const [searchInput, setSearchInput] = useSearchInput(query.search, (search) => setQuery({ search }, { replace: true }));
  const { data: result, error, loading, reload } = useResource(listShippingMethods, query);
  const { data: metadata, error: metadataLoadError } = useResource(getShippingMetadata, NO_PARAMS);
  const methods = result?.data ?? NO_METHODS;
  const zones = metadata?.zones ?? NO_ZONES;
  const metadataError = metadataLoadError ? 'Unable to load shipping zones.' : '';

  return <div className="tw-flex tw-flex-col tw-gap-5">
    <header>
      <div className="tw-text-xs tw-uppercase tw-tracking-[0.12em]"><a href="/" className="link-brand">Dashboard</a><span className="tw-mx-2 tw-text-muted">/</span><span className="tw-text-muted">Ecommerce</span></div>
      <h1 className="tw-mt-2 tw-text-2xl tw-font-semibold">Shipping</h1>
    </header>
    <Card>
      <div className="tw-flex tw-flex-wrap tw-gap-3">
        <label className="tw-min-w-0 tw-flex-1"><span className="visually-hidden">Search shipping methods</span><input className="form-control tw-h-11" value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Search method or carrier..." /></label>
        <select className="form-select tw-h-11 tw-w-full sm:tw-max-w-[220px]" aria-label="Filter shipping zone" value={zoneId} onChange={(event) => setQuery({ zoneId: event.target.value })}>
          <option value="">All zones</option>
          {zones.map((zone) => <option key={zone.id} value={zone.id}>{zone.name}</option>)}
        </select>
        <select className="form-select tw-h-11 tw-w-full sm:tw-max-w-[170px]" aria-label="Filter shipping status" value={status} onChange={(event) => setQuery({ status: event.target.value })}>
          <option value="">All statuses</option>
          {Object.entries(SHIPPING_STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </div>
      {metadataError && <p role="status" className="tw-mt-3 tw-text-muted">{metadataError}</p>}
      {error ? <div className="tw-mt-4"><LoadError message="Unable to load shipping methods." onRetry={reload} /></div> : loading ? <LoadingBlock label="Loading shipping methods" className="tw-mt-5 tw-h-40" /> : <div className="tw-overflow-x-auto">
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
