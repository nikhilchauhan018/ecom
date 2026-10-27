import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Form from 'react-bootstrap/Form';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { createProduct, duplicateProduct, getProduct, getProductCategories, updateProduct } from '../../services/api/products';
import { generateVariants, removedVariantsWithData, slugify, validatePrice } from './productUtils';
import { PRODUCT_STATUSES } from './productConstants';
import VariantMatrixRow from './components/VariantMatrixRow';

const ProductDescriptionEditor = lazy(() => import('./components/ProductDescriptionEditor'));

const blank = {
  name: '', slug: '', description: '', category: '', status: 'draft',
  variants: [], images: [], seo: { title: '', description: '' },
};

export default function ProductFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const editing = Boolean(id);
  const [product, setProduct] = useState(() => editing ? blank : { ...blank, variants: generateVariants({ sizes: ['S', 'M', 'L', 'XL'], colors: ['Navy', 'Natural', 'Black'] }) });
  const [sizes, setSizes] = useState('S, M, L, XL');
  const [colors, setColors] = useState('Navy, Natural, Black');
  const [loading, setLoading] = useState(editing);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [categories, setCategories] = useState([]);

  useEffect(() => { getProductCategories().then((result) => { setCategories(result); if (!editing) setProduct((current) => ({ ...current, category: current.category || result[0] || '' })); }); }, [editing]);

  useEffect(() => {
    if (!editing) return undefined;
    let active = true;
    getProduct(id).then((result) => {
      if (!active) return;
      if (result) {
        setProduct(result);
        setSizes([...new Set(result.variants.map((variant) => variant.options.size))].join(', '));
        setColors([...new Set(result.variants.map((variant) => variant.options.color))].join(', '));
      }
      setLoading(false);
    });
    return () => { active = false; };
  }, [editing, id]);

  useEffect(() => {
    const guard = (event) => { if (dirty) { event.preventDefault(); event.returnValue = ''; } };
    window.addEventListener('beforeunload', guard);
    return () => window.removeEventListener('beforeunload', guard);
  }, [dirty]);

  const update = useCallback((key, value) => { setDirty(true); setProduct((current) => ({ ...current, [key]: value })); }, []);
  const regenerate = () => {
    const next = generateVariants({ sizes: sizes.split(',').map((value) => value.trim()).filter(Boolean), colors: colors.split(',').map((value) => value.trim()).filter(Boolean), existing: product.variants });
    const removed = removedVariantsWithData(product.variants, next);
    if (removed.length && !window.confirm(`${removed.length} edited variant(s) will be removed. Continue?`)) return;
    update('variants', next);
  };
  const changeVariant = useCallback((variantId, value) => update('variants', product.variants.map((variant) => variant.id === variantId ? value : variant)), [product.variants, update]);
  const removeVariant = useCallback((variantId) => update('variants', product.variants.filter((variant) => variant.id !== variantId)), [product.variants, update]);
  const save = async (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (!product.name.trim()) nextErrors.name = 'Product name is required.';
    const priceErrors = product.variants.reduce((result, variant) => ({ ...result, ...validatePrice(variant) }), {});
    if (Object.keys(priceErrors).length) nextErrors.price = 'Check variant prices and sale prices.';
    if (!product.variants.length) nextErrors.variants = 'Add at least one variant.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    setSaving(true);
    const payload = { ...product, slug: product.slug || slugify(product.name), updatedAt: new Date().toISOString() };
    const result = editing ? await updateProduct(id, payload) : await createProduct(payload);
    setSaving(false);
    if (result) { setDirty(false); setMessage('Product saved.'); window.setTimeout(() => navigate(`/ecommerce/products/${result.id}/edit`), 400); }
  };
  const duplicate = async () => {
    const result = await duplicateProduct(id);
    if (result) navigate(`/ecommerce/products/${result.id}/edit`);
  };
  const cancel = () => { if (dirty && !window.confirm('Discard unsaved changes?')) return; navigate('/ecommerce/products'); };
  const imageList = useMemo(() => product.images || [], [product.images]);

  if (loading) return <Card><div className="tw-h-32 tw-animate-pulse tw-rounded tw-bg-page" /></Card>;
  return <form onSubmit={save} className="tw-flex tw-flex-col tw-gap-5">
    <header className="tw-flex tw-flex-wrap tw-items-center tw-justify-between tw-gap-3"><div><Link to="/ecommerce/products" className="link-brand">← Products</Link><h1 className="tw-mt-2 tw-text-2xl tw-font-semibold">{editing ? `Edit ${product.name}` : 'Create product'}</h1></div><div className="tw-flex tw-flex-wrap tw-gap-2">{editing && <Button type="button" variant="brandOutline" onClick={duplicate}>Duplicate</Button>}<Button type="button" variant="brandOutline" onClick={cancel}>Cancel</Button><Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save product'}</Button></div></header>
    {message && <div role="status" aria-live="polite" className="tw-rounded-lg tw-bg-[var(--c-success-bg)] tw-p-3 tw-text-[var(--c-success-ink)]">{message}</div>}
    <div className="tw-grid tw-items-start tw-gap-5 lg:tw-grid-cols-[minmax(0,1.5fr)_minmax(280px,1fr)]">
      <div className="tw-flex tw-flex-col tw-gap-5">
        <Card title="Basics"><Form.Group><Form.Label htmlFor="product-name">Product name</Form.Label><Form.Control id="product-name" maxLength={160} value={product.name} isInvalid={Boolean(errors.name)} onChange={(event) => update('name', event.target.value)} /><Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback></Form.Group><Form.Group className="tw-mt-3"><Form.Label>Slug</Form.Label><Form.Control maxLength={180} value={product.slug} onChange={(event) => update('slug', event.target.value)} placeholder="Generated from product name" /></Form.Group><Form.Group className="tw-mt-3"><Form.Label>Description</Form.Label><Suspense fallback={<div className="tw-h-36 tw-animate-pulse tw-rounded tw-bg-page" />}><ProductDescriptionEditor value={product.description} onChange={(value) => update('description', value)} /></Suspense></Form.Group></Card>
        <Card title="Variants"><div className="tw-grid tw-gap-3 sm:tw-grid-cols-2"><Form.Group><Form.Label>Sizes</Form.Label><Form.Control value={sizes} onChange={(event) => setSizes(event.target.value)} placeholder="S, M, L" /></Form.Group><Form.Group><Form.Label>Colours</Form.Label><Form.Control value={colors} onChange={(event) => setColors(event.target.value)} placeholder="Navy, Black" /></Form.Group></div><Button type="button" variant="brandOutline" className="tw-mt-3" onClick={regenerate}>Regenerate variants</Button>{errors.variants && <p className="tw-mt-2 tw-text-danger">{errors.variants}</p>}{errors.price && <p className="tw-mt-2 tw-text-danger">{errors.price}</p>}<div className="tw-mt-4 tw-overflow-x-auto"><table className="admin-table tw-min-w-[850px]"><thead><tr>{['Size', 'Colour', 'SKU', 'Price', 'Sale price', 'Stock', 'Cost', ''].map((heading) => <th key={heading} className="tw-text-xs tw-uppercase tw-text-muted">{heading}</th>)}</tr></thead><tbody>{product.variants.map((variant) => <VariantMatrixRow key={variant.id} variant={variant} onChange={changeVariant} onRemove={removeVariant} />)}</tbody></table></div></Card>
        <Card title="Images"><div className="tw-grid tw-grid-cols-2 tw-gap-3 sm:tw-grid-cols-4">{imageList.map((image) => <img key={image} src={image} alt="" width="120" height="120" loading="lazy" decoding="async" className="tw-h-28 tw-w-full tw-rounded tw-object-cover tw-bg-page" />)}</div><Form.Control className="tw-mt-3" aria-label="Product image URLs" placeholder="Paste image URL and press Enter" onKeyDown={(event) => { if (event.key === 'Enter' && event.currentTarget.value) { event.preventDefault(); update('images', [...imageList, event.currentTarget.value]); event.currentTarget.value = ''; } }} /></Card>
      </div>
      <div className="tw-flex tw-flex-col tw-gap-5"><Card title="Publishing"><Form.Group><Form.Label>Status</Form.Label><Form.Select value={product.status} onChange={(event) => update('status', event.target.value)}>{Object.entries(PRODUCT_STATUSES).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</Form.Select></Form.Group><Form.Group className="tw-mt-3"><Form.Label>Category</Form.Label><Form.Select value={product.category} onChange={(event) => update('category', event.target.value)}>{categories.map((category) => <option key={category}>{category}</option>)}</Form.Select></Form.Group></Card><Card title="SEO"><Form.Group><Form.Label>SEO title</Form.Label><Form.Control maxLength={160} value={product.seo?.title || ''} onChange={(event) => update('seo', { ...product.seo, title: event.target.value })} /></Form.Group><Form.Group className="tw-mt-3"><Form.Label>SEO description</Form.Label><Form.Control as="textarea" rows={4} maxLength={320} value={product.seo?.description || ''} onChange={(event) => update('seo', { ...product.seo, description: event.target.value })} /></Form.Group></Card></div>
    </div>
  </form>;
}
