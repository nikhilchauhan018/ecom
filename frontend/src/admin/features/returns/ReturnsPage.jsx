import Card from '../../components/ui/Card';
import Pill from '../../components/ui/Pill';
import { LoadError, LoadingBlock } from '../../components/ui/AsyncState';
import { formatMoney } from '../../utils/formatMoney';
import { listReturns } from '../../services/api/returns';
import { useResource } from '../../hooks/useResource';
import { useQueryState } from '../../hooks/useQueryState';
import { useSearchInput } from '../../hooks/useSearchInput';
import { returnStatusLabel, returnStatusTone, RETURN_STATUS_LABELS } from './returnUtils';

const NO_RETURNS = [];
const QUERY = { search: '', status: '' };

export default function ReturnsPage() {
  const [query, setQuery] = useQueryState(QUERY);
  const { status } = query;
  const [searchInput, setSearchInput] = useSearchInput(query.search, (search) => setQuery({ search }, { replace: true }));
  const { data: result, error, loading, reload } = useResource(listReturns, query);
  const returns = result?.data ?? NO_RETURNS;

  return <div className="tw-flex tw-flex-col tw-gap-5">
    <header>
      <div className="tw-text-xs tw-uppercase tw-tracking-[0.12em]"><a href="/" className="link-brand">Dashboard</a><span className="tw-mx-2 tw-text-muted">/</span><span className="tw-text-muted">Ecommerce</span></div>
      <h1 className="tw-mt-2 tw-text-2xl tw-font-semibold">Order Returns</h1>
    </header>
    <Card>
      <div className="tw-flex tw-flex-wrap tw-gap-3">
        <label className="tw-flex-1"><span className="visually-hidden">Search returns</span><input className="form-control tw-h-11" value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Search return, order, customer, or reason..." /></label>
        <select className="form-select tw-h-11 tw-max-w-[190px]" aria-label="Filter return status" value={status} onChange={(event) => setQuery({ status: event.target.value })}>
          <option value="">All statuses</option>
          {Object.entries(RETURN_STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </div>
      {error ? <div className="tw-mt-4"><LoadError message="Unable to load returns." onRetry={reload} /></div> : loading ? <LoadingBlock label="Loading returns" className="tw-mt-5 tw-h-40" /> : <div className="tw-overflow-x-auto">
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
