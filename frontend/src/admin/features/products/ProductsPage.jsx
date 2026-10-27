import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Icon from '../../components/ui/Icon';
import ProductFilters from './components/ProductFilters';
import ProductRow from './components/ProductRow';
import { deleteProduct as deleteProductRequest, getProductCategories, listProducts } from '../../services/api/products';
import { exportProductsCsv } from './productUtils';
import ProductCsvImport from './components/ProductCsvImport';

const emptyFilters = { category: '', status: '', stockState: '', priceMin: '', priceMax: '' };
const filterKeys = Object.keys(emptyFilters);

export default function ProductsPage() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [meta, setMeta] = useState({ page: 1, pageSize: 20, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selected, setSelected] = useState([]);
  const [draftFilters, setDraftFilters] = useState(emptyFilters);
  const [searchInput, setSearchInput] = useState(params.get('search') || '');
  const [showImport, setShowImport] = useState(false);
  const [categories, setCategories] = useState([]);
  const page = Number(params.get('page') || 1);
  const pageSize = Number(params.get('pageSize') || 20);
  const search = params.get('search') || '';
  const filters = useMemo(() => filterKeys.reduce((result, key) => ({ ...result, [key]: params.get(key) || '' }), {}), [params]);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await listProducts({ page, pageSize, search, ...filters });
      setProducts(result.data);
      setMeta(result.meta);
      setSelected([]);
    } catch (loadError) {
      setError(loadError.message || 'Unable to load products.');
    } finally {
      setLoading(false);
    }
  }, [filters, page, pageSize, search]);

  useEffect(() => { const timer = setTimeout(load, 0); return () => clearTimeout(timer); }, [load]);
  useEffect(() => { getProductCategories().then(setCategories); }, []);
  useEffect(() => {
    const timer = setTimeout(() => setParams((current) => { if (searchInput) current.set('search', searchInput); else current.delete('search'); current.set('page', '1'); return current; }, { replace: true }), 300);
    return () => clearTimeout(timer);
  }, [searchInput, setParams]);

  const setQuery = (key, value) => setParams((current) => { if (value) current.set(key, value); else current.delete(key); if (key !== 'page') current.set('page', '1'); return current; });
  const updateFilter = (key, value) => setDraftFilters((current) => ({ ...current, [key]: value }));
  const applyFilters = () => setParams((current) => { filterKeys.forEach((key) => { if (draftFilters[key]) current.set(key, draftFilters[key]); else current.delete(key); }); current.set('page', '1'); return current; });
  const resetFilters = () => { setDraftFilters(emptyFilters); setParams((current) => { filterKeys.forEach((key) => current.delete(key)); current.set('page', '1'); return current; }); };
  const toggleSelected = (id) => setSelected((current) => current.includes(id) ? current.filter((value) => value !== id) : [...current, id]);
  const togglePage = (checked) => setSelected(checked ? products.map((product) => product.id) : []);
  const exportSelected = () => downloadCsv(exportProductsCsv(selected.length ? products.filter((product) => selected.includes(product.id)) : products));
  const deleteProduct = async (id) => { if (window.confirm('Delete this product?')) { await deleteProductRequest(id); setProducts((current) => current.filter((product) => product.id !== id)); } };
  const bulkAction = async (action) => { if (!selected.length) return; if (action === 'delete' && window.confirm(`Delete ${selected.length} products?`)) { await Promise.all(selected.map((id) => deleteProductRequest(id))); setProducts((current) => current.filter((product) => !selected.includes(product.id))); } setSelected([]); };

  return <div className="tw-flex tw-flex-col tw-gap-5">
    <header className="tw-flex tw-flex-wrap tw-items-end tw-justify-between tw-gap-3"><div><div className="tw-text-xs tw-uppercase tw-tracking-[0.12em]"><a href="/" className="link-brand">Dashboard</a><span className="tw-mx-2 tw-text-muted">/</span><span className="tw-text-muted">Ecommerce</span><span className="tw-mx-2 tw-text-muted">/</span><span className="tw-text-muted">Products</span></div><h1 className="tw-mt-2 tw-text-2xl tw-font-semibold">Products</h1></div><Button onClick={() => navigate('/ecommerce/products/create')}><Icon name="plus" size={16} /> Create product</Button></header>
    <Card>
      <div className="tw-flex tw-flex-wrap tw-items-center tw-gap-2"><Button variant="brandOutline" disabled={!selected.length} onClick={() => bulkAction('delete')}>Bulk actions {selected.length ? `(${selected.length})` : ''}</Button><Button variant="brandOutline" onClick={() => setShowFilters((value) => !value)}><Icon name="filter" size={16} /> Filters</Button><div className="tw-relative tw-min-w-[220px] tw-flex-1 md:tw-max-w-[360px]"><label htmlFor="product-search" className="visually-hidden">Search products</label><input id="product-search" value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Search products..." className="form-control tw-h-11 tw-pr-10" /><Icon name="search" size={17} className="tw-absolute tw-right-3 tw-top-3 tw-text-muted" /></div><div className="tw-flex tw-flex-1 tw-justify-end tw-gap-2"><Button variant="brandOutline" onClick={() => setShowImport((value) => !value)}>Import CSV</Button><Button variant="brandOutline" onClick={exportSelected}><Icon name="download" size={16} /> Export CSV</Button><Button variant="brandOutline" aria-label="Reload products" onClick={load} disabled={loading}><Icon name="refresh" size={17} className={loading ? 'tw-animate-spin' : ''} /></Button></div></div>
      {showImport && <ProductCsvImport categories={categories} onClose={() => setShowImport(false)} onImported={load} />}
      {showFilters && <ProductFilters filters={draftFilters} categories={categories} onChange={updateFilter} onApply={applyFilters} onReset={resetFilters} />}
      {error && <div role="alert" className="tw-mt-4 tw-rounded-lg tw-bg-[var(--c-danger-bg)] tw-p-4 tw-text-[var(--c-danger-ink)]">{error} <button type="button" className="tw-underline" onClick={load}>Retry</button></div>}
      {loading ? <Loading /> : !products.length ? <Empty active={Boolean(search) || Object.values(filters).some(Boolean)} onClear={resetFilters} /> : <div className="tw-overflow-x-auto"><table className="admin-table tw-mt-5 tw-min-w-[980px]"><thead><tr><th><input type="checkbox" aria-label="Select all products" checked={selected.length === products.length} onChange={(event) => togglePage(event.target.checked)} /></th>{['Product', 'SKU', 'Price', 'Sale price', 'Stock', 'Status', 'Updated', 'Operations'].map((heading) => <th key={heading} className="tw-text-xs tw-font-medium tw-uppercase tw-text-muted">{heading}</th>)}</tr></thead><tbody>{products.map((product) => <ProductRow key={product.id} product={product} selected={selected.includes(product.id)} onSelect={toggleSelected} onEdit={(id) => navigate(`/ecommerce/products/${id}/edit`)} onDelete={deleteProduct} />)}</tbody></table></div>}
      {!loading && products.length > 0 && <footer className="tw-mt-5 tw-flex tw-flex-wrap tw-items-center tw-justify-between tw-gap-3 tw-border-0 tw-border-t tw-border-solid tw-border-hair tw-pt-4"><span className="tw-text-muted">Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, meta.total)} of {meta.total} products</span><div className="tw-flex tw-items-center tw-gap-2"><select aria-label="Products per page" value={pageSize} onChange={(event) => setQuery('pageSize', event.target.value)} className="tw-h-10 tw-rounded tw-border tw-border-solid tw-border-field tw-bg-card tw-px-2 tw-text-ink"><option>20</option><option>50</option><option>100</option></select><button type="button" aria-label="Previous products page" disabled={page <= 1} onClick={() => setQuery('page', String(page - 1))} className="tw-h-10 tw-w-10 tw-border tw-border-solid tw-border-field tw-bg-card tw-text-ink">‹</button><span>{page} / {meta.totalPages}</span><button type="button" aria-label="Next products page" disabled={page >= meta.totalPages} onClick={() => setQuery('page', String(page + 1))} className="tw-h-10 tw-w-10 tw-border tw-border-solid tw-border-field tw-bg-card tw-text-ink">›</button></div></footer>}
    </Card>
  </div>;
}

function Loading() { return <div className="tw-space-y-3 tw-py-5">{Array.from({ length: 8 }, (_, index) => <div key={index} className="tw-h-12 tw-animate-pulse tw-rounded tw-bg-page" />)}</div>; }
function Empty({ active, onClear }) { return <div className="tw-py-16 tw-text-center"><Icon name="box" size={32} className="tw-text-muted" /><h2 className="tw-mt-3 tw-text-lg tw-font-semibold">No products found</h2>{active && <button type="button" className="tw-mt-3 tw-text-brand tw-underline" onClick={onClear}>Clear filters</button>}</div>; }
function downloadCsv(csv) { const link = document.createElement('a'); link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' })); link.download = 'products.csv'; link.click(); URL.revokeObjectURL(link.href); }
