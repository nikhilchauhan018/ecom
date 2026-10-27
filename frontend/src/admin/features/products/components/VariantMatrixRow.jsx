import { memo } from 'react';
import Form from 'react-bootstrap/Form';
import { formatMoney } from '../../../utils/formatMoney';

export default memo(function VariantMatrixRow({ variant, onChange, onRemove }) {
  const update = (key, value) => onChange(variant.id, { ...variant, [key]: key === 'price' || key === 'salePrice' || key === 'cost' || key === 'stock' ? Number(value) || 0 : value });
  return <tr>
    <td>{variant.options.size}</td><td>{variant.options.color}</td>
    <td><Form.Control aria-label={`SKU for ${variant.options.size} ${variant.options.color}`} defaultValue={variant.sku} onBlur={(event) => update('sku', event.target.value)} /></td>
    <td><Form.Control aria-label={`Price for ${variant.options.size} ${variant.options.color}`} type="number" min="0" defaultValue={variant.price} onBlur={(event) => update('price', event.target.value)} /></td>
    <td><Form.Control aria-label={`Sale price for ${variant.options.size} ${variant.options.color}`} type="number" min="0" defaultValue={variant.salePrice || ''} onBlur={(event) => update('salePrice', event.target.value)} /></td>
    <td><Form.Control aria-label={`Stock for ${variant.options.size} ${variant.options.color}`} type="number" min="0" defaultValue={variant.stock} onBlur={(event) => update('stock', event.target.value)} /></td>
    <td className="tw-whitespace-nowrap">{formatMoney(variant.cost)}</td>
    <td><button type="button" aria-label={`Remove ${variant.options.size} ${variant.options.color}`} onClick={() => onRemove(variant.id)} className="tw-border-0 tw-bg-transparent tw-text-danger">Remove</button></td>
  </tr>;
});
