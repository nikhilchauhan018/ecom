import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Form from 'react-bootstrap/Form';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { duplicateProduct, getProductCategories } from '../../services/api/products';
import { getProduct, saveProduct } from '../../services/productService';
import { generateVariants, removedVariantsWithData, slugify, variantFieldError } from './productUtils';
import { PRODUCT_SIZES, PRODUCT_STATUSES } from './productConstants';
import ColourManager, { HEX_PATTERN } from './components/ColourManager';
import SizeSelector from './components/SizeSelector';
import VariantsTable from './components/VariantsTable';

const DEFAULT_COLOURS = [
  { id: 'black', name: 'Black', hex: '#111111' },
  { id: 'natural', name: 'Natural', hex: '#e8dcc5' },
  { id: 'white', name: 'White', hex: '#ffffff' },
];
const blank = { name: '', slug: '', description: '', category: '', status: 'draft', variants: [], images: [], seo: { title: '', description: '' } };
const URL_PATTERN = /^https:\/\/[^\s]+$/i;

function clean(value, maxLength) {
  return String(value || '').split('').filter((character) => character.charCodeAt(0) >= 32 && character.charCodeAt(0) !== 127).join('').trim().slice(0, maxLength);
}

function normaliseProduct(source) {
  const colours = [];
  const colourByName = new Map();
  const variants = (source.variants || []).map((variant, index) => {
    const name = clean(variant.options?.color || variant.colour?.name || 'Colour', 30);
    let colour = colourByName.get(name.toLowerCase());
    if (!colour) {
      colour = { id: `colour-${index}-${slugify(name)}`, name, hex: '#808080' };
      colourByName.set(name.toLowerCase(), colour);
      colours.push(colour);
    }
    return { ...variant, id: variant.id || `variant-${index}`, size: variant.size || variant.options?.size, colourId: colour.id, sku: variant.sku || `PROD-${source.id}-${variant.options?.size}-${slugify(name).toUpperCase()}`, price: String(variant.price ?? ''), salePrice: variant.salePrice == null ? '' : String(variant.salePrice), stock: String(variant.stock ?? 0), options: { ...(variant.options || {}), color: name } };
  });
  return { ...source, name: clean(source.name, 120), slug: clean(source.slug, 80), description: clean(source.description, 5000), variants, images: (source.images || []).filter((url) => typeof url === 'string').slice(0, 10), seo: source.seo || { title: '', description: '' }, colours };
}

function isImageType(bytes) {
  const hex = Array.from(new Uint8Array(bytes)).map((byte) => byte.toString(16).padStart(2, '0')).join('');
  return hex.startsWith('ffd8ff') ? 'image/jpeg' : hex.startsWith('89504e470d0a1a0a') ? 'image/png' : hex.startsWith('52494646') && hex.slice(16, 24) === '57454250' ? 'image/webp' : '';
}

