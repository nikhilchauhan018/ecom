import { PRODUCT_STATUSES } from './productConstants.js';

export function slugify(value) {
  return String(value).trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export function validatePrice({ price, salePrice }) {
  const parsedPrice = Number(price);
  const parsedSale = salePrice === '' || salePrice == null ? null : Number(salePrice);
  const errors = {};
  if (!Number.isFinite(parsedPrice) || parsedPrice < 0) errors.price = 'Price must be zero or greater.';
  if (parsedSale !== null && (!Number.isFinite(parsedSale) || parsedSale < 0)) errors.salePrice = 'Sale price must be zero or greater.';
  if (parsedSale !== null && Number.isFinite(parsedPrice) && parsedSale >= parsedPrice) errors.salePrice = 'Sale price must be lower than price.';
  return errors;
}

export function variantFieldError(variant, field) {
  const value = variant[field];
  if (field === 'price' && (!/^\d+$/.test(String(value)) || Number(value) <= 0 || Number(value) > 10000000)) return 'Enter a whole amount between 1 and 10,000,000.';
  if (field === 'salePrice' && value !== '' && value !== null && (!/^\d+$/.test(String(value)) || Number(value) <= 0 || Number(value) >= Number(variant.price))) return 'Sale price must be lower than price.';
  if (field === 'stock' && (!/^\d+$/.test(String(value)) || Number(value) < 0 || Number(value) > 100000)) return 'Enter stock from 0 to 100,000.';
  return '';
}

export function getStockState(product) {
  const stock = product.variants.reduce((sum, variant) => sum + variant.stock, 0);
  return stock === 0 ? 'out_of_stock' : stock < 10 ? 'low' : 'in_stock';
}

export function generateVariants({ sizes, colors, existing = [] }) {
  const existingByOptions = new Map(existing.map((variant) => [`${variant.size || variant.options?.size}|${variant.colourId || variant.options?.color}`, variant]));
  return sizes.flatMap((size) => colors.map((color) => {
    const colourId = typeof color === 'string' ? color : color.id;
    const colourName = typeof color === 'string' ? color : color.name;
    const key = `${size}|${colourId}`;
    const previous = existingByOptions.get(key);
    if (previous) return { ...previous, size, colourId, options: { ...(previous.options || {}), size, color: colourName } };
    return {
      id: `variant-${slugify(key)}`,
      sku: `PROD-${slugify(key).toUpperCase()}`,
      barcode: '',
      size,
      colourId,
      options: { size, color: colourName },
      price: '',
      salePrice: null,
      cost: 0,
      stock: 0,
      image: '',
    };
  }));
}

export function removedVariantsWithData(previous, next) {
  const nextKeys = new Set(next.map((variant) => `${variant.size || variant.options?.size}|${variant.colourId || variant.options?.color}`));
  return previous.filter((variant) => !nextKeys.has(`${variant.size || variant.options?.size}|${variant.colourId || variant.options?.color}`) && Number(variant.stock) > 0);
}

export function escapeCsvCell(value) {
  const text = String(value ?? '');
  const safe = /^[=+\-@]/.test(text) ? `'${text}` : text;
  return `"${safe.replaceAll('"', '""')}"`;
}

export function exportProductsCsv(products) {
  const rows = [['name', 'slug', 'sku', 'price', 'salePrice', 'status'], ...products.map((product) => [product.name, product.slug, product.variants[0]?.sku, product.variants[0]?.price, product.variants[0]?.salePrice ?? '', product.status])];
  return rows.map((row) => row.map(escapeCsvCell).join(',')).join('\n');
}

export function parseCsv(text) {
  return text.trim().split(/\r?\n/).filter(Boolean).map((line) => line.split(',').map((cell) => cell.trim().replace(/^"|"$/g, '')));
}

export function validateProductRows(rows, categories = []) {
  const errors = [];
  const seenSkus = new Set();
  rows.forEach((row, index) => {
    const line = index + 2;
    if (!row.name) errors.push({ row: line, column: 'name', message: 'Name is required.' });
    if (!row.sku) errors.push({ row: line, column: 'sku', message: 'SKU is required.' });
    if (seenSkus.has(row.sku)) errors.push({ row: line, column: 'sku', message: 'SKU must be unique.' });
    seenSkus.add(row.sku);
    if (!Number.isFinite(Number(row.price))) errors.push({ row: line, column: 'price', message: 'Price must be numeric.' });
    if (row.salePrice !== '' && Number(row.salePrice) >= Number(row.price)) errors.push({ row: line, column: 'salePrice', message: 'Sale price must be lower than price.' });
    if (!PRODUCT_STATUSES[row.status]) errors.push({ row: line, column: 'status', message: 'Status is invalid.' });
    if (categories.length && !categories.includes(row.category)) errors.push({ row: line, column: 'category', message: 'Category does not exist.' });
  });
  return errors;
}
import { PRODUCT_CSV_MAX_BYTES, PRODUCT_CSV_MAX_ROWS } from './productConstants.js';

export function validateCsvLimits(fileSize, rowCount) {
  const errors = [];
  if (fileSize > PRODUCT_CSV_MAX_BYTES) errors.push('CSV file must be 5 MB or smaller.');
  if (rowCount > PRODUCT_CSV_MAX_ROWS) errors.push(`CSV file must contain ${PRODUCT_CSV_MAX_ROWS} rows or fewer.`);
  return errors;
}
