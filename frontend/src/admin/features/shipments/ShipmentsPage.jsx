import Card from '../../components/ui/Card';
import Pill from '../../components/ui/Pill';
import { LoadError, LoadingBlock } from '../../components/ui/AsyncState';
import { listShipments } from '../../services/api/shipments';
import { useResource } from '../../hooks/useResource';
import { useQueryState } from '../../hooks/useQueryState';
import { useSearchInput } from '../../hooks/useSearchInput';
import { safeHttpUrl } from '../../utils/safeUrl';
import { shipmentStatusLabel, shipmentStatusTone, SHIPMENT_STATUS_LABELS } from './shipmentUtils';

const NO_SHIPMENTS = [];
const QUERY = { search: '', status: '' };

export default function ShipmentsPage() {
  const [query, setQuery] = useQueryState(QUERY);
  const { status } = query;
  const [searchInput, setSearchInput] = useSearchInput(query.search, (search) => setQuery({ search }, { replace: true }));
  const { data: result, error, loading, reload } = useResource(listShipments, query);
  const shipments = result?.data ?? NO_SHIPMENTS;

  return <div className="tw-flex tw-flex-col tw-gap-5">
    <header>
      <div className="tw-text-xs tw-uppercase tw-tracking-[0.12em]"><a href="/" className="link-brand">Dashboard</a><span className="tw-mx-2 tw-text-muted">/</span><span className="tw-text-muted">Ecommerce</span></div>
      <h1 className="tw-mt-2 tw-text-2xl tw-font-semibold">Shipments</h1>
    </header>
    <Card>
      <div className="tw-flex tw-flex-wrap tw-gap-3">
        <label className="tw-flex-1"><span className="visually-hidden">Search shipments</span><input className="form-control tw-h-11" value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Search shipment, order, tracking..." /></label>
        <select className="form-select tw-h-11 tw-max-w-[220px]" aria-label="Filter shipment status" value={status} onChange={(event) => setQuery({ status: event.target.value })}>
          <option value="">All statuses</option>
          {Object.entries(SHIPMENT_STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </div>
      {error ? <div className="tw-mt-4"><LoadError message="Unable to load shipments." onRetry={reload} /></div> : loading ? <LoadingBlock label="Loading shipments" className="tw-mt-5 tw-h-40" /> : <div className="tw-overflow-x-auto">
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
