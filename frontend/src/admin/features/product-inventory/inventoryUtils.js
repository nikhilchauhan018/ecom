export function getInventoryStatus(available, threshold, allowBackorders = false) {
  if (available <= 0) return allowBackorders ? 'backorder' : 'out_of_stock';
  if (available <= threshold) return 'low';
  return 'in_stock';
}

export function getAvailableStock(onHand, reserved) {
  return Math.max(0, onHand - reserved);
}

export const STOCK_ADJUSTMENT_REASONS = ['received', 'damaged', 'correction', 'return', 'other'];

export function escapeInventoryCsvCell(value) {
  const text = String(value ?? '');
  const safe = /^[=+\-@]/.test(text) ? `'${text}` : text;
  return `"${safe.replaceAll('"', '""')}"`;
}

export function exportInventoryCsv(rows) {
  const headers = ['product', 'variant', 'sku', 'onHand', 'reserved', 'available', 'threshold', 'status'];
  return [headers.join(','), ...rows.map((row) => headers.map((header) => escapeInventoryCsvCell(row[header === 'product' ? 'productName' : header])).join(','))].join('\n');
}

export function parseInventoryCsv(csv) {
  return csv.trim().split(/\r?\n/).slice(1).filter(Boolean).map((line) => {
    const [variantId, threshold] = line.split(',').map((value) => value.trim());
    return { variantId, threshold };
  });
}

export function validateInventoryImport(rows, validVariantIds = null) {
  return rows.flatMap((row, index) => {
    const errors = [];
    if (!row.variantId) errors.push({ row: index + 2, column: 'variantId', message: 'Variant ID is required.' });
    if (validVariantIds && !validVariantIds.has(row.variantId)) errors.push({ row: index + 2, column: 'variantId', message: 'Variant ID does not exist.' });
    if (row.threshold === '' || !Number.isFinite(Number(row.threshold)) || Number(row.threshold) < 0) errors.push({ row: index + 2, column: 'threshold', message: 'Threshold must be a non-negative number.' });
    return errors;
  });
}
