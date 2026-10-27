import { memo } from 'react';
import ProductStatus from './ProductStatus';
import { formatMoney } from '../../../utils/formatMoney';
import { getStockState } from '../productUtils';

export default memo(function ProductRow({ product, selected, onSelect, onEdit, onDelete }) {
  const firstVariant = product.variants[0];
  const stock = product.variants.reduce((sum, variant) => sum + variant.stock, 0);
  const state = getStockState(product);
  return <tr className="hover:tw-bg-page">
    <td><input type="checkbox" aria-label={`Select ${product.name}`} checked={selected} onChange={() => onSelect(product.id)} /></td>
    <td><div className="tw-flex tw-items-center tw-gap-3"><img src={firstVariant.image} alt="" width="44" height="44" loading="lazy" decoding="async" className="tw-h-11 tw-w-11 tw-rounded tw-object-cover tw-bg-page" /><div className="tw-min-w-0"><strong className="tw-block tw-max-w-[220px] tw-truncate">{product.name}</strong><span className="tw-text-xs tw-text-muted">{product.category}</span></div></div></td>
    <td className="tw-whitespace-nowrap">{firstVariant.sku}</td>
    <td className="tw-whitespace-nowrap">{formatMoney(firstVariant.price)}</td>
    <td className="tw-whitespace-nowrap">{firstVariant.salePrice ? formatMoney(firstVariant.salePrice) : '—'}</td>
    <td><span className={state === 'low' ? 'tw-font-semibold tw-text-[var(--c-warning-ink)]' : state === 'out_of_stock' ? 'tw-font-semibold tw-text-[var(--c-danger-ink)]' : ''}>{stock}</span></td>
    <td><ProductStatus status={product.status} /></td>
    <td className="tw-whitespace-nowrap tw-text-muted">{new Date(product.updatedAt).toLocaleDateString()}</td>
    <td><div className="tw-flex tw-gap-1"><button type="button" aria-label={`Edit ${product.name}`} onClick={() => onEdit(product.id)} className="tw-grid tw-h-10 tw-w-10 tw-place-items-center tw-border-0 tw-bg-transparent tw-text-brand">Edit</button><button type="button" aria-label={`Delete ${product.name}`} onClick={() => onDelete(product.id)} className="tw-grid tw-h-10 tw-w-10 tw-place-items-center tw-border-0 tw-bg-transparent tw-text-danger">Delete</button></div></td>
  </tr>;
});
