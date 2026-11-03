import { useState } from 'react';
import { variantFieldError as fieldError } from '../productUtils';

export default function VariantsTable({ variants, colours, onChange, onSetAllPrices }) {
  const [bulkPrice, setBulkPrice] = useState('');
  const [bulkError, setBulkError] = useState('');
  const update = (id, field, value) => onChange(variants.map((variant) => variant.id === id ? { ...variant, [field]: value } : variant));
  const setPrices = () => {
    if (!/^\d+$/.test(bulkPrice) || Number(bulkPrice) <= 0 || Number(bulkPrice) > 10000000) {
      setBulkError('Enter a whole amount between 1 and 10,000,000.');
      return;
    }
    setBulkError('');
    onSetAllPrices(bulkPrice);
  };
  const zeroStock = variants.filter((variant) => Number(variant.stock) === 0).length;
  return <div>
    <div className="tw-flex tw-flex-wrap tw-items-end tw-justify-between tw-gap-2">
      <span className="tw-text-sm tw-font-semibold">Variants · {variants.length}</span>
      <div className="tw-flex tw-items-end tw-gap-2"><label><span className="tw-block tw-text-xs tw-text-muted">Set all prices</span><input aria-label="Set all prices" inputMode="numeric" className="form-control tw-mt-1 tw-h-9 tw-w-28" value={bulkPrice} onChange={(event) => setBulkPrice(event.target.value.replace(/[eE+-]/g, ''))} /></label><button type="button" onClick={setPrices} className="tw-h-9 tw-rounded-md tw-border tw-border-[var(--c-brand)] tw-bg-card tw-px-3 tw-text-xs tw-text-[var(--c-brand)]">Apply</button></div>
    </div>
    {bulkError && <p role="alert" className="tw-mt-1 tw-text-sm tw-text-danger">{bulkError}</p>}
    <div className="tw-mt-4 tw-overflow-x-auto"><table className="admin-table tw-min-w-[760px]"><thead><tr>{['Variant', 'SKU', 'Price', 'Sale price', 'Stock'].map((heading) => <th key={heading} className="tw-text-xs tw-uppercase tw-text-muted">{heading}</th>)}</tr></thead><tbody>{variants.map((variant) => {
      const colour = colours.find((item) => item.id === variant.colourId);
      return <tr key={variant.id}>
        <td><span className="tw-inline-flex tw-items-center tw-gap-2"><span aria-hidden="true" className="tw-h-3 tw-w-3 tw-rounded-full" style={{ background: colour?.hex }} />{variant.size} / {colour?.name}</span></td>
        <td><input aria-label={`SKU for ${variant.size} ${colour?.name}`} aria-invalid={Boolean(variant.skuError)} className="form-control tw-h-9 tw-w-40" value={variant.sku} onChange={(event) => update(variant.id, 'sku', event.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, ''))} /></td>
        {['price', 'salePrice', 'stock'].map((field) => <td key={field}><input aria-label={`${field} for ${variant.size} ${colour?.name}`} inputMode="numeric" aria-invalid={Boolean(fieldError(variant, field))} className={`form-control tw-h-9 tw-w-28 ${Number(variant.stock) === 0 && field === 'stock' ? 'tw-bg-amber-50' : ''}`} value={variant[field] ?? ''} onChange={(event) => update(variant.id, field, event.target.value.replace(/[eE+-]/g, ''))} />{fieldError(variant, field) && <span className="tw-block tw-text-xs tw-text-danger">{fieldError(variant, field)}</span>}</td>)}
      </tr>;
    })}</tbody></table></div>
    {zeroStock > 0 && <div role="status" className="tw-mt-3 tw-rounded-md tw-bg-amber-50 tw-p-3 tw-text-sm tw-text-amber-900">{zeroStock} variant{zeroStock > 1 ? 's have' : ' has'} zero stock. Customers cannot order these.</div>}
  </div>;
}
