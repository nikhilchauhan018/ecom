import { ordersMock } from '../../data/orders.mock.js';
import { productsMock } from '../../data/products.mock.js';
import { inventorySettings } from '../../data/inventory.mock.js';
import { getAvailableStock, getInventoryStatus } from '../../features/product-inventory/inventoryUtils.js';

const delay = (value) => new Promise((resolve) => setTimeout(() => resolve(value), 120));
const openStatuses = new Set(['pending', 'confirmed', 'packed', 'shipped', 'out_for_delivery']);
const stockMovements = [];

function getReservedBySku() {
  const reserved = new Map();
  ordersMock.filter((order) => openStatuses.has(order.status)).forEach((order) => order.items.forEach((item) => {
    reserved.set(item.sku, (reserved.get(item.sku) || 0) + item.qty);
  }));
  return reserved;
}

function inventoryRows() {
  const reserved = getReservedBySku();
  return productsMock.flatMap((product) => product.variants.map((variant) => {
    const reservedQty = reserved.get(variant.sku) || 0;
    const available = getAvailableStock(variant.stock, reservedQty);
    const threshold = variant.lowStockThreshold ?? inventorySettings.lowStockThreshold;
    return {
      id: variant.id,
      productId: product.id,
      productName: product.name,
      category: product.category,
      variant: `${variant.options.size} / ${variant.options.color}`,
      sku: variant.sku,
      image: variant.image,
      onHand: variant.stock,
      reserved: reservedQty,
      available,
      threshold,
      status: getInventoryStatus(available, threshold, inventorySettings.allowBackorders),
      cost: variant.cost,
      updatedAt: product.updatedAt,
    };
  }));
}

export async function listInventory({ search = '', category = '', status = '' } = {}) {
  const query = search.trim().toLowerCase();
  const data = inventoryRows().filter((row) => (!query || `${row.productName} ${row.variant} ${row.sku}`.toLowerCase().includes(query))
    && (!category || row.category === category)
    && (!status || row.status === status));
  return delay({ data, meta: { total: data.length } });
}

export async function getInventoryCategories() {
  return delay([...new Set(productsMock.map((product) => product.category))].sort());
}

export async function getInventoryVariantIds() {
  return delay(productsMock.flatMap((product) => product.variants.map((variant) => variant.id)));
}

export async function updateInventorySettings(payload) {
  if (payload.lowStockThreshold !== undefined) {
    inventorySettings.lowStockThreshold = Math.max(0, Number(payload.lowStockThreshold) || 0);
  }
  if (payload.allowBackorders !== undefined) inventorySettings.allowBackorders = Boolean(payload.allowBackorders);
  return delay({ ...inventorySettings });
}

export async function getInventorySettings() {
  return delay({ ...inventorySettings });
}

export async function bulkUpdateInventory(rows) {
  const updated = rows.map(({ variantId, threshold }) => {
    const product = productsMock.find((item) => item.variants.some((variant) => variant.id === String(variantId)));
    const variant = product?.variants.find((item) => item.id === String(variantId));
    if (!variant) return null;
    variant.lowStockThreshold = Math.max(0, Number(threshold) || 0);
    return variant.id;
  }).filter(Boolean);
  return delay({ updated: updated.length });
}

export async function importInventory(rows) {
  const validIds = new Set(productsMock.flatMap((product) => product.variants.map((variant) => variant.id)));
  const validRows = rows.filter((row) => validIds.has(row.variantId));
  const result = await bulkUpdateInventory(validRows.map((row) => ({ variantId: row.variantId, threshold: row.threshold })));
  return { ...result, skipped: rows.length - validRows.length };
}

export async function getInventorySummary() {
  const rows = inventoryRows();
  return delay({
    totalSkus: rows.length,
    lowStockCount: rows.filter((row) => row.status === 'low').length,
    outOfStockCount: rows.filter((row) => row.status === 'out_of_stock').length,
    inventoryValue: rows.reduce((total, row) => total + row.cost * row.onHand, 0),
  });
}

export async function adjustStock(variantId, { delta, set, reason, note = '' }) {
  if (!reason) return delay({ updated: false, error: 'A stock adjustment reason is required.' });
  const variant = productsMock.flatMap((product) => product.variants).find((item) => item.id === String(variantId));
  if (!variant) return delay({ updated: false, error: 'Variant not found.' });
  const previous = variant.stock;
  const next = set === undefined ? Math.max(0, previous + Number(delta || 0)) : Math.max(0, Number(set) || 0);
  variant.stock = next;
  const movement = { id: `movement-${Date.now()}`, variantId: variant.id, type: reason, change: next - previous, balanceAfter: next, note, user: 'Owner', date: new Date().toISOString() };
  stockMovements.unshift(movement);
  return delay({ updated: true, data: movement });
}

export async function getStockMovements(variantId) {
  return delay(stockMovements.filter((movement) => movement.variantId === String(variantId)));
}
