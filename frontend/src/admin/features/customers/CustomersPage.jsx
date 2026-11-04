import Card from '../../components/ui/Card';
import Pill from '../../components/ui/Pill';
import { LoadError, LoadingBlock } from '../../components/ui/AsyncState';
import { formatMoney } from '../../utils/formatMoney';
import { listCustomers } from '../../services/api/customers';
import { useResource } from '../../hooks/useResource';
import { useQueryState } from '../../hooks/useQueryState';
import { useSearchInput } from '../../hooks/useSearchInput';
import { customerInitials, customerStatusLabel, CUSTOMER_STATUS_LABELS } from './customerUtils';

const NO_CUSTOMERS = [];
const QUERY = { search: '', status: '' };

export default function CustomersPage() {
  const [query, setQuery] = useQueryState(QUERY);
  const { status } = query;
  const [searchInput, setSearchInput] = useSearchInput(query.search, (search) => setQuery({ search }, { replace: true }));
  const { data: result, error, loading, reload } = useResource(listCustomers, query);
  const customers = result?.data ?? NO_CUSTOMERS;

  return <div className="tw-flex tw-flex-col tw-gap-5">
    <header>
      <div className="tw-text-xs tw-uppercase tw-tracking-[0.12em]"><a href="/" className="link-brand">Dashboard</a><span className="tw-mx-2 tw-text-muted">/</span><span className="tw-text-muted">Ecommerce</span></div>
      <h1 className="tw-mt-2 tw-text-2xl tw-font-semibold">Customers</h1>
    </header>
    <Card>
      <div className="tw-flex tw-flex-wrap tw-gap-3">
        <label className="tw-flex-1"><span className="visually-hidden">Search customers</span><input className="form-control tw-h-11" value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Search name, email, or phone..." /></label>
        <select className="form-select tw-h-11 tw-max-w-[180px]" aria-label="Filter customer status" value={status} onChange={(event) => setQuery({ status: event.target.value })}>
          <option value="">All statuses</option>
          {Object.entries(CUSTOMER_STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </div>
      {error ? <div className="tw-mt-4"><LoadError message="Unable to load customers." onRetry={reload} /></div> : loading ? <LoadingBlock label="Loading customers" className="tw-mt-5 tw-h-40" /> : <div className="tw-overflow-x-auto">
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