export default function ProductFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const editing = Boolean(id);
  const [product, setProduct] = useState(() => ({ ...blank, variants: generateVariants({ sizes: ['S', 'M', 'L', 'XL'], colors: DEFAULT_COLOURS }) }));
  const [colours, setColours] = useState(DEFAULT_COLOURS);
  const [sizes, setSizes] = useState(['S', 'M', 'L', 'XL']);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(editing);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [imageErrors, setImageErrors] = useState([]);
  const [pricing, setPricing] = useState({ base: '', compareAt: '', cost: '', tax: 'GST 12%' });
  const [discount, setDiscount] = useState({ type: 'Percentage off', value: '20', starts: '', ends: '', showBadge: true });
  const [photoDetails, setPhotoDetails] = useState({});
  const [hideFromSearch, setHideFromSearch] = useState(false);
  const nameRef = useRef(null);
  const objectUrls = useRef([]);

  useEffect(() => {
    getProductCategories().then((items) => { setCategories(items); if (!editing) setProduct((current) => ({ ...current, category: items[0] || '' })); }).catch(() => setErrors((current) => ({ ...current, category: 'Unable to load categories.' })));
  }, [editing]);

  useEffect(() => {
    if (!editing) return undefined;
    let active = true;
    getProduct(id).then((result) => {
      if (!active) return;
      if (!result.ok) setErrors({ form: result.error });
      else {
        const next = normaliseProduct(result.data);
        setProduct(next);
        setColours(next.colours.length ? next.colours : DEFAULT_COLOURS);
        setSizes([...new Set(next.variants.map((variant) => variant.size).filter((size) => PRODUCT_SIZES.includes(size)))]);
        setPricing(next.pricing || { base: String(next.variants[0]?.price || ''), compareAt: '', cost: '', tax: 'GST 12%' });
        setDiscount(next.discount || { type: 'Percentage off', value: '20', starts: '', ends: '', showBadge: true });
        setHideFromSearch(Boolean(next.hideFromSearch));
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
  useEffect(() => () => objectUrls.current.forEach((url) => URL.revokeObjectURL(url)), []);

  const update = (key, value) => { setDirty(true); setProduct((current) => ({ ...current, [key]: value })); };
  const regenerate = (nextSizes = sizes, nextColours = colours) => {
    const next = generateVariants({ sizes: nextSizes, colors: nextColours, existing: product.variants });
    const removed = removedVariantsWithData(product.variants, next);
    if (removed.length && !window.confirm(`${removed.length} variant(s) with stock will be removed. Continue?`)) return false;
    update('variants', next);
    return true;
  };
  const changeSizes = (next) => { setSizes(next); regenerate(next, colours); };
  const changeColours = (next) => { setColours(next); regenerate(sizes, next); };
  const changeVariants = (next) => update('variants', next);
  const setAllPrices = (price) => changeVariants(product.variants.map((variant) => ({ ...variant, price })));
  const updatePricing = (key, value) => { setDirty(true); setPricing((current) => ({ ...current, [key]: value })); };
  const updateDiscount = (key, value) => { setDirty(true); setDiscount((current) => ({ ...current, [key]: value })); };
  const updatePhoto = (index, key, value) => { setDirty(true); setPhotoDetails((current) => ({ ...current, [index]: { ...(current[index] || {}), [key]: value } })); };
  const removeImage = (image, index) => {
    if (image.startsWith('blob:')) URL.revokeObjectURL(image);
    update('images', imageList.filter((_, imageIndex) => imageIndex !== index));
  };

  const uploadImages = async (event) => {
    const files = Array.from(event.target.files || []);
    const nextErrors = [];
    const accepted = [];
    for (const file of files) {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) { nextErrors.push(`${file.name}: only JPEG, PNG, or WebP images are allowed.`); continue; }
      if (file.size > 5 * 1024 * 1024) { nextErrors.push(`${file.name}: image must be 5 MB or smaller.`); continue; }
      const actualType = isImageType(await file.slice(0, 12).arrayBuffer());
      if (!actualType) { nextErrors.push(`${file.name}: file content is not a supported image.`); continue; }
      if (product.images.length + accepted.length >= 10) { nextErrors.push(`${file.name}: maximum 10 images allowed.`); continue; }
      const url = URL.createObjectURL(file);
      objectUrls.current.push(url);
      accepted.push(url);
    }
    setImageErrors(nextErrors);
    if (accepted.length) update('images', [...product.images, ...accepted]);
    event.target.value = '';
  };

  const validate = () => {
    const nextErrors = {};
    if (!product.name.trim()) nextErrors.name = 'Product name is required.';
    if (!product.variants.length) nextErrors.variants = 'Select at least one size and colour.';
    const skuSet = new Set();
    product.variants.forEach((variant) => {
      if (!/^[A-Z0-9-]{3,40}$/.test(variant.sku)) nextErrors.sku = 'SKUs may contain only A-Z, 0-9, and hyphens.';
      if (skuSet.has(variant.sku)) nextErrors.sku = 'SKUs must be unique within this product.';
      skuSet.add(variant.sku);
    });
    if (product.variants.some((variant) => variantFieldError(variant, 'price') || variantFieldError(variant, 'salePrice') || variantFieldError(variant, 'stock'))) nextErrors.variantFields = 'Fix the highlighted variant fields.';
    if (!product.slug || !/^[a-z0-9](?:[a-z0-9-]{0,78}[a-z0-9])?$/.test(product.slug)) nextErrors.slug = 'Use lowercase letters, numbers, and hyphens only.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) window.setTimeout(() => (document.querySelector('[aria-invalid="true"]') || nameRef.current)?.focus(), 0);
    return !Object.keys(nextErrors).length;
  };

  const save = async (event) => {
    event.preventDefault();
    if (!validate() || saving) return;
    setSaving(true);
    const payload = { ...product, colours, pricing, discount, hideFromSearch, photoDetails, slug: product.slug || slugify(product.name), variants: product.variants.map((variant) => ({ ...variant, price: Number(variant.price), salePrice: variant.salePrice === '' ? null : Number(variant.salePrice), stock: Number(variant.stock), options: { size: variant.size, color: colours.find((colour) => colour.id === variant.colourId)?.name } })), updatedAt: new Date().toISOString() };
    const result = await saveProduct(payload, id);
    setSaving(false);
    if (!result.ok) { setErrors({ form: result.error }); return; }
    setDirty(false);
    setMessage('Product saved.');
    navigate(`/ecommerce/products/${result.data.id}/edit`);
  };
  const duplicate = async () => { const result = await duplicateProduct(id); if (result) navigate(`/ecommerce/products/${result.id}/edit`); };
  const cancel = () => { if (dirty && !window.confirm('Discard unsaved changes?')) return; navigate('/ecommerce/products'); };
  const imageList = useMemo(() => product.images || [], [product.images]);
  const photoColour = (index) => colours.find((colour) => colour.id === photoDetails[index]?.colourId) || colours[0];

  if (loading) return <Card><div role="status" className="tw-h-32 tw-animate-pulse tw-rounded tw-bg-page" /></Card>;
  return <form onSubmit={save} className="tw-flex tw-flex-col tw-gap-5">
    <header className="tw-flex tw-flex-wrap tw-items-end tw-justify-between tw-gap-3"><div><Link to="/ecommerce/products" className="link-brand tw-text-xs">← Products</Link><h1 className="tw-mt-2 tw-text-2xl tw-font-semibold">{editing ? `Edit ${product.name}` : 'Create product'}</h1></div><div className="tw-flex tw-flex-wrap tw-gap-2">{editing && <Button type="button" variant="brandOutline" onClick={duplicate}>Duplicate</Button>}<Button type="button" variant="brandOutline" onClick={cancel}>Cancel</Button><Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save product'}</Button></div></header>
    {message && <div role="status" aria-live="polite" className="tw-rounded-lg tw-bg-[var(--c-success-bg)] tw-p-3 tw-text-[var(--c-success-ink)]">{message}</div>}
    {errors.form && <div role="alert" className="tw-rounded-lg tw-bg-[var(--c-danger-bg)] tw-p-3 tw-text-[var(--c-danger-ink)]">{errors.form}</div>}
    <div className="tw-grid tw-min-w-0 tw-items-start tw-gap-5 lg:tw-grid-cols-[minmax(0,1.5fr)_minmax(280px,1fr)]">
      <div className="tw-flex tw-min-w-0 tw-flex-col tw-gap-5">
        <Card title="Basics"><Form.Group><Form.Label htmlFor="product-name">Product name</Form.Label><Form.Control ref={nameRef} id="product-name" maxLength={120} aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? 'product-name-error' : undefined} value={product.name} onChange={(event) => update('name', clean(event.target.value, 120))} /><Form.Control.Feedback id="product-name-error" type="invalid">{errors.name}</Form.Control.Feedback></Form.Group><Form.Group className="tw-mt-3"><Form.Label htmlFor="product-slug">Slug</Form.Label><Form.Control id="product-slug" maxLength={80} aria-invalid={Boolean(errors.slug)} value={product.slug} onChange={(event) => update('slug', event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '').replace(/^-+|-+$/g, '').slice(0, 80))} placeholder="Generated from product name" /><Form.Text>{errors.slug || 'yourstore.com/products/{product-slug} · auto-filled from the name until you edit it'}</Form.Text></Form.Group><Form.Group className="tw-mt-3"><Form.Label htmlFor="product-description">Description</Form.Label><Form.Control id="product-description" as="textarea" rows={5} maxLength={5000} value={product.description} onChange={(event) => update('description', clean(event.target.value, 5000))} /></Form.Group></Card>
        <Card title="Colours"><ColourManager colours={colours} onChange={changeColours} error={colours.length ? '' : 'Add at least one colour.'} /></Card>
        <Card title="Sizes"><SizeSelector sizes={sizes} onChange={changeSizes} /></Card>
        <Card title="Pricing and discount"><div className="tw-grid tw-gap-3 sm:tw-grid-cols-3"><label><span className="tw-block tw-text-xs tw-text-muted">Base price (₹)</span><input inputMode="numeric" className="form-control tw-mt-1" value={pricing.base} onChange={(event) => updatePricing('base', event.target.value.replace(/[eE+-]/g, ''))} /></label><label><span className="tw-block tw-text-xs tw-text-muted">Compare-at price (₹)</span><input inputMode="numeric" className="form-control tw-mt-1" value={pricing.compareAt} onChange={(event) => updatePricing('compareAt', event.target.value.replace(/[eE+-]/g, ''))} /></label><label><span className="tw-block tw-text-xs tw-text-muted">Cost per item (₹)</span><input inputMode="numeric" className="form-control tw-mt-1" value={pricing.cost} onChange={(event) => updatePricing('cost', event.target.value.replace(/[eE+-]/g, ''))} /></label></div><label className="tw-mt-3 tw-block tw-max-w-[160px]"><span className="tw-block tw-text-xs tw-text-muted">Tax</span><select className="form-select tw-mt-1" value={pricing.tax} onChange={(event) => updatePricing('tax', event.target.value)}><option>GST 12%</option><option>GST 5%</option><option>Tax exempt</option></select></label><p className="tw-mt-3 tw-text-xs tw-text-muted">Compare-at price shows struck through on the storefront. Cost is private and only used to work out your margin.</p><div className="tw-my-4 tw-border-0 tw-border-t tw-border-solid tw-border-hair" /><div className="tw-text-sm tw-font-semibold">Discount</div><div className="tw-mt-3 tw-grid tw-gap-3 sm:tw-grid-cols-3"><label><span className="tw-block tw-text-xs tw-text-muted">Type</span><select className="form-select tw-mt-1" value={discount.type} onChange={(event) => updateDiscount('type', event.target.value)}><option>Percentage off</option><option>Fixed amount off</option></select></label><label><span className="tw-block tw-text-xs tw-text-muted">Value</span><input inputMode="numeric" className="form-control tw-mt-1" value={discount.value} onChange={(event) => updateDiscount('value', event.target.value.replace(/[eE+-]/g, ''))} /></label><label><span className="tw-block tw-text-xs tw-text-muted">Starts</span><input type="date" className="form-control tw-mt-1" value={discount.starts} onChange={(event) => updateDiscount('starts', event.target.value)} /></label><label><span className="tw-block tw-text-xs tw-text-muted">Ends</span><input type="date" className="form-control tw-mt-1" value={discount.ends} onChange={(event) => updateDiscount('ends', event.target.value)} /></label></div><label className="tw-mt-3 tw-flex tw-items-center tw-gap-2 tw-text-sm"><input type="checkbox" checked={discount.showBadge} onChange={(event) => updateDiscount('showBadge', event.target.checked)} /> Show a “Sale” badge on the storefront</label><div className="tw-mt-3 tw-rounded-lg tw-bg-[var(--c-success-bg)] tw-p-3 tw-text-xs tw-text-[var(--c-success-ink)]">Customers pay <strong>₹{pricing.base || '0'}</strong> · Your margin is calculated from the private cost.</div></Card>
        <Card title="Variants"><VariantsTable variants={product.variants} colours={colours} onChange={changeVariants} onSetAllPrices={setAllPrices} />{errors.variants && <p className="tw-mt-2 tw-text-danger">{errors.variants}</p>}{errors.variantFields && <p className="tw-mt-2 tw-text-danger">{errors.variantFields}</p>}{errors.sku && <p className="tw-mt-2 tw-text-danger">{errors.sku}</p>}</Card>
        <Card title="Photos"><div className="tw-mb-3 tw-flex tw-justify-end tw-text-xs tw-text-muted">Photo 1 is the main image · drag to reorder</div><label htmlFor="product-images" className="tw-flex tw-cursor-pointer tw-flex-col tw-items-center tw-rounded-lg tw-border tw-border-dashed tw-border-line tw-p-7 tw-text-center"><span className="tw-font-medium">Drag photos here to upload</span><span className="tw-mt-2 tw-text-xs tw-text-muted">JPG, PNG or WebP · up to 5 MB each · portrait 3:4 works best</span><span className="tw-mt-3 tw-rounded-md tw-border tw-border-solid tw-border-[var(--c-brand)] tw-px-3 tw-py-2 tw-text-xs tw-text-[var(--c-brand)]">Browse files</span></label><input id="product-images" type="file" accept="image/jpeg,image/png,image/webp" multiple className="tw-hidden" onChange={uploadImages} />{imageErrors.map((error) => <p role="alert" key={error} className="tw-mt-2 tw-text-sm tw-text-danger">{error}</p>)}<div className="tw-mt-3 tw-grid tw-grid-cols-2 tw-gap-3 sm:tw-grid-cols-4">{imageList.map((image, index) => { const colour = photoColour(index); const background = colour && HEX_PATTERN.test(colour.hex) ? colour.hex : '#808080'; const isSafeImage = image.startsWith('blob:') || URL_PATTERN.test(image); return <div key={`${image}-${index}`} className="tw-min-w-0"><div className="tw-relative tw-flex tw-h-44 tw-items-center tw-justify-center tw-overflow-hidden tw-rounded-lg tw-text-xs tw-text-white" style={{ background }}>{isSafeImage ? <img src={image} alt={photoDetails[index]?.alt || `Product photo ${index + 1}`} className="tw-h-full tw-w-full tw-object-cover" /> : <span>Photo{index + 1}</span>}{index === 0 && <span className="tw-absolute tw-left-1 tw-top-1 tw-rounded tw-bg-black/75 tw-px-2 tw-py-1 tw-text-[10px]">Main</span>}<button type="button" aria-label={`Remove photo ${index + 1}`} onClick={() => removeImage(image, index)} className="tw-absolute tw-right-1 tw-top-1 tw-flex tw-h-7 tw-w-7 tw-items-center tw-justify-center tw-rounded-md tw-bg-white tw-text-sm tw-text-danger">×</button></div><select aria-label={`Colour for photo ${index + 1}`} value={photoDetails[index]?.colourId || colours[0]?.id || ''} onChange={(event) => updatePhoto(index, 'colourId', event.target.value)} className="form-select tw-mt-2 tw-h-9 tw-text-xs">{colours.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select><input aria-label={`Alt text for photo ${index + 1}`} maxLength={125} value={photoDetails[index]?.alt || ''} onChange={(event) => updatePhoto(index, 'alt', clean(event.target.value, 125))} placeholder="Alt text" className="form-control tw-mt-2 tw-h-9 tw-text-xs" /></div>; })}</div><p className="tw-mt-3 tw-text-xs tw-text-muted">Assign each photo to a colour. When a customer taps a swatch, they see that colour's photos first.</p></Card>
      </div>
      <div className="tw-flex tw-min-w-0 tw-flex-col tw-gap-5"><Card title="Publishing"><Form.Group><Form.Label htmlFor="product-status">Status</Form.Label><Form.Select id="product-status" value={product.status} onChange={(event) => update('status', event.target.value)}>{Object.entries(PRODUCT_STATUSES).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</Form.Select></Form.Group><Form.Group className="tw-mt-3"><Form.Label htmlFor="product-category">Category</Form.Label><Form.Select id="product-category" value={product.category} onChange={(event) => update('category', event.target.value)}>{categories.map((category) => <option key={category}>{category}</option>)}</Form.Select></Form.Group></Card><Card title="Storefront preview"><div className="tw-rounded-lg tw-bg-page tw-p-3"><p className="tw-text-sm tw-font-semibold">Colour: {colours[0]?.name || 'None'}</p><div className="tw-mt-3 tw-flex tw-gap-2">{colours.slice(0, 4).map((colour) => <span key={colour.id} title={colour.name} aria-label={colour.name} className="tw-h-6 tw-w-6 tw-rounded-full tw-border-2 tw-border-white tw-shadow" style={{ background: colour.hex }} />)}</div><div className="tw-mt-3 tw-flex tw-gap-1">{sizes.slice(0, 4).map((size) => <span key={size} className="tw-rounded tw-border tw-border-solid tw-border-line tw-bg-card tw-px-2 tw-py-1 tw-text-[10px]">{size}</span>)}</div><p className="tw-mt-3 tw-font-semibold">₹{pricing.base || product.variants[0]?.price || '0'}</p></div><p className="tw-mt-3 tw-text-xs tw-text-muted">This is what customers see. The swatch colours come from the hex codes you set here.</p></Card><Card title="SEO"><Form.Label htmlFor="seo-title">SEO title</Form.Label><Form.Control id="seo-title" maxLength={120} value={product.seo?.title || ''} onChange={(event) => update('seo', { ...product.seo, title: clean(event.target.value, 120) })} /><Form.Label className="tw-mt-3" htmlFor="seo-description">SEO description</Form.Label><Form.Control id="seo-description" as="textarea" rows={4} maxLength={320} value={product.seo?.description || ''} onChange={(event) => update('seo', { ...product.seo, description: clean(event.target.value, 320) })} /><p className="tw-mt-2 tw-text-xs tw-text-muted">Title {product.seo?.title?.length || 0}/60 · Description {product.seo?.description?.length || 0}/160</p><div className="tw-mt-3 tw-text-sm tw-font-semibold">Tags and keywords</div><div className="tw-mt-2 tw-flex tw-flex-wrap tw-gap-1">{(product.tags || []).map((tag) => <span key={tag} className="tw-rounded-full tw-bg-[var(--c-success-bg)] tw-px-2 tw-py-1 tw-text-xs">{tag} ×</span>)}</div><input maxLength={40} className="form-control tw-mt-2" placeholder="Type a tag and press Enter" onKeyDown={(event) => { if (event.key === 'Enter' && event.currentTarget.value.trim()) { event.preventDefault(); update('tags', [...(product.tags || []), clean(event.currentTarget.value, 40)]); event.currentTarget.value = ''; } }} /><div className="tw-mt-4 tw-rounded-lg tw-border tw-border-solid tw-border-line tw-p-3"><div className="tw-text-xs tw-text-muted">Google preview</div><div className="tw-mt-2 tw-text-sm tw-text-[var(--c-brand)]">{product.seo?.title || product.name || 'Product title'}</div><p className="tw-mt-1 tw-text-xs tw-text-muted">{product.seo?.description || product.description || 'Product description'}</p></div><label className="tw-mt-3 tw-flex tw-items-center tw-gap-2 tw-text-sm"><input type="checkbox" checked={hideFromSearch} onChange={(event) => { setHideFromSearch(event.target.checked); setDirty(true); }} /> Hide this product from search engines</label></Card></div>
    </div>
  </form>;
}
