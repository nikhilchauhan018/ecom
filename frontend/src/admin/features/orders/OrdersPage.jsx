import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Icon from '../../components/ui/Icon';
import OrderFilters from './components/OrderFilters';
import OrderToolbar from './components/OrderToolbar';
import OrdersTable from './components/OrdersTable';
import OrderCards from './components/OrderCards';
import { listOrders } from '../../services/api/orders';
import { paymentMethods } from '../../data/orders.mock';

const initialFilters = { status: '', paymentStatus: '', paymentMethod: '', dateFrom: '', dateTo: '', amountMin: '', amountMax: '', customer: '' };
const filterKeys = Object.keys(initialFilters);

export default function OrdersPage() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [orders, setOrders] = useState([]);
  const [meta, setMeta] = useState({ page: 1, pageSize: 10, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selected, setSelected] = useState([]);
  const [expanded, setExpanded] = useState([]);
  const [draftFilters, setDraftFilters] = useState(initialFilters);
  const [searchInput, setSearchInput] = useState(params.get('search') || '');
  const page = Number(params.get('page') || 1);
  const pageSize = Number(params.get('pageSize') || 10);
  const search = params.get('search') || '';
  const sort = params.get('sort') || 'createdAt';
  const order = params.get('order') || 'desc';
  const filters = useMemo(() => filterKeys.reduce((result, key) => ({ ...result, [key]: params.get(key) || '' }), {}), [params]);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      let result = await listOrders({ page, pageSize, search, sort, order, ...filters });
      if (!result.data.length && result.meta.total && page > result.meta.totalPages) {
        setParams((current) => { current.set('page', String(result.meta.totalPages)); return current; }, { replace: true });
        result = await listOrders({ page: result.meta.totalPages, pageSize, search, sort, order, ...filters });
      }
      setOrders(result.data);
      setMeta(result.meta);
      setSelected([]);
    } catch (loadError) {
      setError(loadError.message || 'Unable to load orders.');
    } finally {
      setLoading(false);
    }
  }, [filters, order, page, pageSize, search, setParams, sort]);

  useEffect(() => {
    const timer = setTimeout(load, 0);
    return () => clearTimeout(timer);
  }, [load]);
  useEffect(() => {
    const timer = setTimeout(() => setParams((current) => {
      if (searchInput) current.set('search', searchInput);
      else current.delete('search');
      current.set('page', '1');
      return current;
    }, { replace: true }), 300);
    return () => clearTimeout(timer);
  }, [searchInput, setParams]);

  const setQuery = (key, value) => setParams((current) => { if (value) current.set(key, value); else current.delete(key); if (key !== 'page') current.set('page', '1'); return current; });
  const updateFilter = (key, value) => setDraftFilters((current) => ({ ...current, [key]: value }));
  const applyFilters = () => { setParams((current) => { filterKeys.forEach((key) => { if (draftFilters[key]) current.set(key, draftFilters[key]); else current.delete(key); }); current.set('page', '1'); return current; }); };
  const resetFilters = () => { setDraftFilters(initialFilters); setParams((current) => { filterKeys.forEach((key) => current.delete(key)); current.set('page', '1'); return current; }); };
  const toggleSelected = (id) => setSelected((current) => current.includes(id) ? current.filter((value) => value !== id) : [...current, id]);
  const toggleExpanded = (id) => setExpanded((current) => current.includes(id) ? current.filter((value) => value !== id) : [...current, id]);
  const sortBy = (field) => setParams((current) => {
    current.set('sort', field);
    current.set('order', sort === field && order === 'desc' ? 'asc' : 'desc');
    current.set('page', '1');
    return current;
  });
  const exportOrders = (format) => {
    const rows = selected.length ? orders.filter((item) => selected.includes(item.id)) : orders;
    const csv = [['ID', 'Customer', 'Email', 'Amount', 'Payment status', 'Status'], ...rows.map((item) => [item.number, item.customer.name, item.customer.email, item.amounts.total, item.paymentStatus, item.status])].map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `orders.${format === 'xls' ? 'xls' : 'csv'}`;
    link.click();
    URL.revokeObjectURL(link.href);
  };
  const bulkAction = async (action) => {
    if (!selected.length) return;
    if (!window.confirm(`Apply ${action} to ${selected.length} selected orders?`)) return;
    if (action === 'delete') setOrders((current) => current.filter((item) => !selected.includes(item.id)));
    else setOrders((current) => current.map((item) => selected.includes(item.id) ? { ...item, status: action } : item));
    setSelected([]);
  };

  return <div className="tw-flex tw-flex-col tw-gap-5">
    <div><div className="tw-text-xs tw-uppercase tw-tracking-[0.12em]"><a href="/ecommerce" className="link-brand">Dashboard</a><span className="tw-mx-2 tw-text-muted">/</span><span className="tw-text-muted">Ecommerce</span><span className="tw-mx-2 tw-text-muted">/</span><span className="tw-text-muted">Orders</span></div><h1 className="tw-mt-2 tw-text-2xl tw-font-semibold">Orders</h1></div>
    <Card>
      <OrderToolbar selectedCount={selected.length} search={searchInput} onSearch={setSearchInput} onFilter={() => setShowFilters((value) => !value)} onReload={load} loading={loading} onExport={exportOrders} onBulkAction={bulkAction} onCreate={() => navigate('/ecommerce/orders/create')} />
      {showFilters && <OrderFilters filters={draftFilters} methods={paymentMethods} onChange={updateFilter} onApply={applyFilters} onReset={resetFilters} />}
      {Object.values(filters).some(Boolean) && <div className="tw-mt-3 tw-flex tw-flex-wrap tw-gap-2">{filterKeys.filter((key) => filters[key]).map((key) => <button key={key} type="button" className="tw-rounded-full tw-border tw-border-solid tw-border-brand tw-bg-transparent tw-px-3 tw-py-1 tw-text-xs tw-text-brand" onClick={() => setQuery(key, '')}>{key}: {filters[key]} ×</button>)}</div>}
      {error && <div role="alert" aria-live="assertive" className="tw-mt-4 tw-rounded-lg tw-bg-[var(--c-danger-bg)] tw-p-4 tw-text-[var(--c-danger-ink)]">Unable to load orders. <button type="button" className="tw-underline" onClick={load}>Retry</button></div>}
      {loading ? <LoadingRows /> : !orders.length ? <EmptyState active={Object.values(filters).some(Boolean) || Boolean(search)} onClear={resetFilters} /> : <><div className="tw-hidden sm:tw-block"><OrdersTable orders={orders} selected={selected} expanded={expanded} onSelect={(value) => Array.isArray(value) ? setSelected(value) : toggleSelected(value)} onExpand={toggleExpanded} onSort={sortBy} sort={sort} order={order} onEdit={(id) => navigate(`/ecommerce/orders/${id}`)} onDelete={(id) => { if (window.confirm('Delete this order?')) setOrders((current) => current.filter((item) => item.id !== id)); }} /></div><div className="tw-block sm:tw-hidden"><OrderCards orders={orders} selected={selected} onSelect={toggleSelected} onEdit={(id) => navigate(`/ecommerce/orders/${id}`)} onDelete={(id) => { if (window.confirm('Delete this order?')) setOrders((current) => current.filter((item) => item.id !== id)); }} /></div></>}
      {!loading && orders.length > 0 && <OrdersPagination page={page} pageSize={pageSize} total={meta.total} totalPages={meta.totalPages} onPage={(value) => setQuery('page', String(value))} onPageSize={(value) => setQuery('pageSize', value)} />}
    </Card>
  </div>;
}

