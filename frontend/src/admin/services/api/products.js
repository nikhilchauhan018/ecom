import { categories, productsMock } from '../../data/products.mock';
import { getStockState } from '../../features/products/productUtils';

const delay = (value) => new Promise((resolve) => setTimeout(() => resolve(value), 120));

export async function getProductCategories() {
  return delay(categories);
}

export async function listProducts({ page = 1, pageSize = 20, search = '', category = '', status = '', stockState = '', priceMin = '', priceMax = '', sort = 'updatedAt', order = 'desc' } = {}) {
  const query = search.trim().toLowerCase();
  const filtered = productsMock.filter((product) => {
    const variants = product.variants;
    return (!query || `${product.name} ${product.slug} ${variants.map((variant) => variant.sku).join(' ')}`.toLowerCase().includes(query))
      && (!category || product.category === category)
      && (!status || product.status === status)
      && (!stockState || getStockState(product) === stockState)
      && (!priceMin || variants.some((variant) => variant.price >= Number(priceMin)))
      && (!priceMax || variants.some((variant) => variant.price <= Number(priceMax)));
  }).sort((left, right) => (left[sort] > right[sort] ? 1 : left[sort] < right[sort] ? -1 : 0) * (order === 'asc' ? 1 : -1));
  const normalizedPage = Math.max(1, Number(page) || 1);
  const normalizedPageSize = Math.min(100, Math.max(1, Number(pageSize) || 20));
  const start = (normalizedPage - 1) * normalizedPageSize;
  return delay({ data: filtered.slice(start, start + normalizedPageSize), meta: { page: normalizedPage, pageSize: normalizedPageSize, total: filtered.length, totalPages: Math.ceil(filtered.length / normalizedPageSize) } });
}

export async function getProduct(id) {
  return delay(productsMock.find((product) => product.id === String(id)) ?? null);
}

export async function createProduct(payload) {
  const product = { ...payload, id: `product-${Date.now()}` };
  productsMock.unshift(product);
  return delay(product);
}

export async function updateProduct(id, payload) {
  const product = productsMock.find((item) => item.id === String(id));
  if (!product) return delay(null);
  Object.assign(product, payload);
  return delay(product);
}

export async function duplicateProduct(id) {
  const source = productsMock.find((product) => product.id === String(id));
  if (!source) return delay(null);
  const copy = structuredClone(source);
  copy.id = `product-${Date.now()}`;
  copy.name = `Copy of ${source.name}`;
  copy.slug = `${source.slug}-copy-${Date.now()}`;
  copy.status = 'draft';
  copy.variants = copy.variants.map((variant, index) => ({ ...variant, id: `${copy.id}-variant-${index + 1}`, sku: `${variant.sku}-COPY-${Date.now()}` }));
  productsMock.unshift(copy);
  return delay(copy);
}

export async function deleteProduct(id) {
  const index = productsMock.findIndex((product) => product.id === String(id));
  if (index < 0) return delay({ deleted: false });
  productsMock.splice(index, 1);
  return delay({ deleted: true });
}

export async function importProducts(rows) {
  const imported = rows.map((row, index) => {
    const price = Number(row.price);
    const salePrice = row.salePrice === '' ? null : Number(row.salePrice);
    return {
      id: `product-import-${Date.now()}-${index}`,
      name: row.name,
      slug: row.slug || row.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
      description: '',
      category: row.category,
      status: row.status,
      updatedAt: new Date().toISOString(),
      images: [],
      variants: [{
        id: `variant-import-${Date.now()}-${index}`,
        sku: row.sku,
        barcode: row.barcode || '',
        options: { size: row.size || 'One size', color: row.color || 'Default' },
        price,
        salePrice,
        cost: Number(row.cost) || 0,
        stock: Number(row.stock) || 0,
        image: '',
      }],
    };
  });
  productsMock.unshift(...imported);
  return delay({ imported: imported.length, data: imported });
}
