import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { LoadError, LoadingBlock } from '../../components/ui/AsyncState';
import { deleteCategory, listCategories } from '../../services/api/categories';
import { useResource } from '../../hooks/useResource';
import { useQueryState } from '../../hooks/useQueryState';
import { useSearchInput } from '../../hooks/useSearchInput';
import { categoryParentName, exportCategoriesCsv } from './categoryUtils';

const NO_CATEGORIES = [];
const NO_PARAMS = {};
const QUERY = { search: '', status: '', parentId: '' };

export default function CategoriesPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useQueryState(QUERY);
  const { status, parentId } = query;
  const [searchInput, setSearchInput] = useSearchInput(query.search, (search) => setQuery({ search }, { replace: true }));
  const { data: result, error, loading, reload } = useResource(listCategories, query);
  const { data: everything, error: everythingError } = useResource(listCategories, NO_PARAMS);
  const categories = result?.data ?? NO_CATEGORIES;
  const allCategories = everything?.data ?? NO_CATEGORIES;
  const metadataError = everythingError ? 'Unable to load parent categories.' : '';
  const [actionError, setActionError] = useState('');
  const remove = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    setActionError('');
    try {
      const outcome = await deleteCategory(id);
      if (outcome.deleted) reload();
      else setActionError(outcome.reason || 'Unable to delete category.');
    } catch (deleteError) {
      setActionError(deleteError.message || 'Unable to delete category.');
    }
  };
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
      <div className="tw-flex tw-flex-wrap tw-gap-3"><label className="tw-flex-1"><span className="visually-hidden">Search categories</span><input className="form-control tw-h-11" value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Search categories..." /></label><select className="form-select tw-h-11 tw-max-w-[180px]" aria-label="Filter category status" value={status} onChange={(event) => setQuery({ status: event.target.value })}><option value="">All statuses</option><option value="active">Active</option><option value="draft">Draft</option></select><select className="form-select tw-h-11 tw-max-w-[220px]" aria-label="Filter parent category" value={parentId} onChange={(event) => setQuery({ parentId: event.target.value })}><option value="">All parent categories</option>{allCategories.filter((category) => !category.parentId).map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></div>
      {metadataError && <p role="status" className="tw-mt-3 tw-text-muted">{metadataError}</p>}
      {actionError && <div role="alert" className="tw-mt-4 tw-rounded-lg tw-bg-[var(--c-danger-bg)] tw-p-4 tw-text-[var(--c-danger-ink)]">{actionError}</div>}
      {error ? <div className="tw-mt-4"><LoadError message="Unable to load categories." onRetry={reload} /></div> : loading ? <LoadingBlock label="Loading categories" className="tw-mt-5 tw-h-40" /> : <div className="tw-overflow-x-auto"><table className="admin-table tw-mt-5 tw-min-w-[900px]"><caption className="visually-hidden">Product categories</caption><thead><tr>{['Category', 'Parent', 'Slug', 'Products', 'Status', 'Operations'].map((heading) => <th key={heading} scope="col" className="tw-text-xs tw-uppercase tw-text-muted">{heading}</th>)}</tr></thead><tbody>{categories.map((category) => <tr key={category.id}><td className="tw-font-medium"><span style={{ paddingLeft: `${category.depth * 20}px` }}>{category.depth > 0 ? '↳ ' : ''}{category.name}</span></td><td className="tw-text-muted">{categoryParentName(category, allCategories)}</td><td className="tw-text-muted">{category.slug}</td><td>{category.productCount}</td><td><span className={`status-pill status-${category.status}`}>{category.status}</span></td><td><div className="tw-flex tw-gap-2"><Button variant="brandOutline" className="tw-h-9 tw-px-3" onClick={() => navigate(`/ecommerce/categories/${category.id}/edit`)}>Edit</Button><Button variant="brandOutline" className="tw-h-9 tw-px-3" onClick={() => remove(category.id)}>Delete</Button></div></td></tr>)}</tbody></table>{!categories.length && <p className="tw-py-8 tw-text-center tw-text-muted">No categories found.</p>}</div>}
    </Card>
  </div>;
}
