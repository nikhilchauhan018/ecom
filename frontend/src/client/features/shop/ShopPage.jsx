import React, { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ProductCard } from '../../components/ui/ProductCard';
import { getFacets, searchProducts } from '../../services/catalog.js';
import { parseFilters, resetFilterPage, serializeFilters } from '../../utils/filters.js';
import { useT } from '../../hooks/useT';
import { useSettings } from '../../hooks/useSettings';
import '../../styles/shop.css';

const emptyDraft = { gender: [], category: [], size: [], color: [], fabric: [], page: 1 };
const loadFilters = () => import('../filters/FiltersSheet');
const FiltersSheet = lazy(loadFilters);

/**
 * Product listing route shared by shop and search.
 */
export function ShopPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useT();
  const settings = useSettings();
  const parsed = useMemo(() => parseFilters(new URLSearchParams(location.search)), [location.search]);
  const [draft, setDraft] = useState({ ...emptyDraft, ...parsed });
  const [products, setProducts] = useState([]);
  const [facets, setFacets] = useState(null);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => { setDraft({ ...emptyDraft, ...parsed }); }, [parsed]);
  useEffect(() => {
    const hasFilters = Boolean(location.search);
    const canonical = document.querySelector('link[rel="canonical"]') || document.head.appendChild(document.createElement('link'));
    canonical.rel = 'canonical';
    canonical.href = `${window.location.origin}/shop`;
    const robots = document.querySelector('meta[name="robots"]') || document.head.appendChild(document.createElement('meta'));
    robots.name = 'robots';
    robots.content = hasFilters ? 'noindex, follow' : 'index, follow';
  }, [location.search]);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    Promise.all([searchProducts(parsed, { signal: controller.signal }), getFacets(parsed, { signal: controller.signal })]).then(([result, nextFacets]) => {
      setProducts(result.data); setMeta(result.meta); setFacets(nextFacets); setLoading(false);
    }).catch((error) => { if (error.name !== 'AbortError') setLoading(false); });
    return () => controller.abort();
  }, [parsed]);

  const commit = (next, closeSheet = true) => { if (closeSheet) setSheetOpen(false); const query = serializeFilters(next); navigate({ pathname: location.pathname, search: query ? `?${query}` : '' }); };
  const clear = () => { const next = { ...emptyDraft, q: parsed.q, sort: draft.sort, page: 1 }; setDraft(next); return next; };
  const removeChip = (key, value) => { const next = { ...draft, [key]: key === 'price' ? undefined : Array.isArray(draft[key]) ? draft[key].filter((item) => item !== value) : undefined, page: 1 }; setDraft(next); commit(next); };
  const applied = Object.entries(draft).flatMap(([key, value]) => {
    if (key === 'price' && Array.isArray(value)) return [{ key, value: value.join('-') }];
    if (Array.isArray(value)) return value.map((item) => ({ key, value: item }));
    if (key === 'inStock' && value) return [{ key, value: 'inStock' }];
    if ((key === 'rating' || key === 'discount') && value) return [{ key, value: String(value) }];
    return [];
  });
  const sortLabel = { newest: t('shop.newest'), 'price-asc': t('shop.priceAsc'), 'price-desc': t('shop.priceDesc'), rating: t('shop.rating'), discount: t('shop.discount') };

  return <div className="sf-shop-page"><div className="sf-shop-header"><div><p className="sf-eyebrow">{settings.storeName}</p><h1>{location.pathname === '/search' ? t('shop.results', { count: meta.total }) : t('shop.title')}</h1></div><div className="sf-toolbar"><button type="button" className="sf-filter-trigger" onMouseEnter={loadFilters} onFocus={loadFilters} onClick={() => setSheetOpen(true)}>{t('shop.filterCount', { count: applied.length })}</button><label className="sf-sort"><span>{t('shop.sort')}</span><select value={draft.sort || 'newest'} aria-label={t('shop.sortLabel')} onChange={(event) => commit({ ...draft, sort: event.target.value, page: 1 })}>{Object.entries(sortLabel).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label></div></div><div className="sf-applied-row">{applied.map((chip) => <button type="button" className="sf-applied-chip" key={`${chip.key}-${chip.value}`} onClick={() => removeChip(chip.key, chip.value)}>{chip.value} ×</button>)}{!!applied.length && <button type="button" className="sf-clear-inline" onClick={() => commit(clear())}>{t('filters.clear')}</button>}</div><div className="sf-shop-layout"><Suspense fallback={null}>{facets && <FiltersSheet asSidebar draft={draft} facets={facets} onChange={(next) => { setDraft(next); commit(resetFilterPage(next), false); }} onApply={() => commit(draft)} onClose={() => {}} onClear={() => commit(clear(), false)} resultCount={meta.total} />}</Suspense><main className="sf-results" aria-live="polite"><p className="sf-result-count">{t('shop.results', { count: meta.total })}</p>{loading ? <div className="sf-product-grid" aria-label={t('shop.loading')}>{Array.from({ length: 6 }, (_, index) => <div className="sf-skeleton" key={index} />)}</div> : products.length ? <div className="sf-product-grid">{products.map((product) => <ProductCard key={product.id} product={product} />)}</div> : <div className="sf-empty"><h2>{t('shop.emptyTitle')}</h2><p>{t('shop.emptyBody')}</p></div>}{meta.page < meta.totalPages && <button type="button" className="sf-load-more" onClick={() => commit({ ...parsed, page: meta.page + 1 })}>{t('shop.loadMore')}</button>}</main></div><Suspense fallback={null}><FiltersSheet open={sheetOpen} draft={draft} facets={facets || { gender: [], categories: [], price: { min: 0, max: 1 }, sizes: [], colors: [], ratings: [], discounts: [], fabrics: [] }} onChange={setDraft} onApply={() => commit(draft)} onClose={() => { setDraft({ ...emptyDraft, ...parsed }); setSheetOpen(false); }} onClear={() => { const next = clear(); setDraft(next); }} resultCount={meta.total} /></Suspense></div>;
}

export default ShopPage;