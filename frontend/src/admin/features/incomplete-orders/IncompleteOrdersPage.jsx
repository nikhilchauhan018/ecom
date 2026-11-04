import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Icon from '../../components/ui/Icon';
import Breadcrumb from '../../components/ui/Breadcrumb';
import Pagination from '../../components/ui/Pagination';
import { LoadError, LoadingBlock, Notice } from '../../components/ui/AsyncState';
import IncompleteOrdersToolbar from './components/IncompleteOrdersToolbar';
import IncompleteOrderFilters from './components/IncompleteOrderFilters';
import IncompleteOrdersTable from './components/IncompleteOrdersTable';
import { deleteIncompleteOrders, listIncompleteOrders } from '../../services/api/incompleteOrders';
import { incompleteOrderErrorSentence, incompleteOrdersToCsv, summarizeDeletion } from './incompleteOrderQuery';
import { loadOrdersPage as loadPageOrLast } from '../orders/orderQuery';
import { useResource } from '../../hooks/useResource';
import { useQueryState } from '../../hooks/useQueryState';
import { useSearchInput } from '../../hooks/useSearchInput';
import { useRowSelection } from '../../hooks/useRowSelection';
import { site } from '../../config/site';

const QUERY = { search: '', sort: 'id', order: 'desc', page: 1, pageSize: 10, dateFrom: '', dateTo: '', amountMin: '', amountMax: '' };
const FILTER_LABELS = { dateFrom: 'From', dateTo: 'To', amountMin: 'Min amount', amountMax: 'Max amount' };
const FILTER_KEYS = Object.keys(FILTER_LABELS);
const NO_RECORDS = [];
const EMPTY_META = { page: 1, pageSize: 10, total: 0, totalPages: 0 };
const STORE = { name: site.name, url: site.storeUrl };
// Module-level so the reference is stable: useResource refetches when the fetcher changes.
const fetchPage = (query) => loadPageOrLast(listIncompleteOrders, query);

