import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { listCategories } from '../../services/api/categories';
import { deleteCategory } from '../../services/api/categories';
import { useNavigate } from 'react-router-dom';
import { categoryParentName, exportCategoriesCsv } from './categoryUtils';

export default function CategoriesPage() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [categories, setCategories] = useState([]);
  const search = params.get('search') || '';
  const [searchInput, setSearchInput] = useState(search);
  const status = params.get('status') || '';
  const parentId = params.get('parentId') || '';
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [allCategories, setAllCategories] = useState([]);
  const [metadataError, setMetadataError] = useState('');
  useEffect(() => {
    listCategories().then((result) => setAllCategories(result.data)).catch((loadError) => setMetadataError(loadError.message || 'Unable to load parent categories.'));
  }, []);
  const remove = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    const result = await deleteCategory(id);
    if (!result.deleted) setError(result.reason || 'Unable to delete category.');
    else setCategories((current) => current.filter((category) => category.id !== id));
  };

  useEffect(() => {
    let active = true;
    listCategories({ search, status, parentId }).then((result) => {
      if (active) setCategories(result.data);
    }).catch((loadError) => {
      if (active) setError(loadError.message || 'Unable to load categories.');
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [search, status, parentId]);

  const setQuery = useCallback((key, value) => setParams((current) => {
    if (value) current.set(key, value);
    else current.delete(key);
    return current;
  }), [setParams]);
  useEffect(() => {
    const timer = setTimeout(() => setQuery('search', searchInput), 250);
    return () => clearTimeout(timer);
  }, [searchInput, setQuery]);
  const exportCsv = () => {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([exportCategoriesCsv(categories)], { type: 'text/csv;charset=utf-8' }));
    link.download = 'categories.csv';
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return <div className="tw-flex tw-flex-col tw-gap-5">
    <header className="tw-flex tw-flex-wrap tw-items-end tw-justify-between tw-gap-3"><div><div className="tw-text-xs tw-uppercase tw-tracking-[0.12em]"><a href="/" className="link-brand">Dashboard</a><span className="tw-mx-2 tw-text-muted">/</span><span className="tw-text-muted">Ecommerce</span></div><h1 className="tw-mt-2 tw-text-2xl tw-font-semibold">Categories</h1></div><div className="tw-flex tw-gap-2"><Button variant="brandOutline" onClick={exportCsv} disabled={!categories.length}>Export CSV</Button><Button onClick={() => navigate('/ecommerce/categories/create')}>Create category</Button></div></header>
    <Card>
      <div className="tw-flex tw-flex-wrap tw-gap-3"><label className="tw-flex-1"><span className="visually-hidden">Search categories</span><input key={search} className="form-control tw-h-11" value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Search categories..." /></label><select className="form-select tw-h-11 tw-max-w-[180px]" aria-label="Filter category status" value={status} onChange={(event) => setQuery('status', event.target.value)}><option value="">All statuses</option><option value="active">Active</option><option value="draft">Draft</option></select><select className="form-select tw-h-11 tw-max-w-[220px]" aria-label="Filter parent category" value={parentId} onChange={(event) => setQuery('parentId', event.target.value)}><option value="">All parent categories</option>{allCategories.filter((category) => !category.parentId).map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></div>
      {metadataError && <p role="status" className="tw-mt-3 tw-text-muted">{metadataError}</p>}
      {error && <div role="alert" className="tw-mt-4 tw-rounded-lg tw-bg-[var(--c-danger-bg)] tw-p-4 tw-text-[var(--c-danger-ink)]">{error}</div>}
      {loading ? <div role="status" aria-label="Loading categories" className="tw-mt-5 tw-h-40 tw-animate-pulse tw-rounded tw-bg-page" /> : <div className="tw-overflow-x-auto"><table className="admin-table tw-mt-5 tw-min-w-[900px]"><caption className="visually-hidden">Product categories</caption><thead><tr>{['Category', 'Parent', 'Slug', 'Products', 'Status', 'Operations'].map((heading) => <th key={heading} scope="col" className="tw-text-xs tw-uppercase tw-text-muted">{heading}</th>)}</tr></thead><tbody>{categories.map((category) => <tr key={category.id}><td className="tw-font-medium"><span style={{ paddingLeft: `${category.depth * 20}px` }}>{category.depth > 0 ? '↳ ' : ''}{category.name}</span></td><td className="tw-text-muted">{categoryParentName(category, allCategories)}</td><td className="tw-text-muted">{category.slug}</td><td>{category.productCount}</td><td><span className={`status-pill status-${category.status}`}>{category.status}</span></td><td><div className="tw-flex tw-gap-2"><Button variant="brandOutline" className="tw-h-9 tw-px-3" onClick={() => navigate(`/ecommerce/categories/${category.id}/edit`)}>Edit</Button><Button variant="brandOutline" className="tw-h-9 tw-px-3" onClick={() => remove(category.id)}>Delete</Button></div></td></tr>)}</tbody></table>{!categories.length && <p className="tw-py-8 tw-text-center tw-text-muted">No categories found.</p>}</div>}
    </Card>
  </div>;
}
