import Card from '../../components/ui/Card';
import Pill from '../../components/ui/Pill';
import { LoadError, LoadingBlock } from '../../components/ui/AsyncState';
import { formatMoney } from '../../utils/formatMoney';
import { listDiscounts } from '../../services/api/discounts';
import { useResource } from '../../hooks/useResource';
import { useQueryState } from '../../hooks/useQueryState';
import { useSearchInput } from '../../hooks/useSearchInput';
import { DISCOUNT_STATUS_LABELS, DISCOUNT_TYPE_LABELS, discountStatusLabel, discountStatusTone } from './discountUtils';

const NO_DISCOUNTS = [];
const QUERY = { search: '', status: '', type: '' };

function formatDiscountValue(discount) {
  return discount.type === 'percentage' ? `${discount.value}%` : formatMoney(discount.value);
}

export default function DiscountsPage() {
  const [query, setQuery] = useQueryState(QUERY);
  const { status, type } = query;
  const [searchInput, setSearchInput] = useSearchInput(query.search, (search) => setQuery({ search }, { replace: true }));
  const { data: result, error, loading, reload } = useResource(listDiscounts, query);
  const discounts = result?.data ?? NO_DISCOUNTS;

  return <div className="tw-flex tw-flex-col tw-gap-5">
    <header>
      <div className="tw-text-xs tw-uppercase tw-tracking-[0.12em]"><a href="/" className="link-brand">Dashboard</a><span className="tw-mx-2 tw-text-muted">/</span><span className="tw-text-muted">Ecommerce</span></div>
      <h1 className="tw-mt-2 tw-text-2xl tw-font-semibold">Discounts</h1>
    </header>
    <Card>
      <div className="tw-flex tw-flex-wrap tw-gap-3">
        <label className="tw-flex-1"><span className="visually-hidden">Search discounts</span><input className="form-control tw-h-11" value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Search discount code or name..." /></label>
        <select className="form-select tw-h-11 tw-max-w-[180px]" aria-label="Filter discount status" value={status} onChange={(event) => setQuery({ status: event.target.value })}>
          <option value="">All statuses</option>
          {Object.entries(DISCOUNT_STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
        <select className="form-select tw-h-11 tw-max-w-[180px]" aria-label="Filter discount type" value={type} onChange={(event) => setQuery({ type: event.target.value })}>
          <option value="">All types</option>
          {Object.entries(DISCOUNT_TYPE_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </div>
      {error ? <div className="tw-mt-4"><LoadError message="Unable to load discounts." onRetry={reload} /></div> : loading ? <LoadingBlock label="Loading discounts" className="tw-mt-5 tw-h-40" /> : <div className="tw-overflow-x-auto">
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
