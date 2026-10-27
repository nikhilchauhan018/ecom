import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Form from 'react-bootstrap/Form';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { createCategory, getCategory, listCategories, updateCategory } from '../../services/api/categories';
import { slugifyCategory, validateCategory } from './categoryUtils';

const blank = { name: '', slug: '', description: '', parentId: '', status: 'active' };

export default function CategoryFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const editing = Boolean(id);
  const [category, setCategory] = useState(blank);
  const [categories, setCategories] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(editing);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    Promise.all([listCategories(), editing ? getCategory(id) : Promise.resolve(null)]).then(([result, current]) => {
      setCategories(result.data);
      if (current) setCategory(current);
      setLoading(false);
    });
  }, [editing, id]);

  useEffect(() => {
    const guard = (event) => { if (dirty) { event.preventDefault(); event.returnValue = ''; } };
    window.addEventListener('beforeunload', guard);
    return () => window.removeEventListener('beforeunload', guard);
  }, [dirty]);

  const update = (key, value) => {
    setDirty(true);
    setCategory((current) => ({ ...current, [key]: value }));
  };
  const save = async (event) => {
    event.preventDefault();
    const nextErrors = validateCategory(category, categories, id || '');
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    setSaving(true);
    const result = editing ? await updateCategory(id, category) : await createCategory(category);
    setSaving(false);
    if (result) { setDirty(false); navigate('/ecommerce/categories'); }
  };
  const cancel = () => { if (!dirty || window.confirm('Discard unsaved changes?')) navigate('/ecommerce/categories'); };

  if (loading) return <Card><div className="tw-h-32 tw-animate-pulse tw-rounded tw-bg-page" /></Card>;
  return <form onSubmit={save} className="tw-flex tw-flex-col tw-gap-5">
    <header className="tw-flex tw-flex-wrap tw-items-center tw-justify-between tw-gap-3"><div><Link to="/ecommerce/categories" className="link-brand">← Categories</Link><h1 className="tw-mt-2 tw-text-2xl tw-font-semibold">{editing ? `Edit ${category.name}` : 'Create category'}</h1></div><div className="tw-flex tw-gap-2"><Button type="button" variant="brandOutline" onClick={cancel}>Cancel</Button><Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save category'}</Button></div></header>
    <Card title="Category details">
      <Form.Group><Form.Label htmlFor="category-name">Name</Form.Label><Form.Control id="category-name" value={category.name} isInvalid={Boolean(errors.name)} onChange={(event) => { update('name', event.target.value); if (!category.slug) update('slug', slugifyCategory(event.target.value)); }} /><Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback></Form.Group>
      <Form.Group className="tw-mt-3"><Form.Label htmlFor="category-slug">Slug</Form.Label><Form.Control id="category-slug" value={category.slug} isInvalid={Boolean(errors.slug)} onChange={(event) => update('slug', slugifyCategory(event.target.value))} /><Form.Control.Feedback type="invalid">{errors.slug}</Form.Control.Feedback></Form.Group>
      <Form.Group className="tw-mt-3"><Form.Label htmlFor="category-description">Description</Form.Label><Form.Control id="category-description" as="textarea" rows={4} maxLength={500} value={category.description || ''} onChange={(event) => update('description', event.target.value)} /></Form.Group>
      <div className="tw-mt-3 tw-grid tw-gap-3 sm:tw-grid-cols-2"><Form.Group><Form.Label htmlFor="category-parent">Parent category</Form.Label><Form.Select id="category-parent" value={category.parentId || ''} onChange={(event) => update('parentId', event.target.value)}><option value="">No parent</option>{categories.filter((item) => item.id !== id).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</Form.Select></Form.Group><Form.Group><Form.Label htmlFor="category-status">Status</Form.Label><Form.Select id="category-status" value={category.status} onChange={(event) => update('status', event.target.value)}><option value="active">Active</option><option value="draft">Draft</option></Form.Select></Form.Group></div>
    </Card>
  </form>;
}