export default function IncompleteOrdersPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useQueryState(QUERY);
  const { sort, order, pageSize } = query;
  const [searchInput, setSearchInput] = useSearchInput(query.search, (search) => setQuery({ search }, { replace: true }));
  const { data: result, error, loading, reload } = useResource(fetchPage, query);
  const records = result?.data ?? NO_RECORDS;
  const meta = result?.meta ?? EMPTY_META;
  const [selected, setSelected] = useRowSelection(result);
  const [showFilters, setShowFilters] = useState(false);
  const [notice, setNotice] = useState(null);
  const [acting, setActing] = useState(false);

  const filters = Object.fromEntries(FILTER_KEYS.map((key) => [key, query[key]]));
  const activeFilters = FILTER_KEYS.filter((key) => filters[key]);

  // The service can serve another page than the URL asked for (past the end, or invalid). Keep the URL honest.
  useEffect(() => {
    if (!loading && result && result.meta.page !== query.page) setQuery({ page: result.meta.page }, { replace: true });
  }, [loading, result, query.page, setQuery]);

  const sortBy = (field) => setQuery({ sort: field, order: sort === field && order === 'desc' ? 'asc' : 'desc' });
  const clearFilters = () => setQuery({ dateFrom: '', dateTo: '', amountMin: '', amountMax: '' });
  // One setQuery call: React Router does not queue two calls made in the same tick, the second would undo the first.
  const clearAll = () => { setSearchInput(''); setQuery({ search: '', dateFrom: '', dateTo: '', amountMin: '', amountMax: '' }); };
  const toggleSelected = (id) => setSelected((current) => (current.includes(id) ? current.filter((value) => value !== id) : [...current, id]));

  const remove = async (ids, question) => {
    if (acting || !ids.length || !window.confirm(question)) return;
    setActing(true);
    setNotice(null);
    try {
      setNotice(summarizeDeletion(await deleteIncompleteOrders(ids)));
    } catch (actionError) {
      setNotice({ tone: 'error', text: incompleteOrderErrorSentence(actionError?.code) });
    } finally {
      setActing(false);
      reload();
    }
  };
  const removeSelected = () => remove(selected, `Delete ${selected.length} selected ${selected.length === 1 ? 'record' : 'records'}?`);
  const removeOne = (id) => remove([id], `Delete incomplete order ${id}?`);

  const exportCsv = () => {
    const rows = selected.length ? records.filter((record) => selected.includes(record.id)) : records;
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([incompleteOrdersToCsv(rows)], { type: 'text/csv;charset=utf-8' }));
    link.download = 'incomplete-orders.csv';
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return <div className="tw-flex tw-flex-col tw-gap-5">
    <header>
      <Breadcrumb items={[{ label: 'Dashboard', to: '/ecommerce' }, { label: 'Ecommerce' }, { label: 'Orders', to: '/ecommerce/orders' }, { label: 'Incomplete orders' }]} />
      <h1 className="tw-mt-2 tw-text-2xl tw-font-semibold">Incomplete orders</h1>
    </header>
    <Card>
      <IncompleteOrdersToolbar selectedCount={selected.length} search={searchInput} onSearch={setSearchInput} onFilter={() => setShowFilters((open) => !open)} filtersOpen={showFilters} onReload={reload} loading={loading || acting} onExport={exportCsv} onBulkDelete={removeSelected} onCreate={() => navigate('/ecommerce/orders/create')} />
      {showFilters && <IncompleteOrderFilters key={FILTER_KEYS.map((key) => filters[key]).join('|')} initial={filters} onApply={(draft) => setQuery(draft)} onReset={clearFilters} />}
      {activeFilters.length > 0 && <div className="tw-mt-3 tw-flex tw-flex-wrap tw-gap-2">{activeFilters.map((key) => <button key={key} type="button" aria-label={`Remove filter ${FILTER_LABELS[key]} ${filters[key]}`} className="tw-rounded-full tw-border tw-border-solid tw-border-brand tw-bg-transparent tw-px-3 tw-py-1 tw-text-xs tw-text-brand" onClick={() => setQuery({ [key]: '' })}>{FILTER_LABELS[key]}: {filters[key]} ×</button>)}</div>}
      {notice && <div className="tw-mt-4"><Notice tone={notice.tone} text={notice.text} onDismiss={() => setNotice(null)} /></div>}
      {error ? <div className="tw-mt-4"><LoadError message="Unable to load incomplete orders." onRetry={reload} /></div>
        : loading ? <LoadingBlock label="Loading incomplete orders" className="tw-mt-5 tw-h-64" />
          : !records.length ? <EmptyState filtered={activeFilters.length > 0 || Boolean(query.search)} onClear={clearAll} />
            : <div className="tw-mt-5"><IncompleteOrdersTable records={records} selected={selected} onSelectAll={(all) => setSelected(all ? records.map((record) => record.id) : [])} onSelect={toggleSelected} onSort={sortBy} sort={sort} order={order} store={STORE} onDelete={removeOne} /></div>}
      {!loading && !error && records.length > 0 && <Pagination noun="Incomplete orders" page={meta.page} pageSize={pageSize} total={meta.total} totalPages={meta.totalPages} onPage={(page) => setQuery({ page })} onPageSize={(value) => setQuery({ pageSize: value })} />}
    </Card>
  </div>;
}

function EmptyState({ filtered, onClear }) {
  return <div className="tw-py-16 tw-text-center">
    <Icon name="cart" size={32} className="tw-mb-3 tw-text-muted" />
    <h2 className="tw-text-lg tw-font-semibold">No incomplete orders found</h2>
    <p className="tw-mt-1 tw-text-muted">{filtered ? 'Try adjusting your search or filters.' : 'Abandoned checkouts will show up here.'}</p>
    {filtered && <button type="button" className="tw-mt-4 tw-border-0 tw-bg-transparent tw-text-brand tw-underline" onClick={onClear}>Clear filters</button>}
  </div>;
}