function LoadingRows() {
  return <div className="tw-space-y-3 tw-py-5">{Array.from({ length: 6 }, (_, index) => <div key={index} className="tw-h-12 tw-animate-pulse tw-rounded tw-bg-page" />)}</div>;
}

function EmptyState({ active, onClear }) {
  return <div className="tw-py-16 tw-text-center"><Icon name="box" size={32} className="tw-mb-3 tw-text-muted" /><h2 className="tw-text-lg tw-font-semibold">No orders found</h2><p className="tw-mt-1 tw-text-muted">Try adjusting your search or filters.</p>{active && <button type="button" className="tw-mt-4 tw-text-brand tw-underline" onClick={onClear}>Clear filters</button>}</div>;
}

function OrdersPagination({ page, pageSize, total, totalPages, onPage, onPageSize }) {
  const first = total ? (page - 1) * pageSize + 1 : 0;
  const last = Math.min(page * pageSize, total);
  const pages = getPageItems(page, totalPages);

  return <footer className="tw-mt-5 tw-flex tw-flex-wrap tw-items-center tw-justify-between tw-gap-4 tw-border-0 tw-border-t tw-border-solid tw-border-hair tw-pt-5">
    <div className="tw-flex tw-items-center tw-gap-4">
      <label htmlFor="page-size" className="visually-hidden">Orders per page</label>
      <select id="page-size" value={pageSize} onChange={(event) => onPageSize(event.target.value)} className="tw-h-10 tw-w-[90px] tw-rounded tw-border tw-border-solid tw-border-field tw-bg-card tw-px-2 tw-text-ink">
        <option value="10">10</option><option value="20">20</option><option value="50">50</option>
      </select>
      <span className="tw-inline-flex tw-items-center tw-gap-2 tw-whitespace-nowrap tw-text-[15px] tw-text-muted"><Icon name="globe" size={22} /> Showing from {first} to {last} in <strong className="tw-rounded tw-bg-muted tw-px-2 tw-py-1 tw-text-sm tw-text-card">{total}</strong> records</span>
    </div>
    <nav aria-label="Orders pagination" className="tw-flex tw-items-center tw-gap-1">
      <PageButton disabled={page === 1} onClick={() => onPage(page - 1)} label="« Previous" />
      {pages.map((item, index) => item === 'ellipsis' ? <span key={`ellipsis-${index}`} className="tw-px-2 tw-text-muted">…</span> : <PageButton key={item} active={item === page} onClick={() => onPage(item)} label={item} ariaLabel={`Page ${item}`} />)}
      <PageButton disabled={page === totalPages} onClick={() => onPage(page + 1)} label="Next »" />
    </nav>
  </footer>;
}

function PageButton({ label, onClick, disabled, active, ariaLabel }) {
  return <button type="button" disabled={disabled} aria-label={ariaLabel || label} aria-current={active ? 'page' : undefined} onClick={onClick} className={`tw-min-h-10 tw-rounded-md tw-border-0 tw-px-3 tw-text-[15px] ${active ? 'tw-bg-brand tw-font-semibold tw-text-white' : 'tw-bg-transparent tw-text-muted hover:tw-bg-page'} disabled:tw-cursor-not-allowed disabled:tw-opacity-50`}>{label}</button>;
}

function getPageItems(page, totalPages) {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, index) => index + 1);
  if (page <= 4) return [1, 2, 3, 4, 5, 'ellipsis', totalPages];
  if (page >= totalPages - 3) return [1, 'ellipsis', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  return [1, 'ellipsis', page - 1, page, page + 1, 'ellipsis', totalPages];
}
