import { catalogProducts } from '../data/catalog.mock.js';
import { mockHomeData } from '../data/home.mock';
import { getSettings } from './settings.js';
import { fromMinor } from '../utils/money.js';

const wait = (signal) => new Promise((resolve, reject) => {
  const timer = setTimeout(resolve, 12);
  signal?.addEventListener('abort', () => { clearTimeout(timer); reject(new DOMException('Aborted', 'AbortError')); }, { once: true });
});

const matches = (product, params) => {
  if (params.q && !`${product.name} ${product.category} ${product.fabric}`.toLowerCase().includes(params.q.toLowerCase())) return false;
  if (params.gender?.length && !params.gender.includes(product.gender)) return false;
  if (params.category?.length && !params.category.includes(product.category)) return false;
  if (params.size?.length && !params.size.includes(product.size)) return false;
  if (params.color?.length && !params.color.includes(product.color)) return false;
  if (params.fabric?.length && !params.fabric.includes(product.fabric)) return false;
  if (params.price && (product.priceMinor < params.price[0] || product.priceMinor > params.price[1])) return false;
  if (params.rating && product.rating < params.rating) return false;
  if (params.discount && product.discount < params.discount) return false;
  if (params.inStock && !product.inStock) return false;
  return true;
};

const sortProducts = (products, sort) => [...products].sort((a, b) => {
  if (sort === 'price-asc') return a.priceMinor - b.priceMinor;
  if (sort === 'price-desc') return b.priceMinor - a.priceMinor;
  if (sort === 'rating') return b.rating - a.rating;
  if (sort === 'discount') return b.discount - a.discount;
  return b.createdAt - a.createdAt;
});

/**
 * Searches the mock catalog using the API-shaped contract.
 * @param {Record<string, any>} params
 * @param {{signal?: AbortSignal}} [options]
 * @returns {Promise<{data: import('../types/home').Product[], meta: object}>}
 */
export async function searchProducts(params = {}, { signal } = {}) {
  await wait(signal);
  const settings = await getSettings();
  const pageSize = 12;
  const filtered = sortProducts(catalogProducts.filter((product) => matches(product, params)), params.sort);
  const page = Math.max(1, Number(params.page) || 1);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const data = filtered.slice((page - 1) * pageSize, page * pageSize).map((product) => ({
    ...product,
    price: fromMinor(product.priceMinor, settings.currency),
    compareAtPrice: product.compareAtMinor ? fromMinor(product.compareAtMinor, settings.currency) : null,
  }));
  return { data, meta: { page, pageSize, total: filtered.length, totalPages } };
}

/**
 * Returns facet options for the current result set.
 * @param {Record<string, any>} params
 * @param {{signal?: AbortSignal}} [options]
 * @returns {Promise<import('../types/filters').Facets>}
 */
export async function getFacets(params = {}, { signal } = {}) {
  await wait(signal);
  const products = catalogProducts.filter((product) => matches(product, params));
  const count = (key, value) => products.filter((product) => product[key] === value).length;
  const option = (value, label, key = value) => ({ value, label, count: count(key, value) });
  const priceValues = products.map((product) => product.priceMinor);
  return {
    gender: ['women', 'men', 'girls', 'boys', 'unisex'].map((value) => option(value, value[0].toUpperCase() + value.slice(1))).filter((item) => item.count),
    categories: ['kurtis', 'dresses', 'tops', 'bottoms', 'shirts', 'outerwear'].map((value) => option(value, value[0].toUpperCase() + value.slice(1))).filter((item) => item.count),
    price: { min: Math.min(...priceValues, 0), max: Math.max(...priceValues, 0) },
    sizes: ['xs', 's', 'm', 'l', 'xl', 'xxl'].map((value) => ({ ...option(value, value.toUpperCase(), 'size'), group: 'adult' })),
    colors: [['black', 'Black', '#17181a'], ['white', 'White', '#ffffff'], ['olive', 'Olive', '#708238'], ['navy', 'Navy', '#23395d'], ['maroon', 'Maroon', '#812f3c'], ['beige', 'Beige', '#d8c49c'], ['pink', 'Pink', '#e7a0b0'], ['blue', 'Blue', '#4e82b5']].map(([value, label, hex]) => ({ value, label, hex, count: count('color', value) })).filter((item) => item.count),
    ratings: [4, 3, 2].map((min) => ({ min, count: products.filter((product) => product.rating >= min).length })),
    discounts: [10, 20, 30, 50].map((min) => ({ min, count: products.filter((product) => product.discount >= min).length })).filter((item) => item.count),
    fabrics: ['cotton', 'linen', 'denim', 'rayon'].map((value) => option(value, value[0].toUpperCase() + value.slice(1), 'fabric')).filter((item) => item.count),
    inStock: { count: products.filter((product) => product.inStock).length },
  };
}

/**
 * Retrieves one product with storefront detail options.
 * @param {string} slug
 * @returns {Promise<object|null>}
 */
export async function getProductBySlug(slug) {
  const product = [...catalogProducts, ...mockHomeData.newArrivals].find((item) => item.slug === slug);
  if (!product) return null;
  const priceMinor = product.priceMinor ?? Math.round(product.price * 100);
  const compareAtMinor = product.compareAtMinor ?? (product.compareAtPrice ? Math.round(product.compareAtPrice * 100) : null);
  return {
    ...product,
    priceMinor,
    compareAtMinor,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [{ value: 'olive', label: 'Olive', hex: '#708238' }, { value: 'navy', label: 'Navy', hex: '#23395d' }, { value: 'maroon', label: 'Maroon', hex: '#812f3c' }],
    deliveryDays: '5-7',
    availableSizes: product.slug === 'cotton-kurti' ? ['S', 'M', 'L'] : ['S', 'M', 'L', 'XL'],
  };
}

/**
 * Retrieves related products for the product detail recommendations row.
 * @param {string} slug
 * @param {number} [limit=4]
 * @returns {Promise<import('../types/home').Product[]>}
 */
export async function getRelatedProducts(slug, limit = 4) {
  const product = [...catalogProducts, ...mockHomeData.newArrivals].find((item) => item.slug === slug);
  if (!product) return [];
  const category = product.category || (product.name.toLowerCase().includes('kurti') ? 'kurtis' : null);
  const related = catalogProducts.filter((item) => item.slug !== slug && (!category || item.category === category));
  return related.slice(0, limit);
}

/**
 * Resolves cart line ids to storefront products.
 * @param {(string|number)[]} ids
 * @returns {Promise<import('../types/home').Product[]>}
 */
export async function getProductsByIds(ids = []) {
  const allProducts = [...catalogProducts, ...mockHomeData.newArrivals];
  return ids.map((id) => allProducts.find((product) => String(product.id) === String(id))).filter(Boolean);
}