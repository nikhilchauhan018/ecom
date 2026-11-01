export const FILTER_KEYS = ['gender', 'category', 'size', 'color', 'price', 'rating', 'discount', 'fabric', 'inStock', 'sort', 'page'];
const LIST_KEYS = ['gender', 'category', 'size', 'color', 'fabric'];
const ALLOWED_SORTS = ['newest', 'price-asc', 'price-desc', 'rating', 'discount'];
const ALLOWED_VALUES = {
  gender: ['women', 'men', 'girls', 'boys', 'unisex'],
  category: ['kurtis', 'dresses', 'tops', 'bottoms', 'shirts', 'outerwear'],
  size: ['xs', 's', 'm', 'l', 'xl', 'xxl'],
  color: ['black', 'white', 'olive', 'navy', 'maroon', 'beige', 'pink', 'blue'],
  fabric: ['cotton', 'linen', 'denim', 'rayon'],
};

const cleanList = (value) => [...new Set(String(value || '').split(',').map((item) => item.trim()).filter(Boolean))].sort();

/**
 * Parses and validates storefront filter query parameters.
 * @param {URLSearchParams} searchParams
 * @returns {Record<string, any>}
 */
export function parseFilters(searchParams) {
  const filters = {};
  LIST_KEYS.forEach((key) => {
    const values = cleanList(searchParams.get(key)).filter((value) => ALLOWED_VALUES[key].includes(value));
    if (values.length) filters[key] = values;
  });
  const price = (searchParams.get('price') || '').match(/^(\d+)-(\d+)$/);
  if (price && Number(price[1]) <= Number(price[2])) filters.price = [Number(price[1]), Number(price[2])];
  const rating = Number(searchParams.get('rating'));
  if ([2, 3, 4].includes(rating)) filters.rating = rating;
  const discount = Number(searchParams.get('discount'));
  if ([10, 20, 30, 50].includes(discount)) filters.discount = discount;
  if (searchParams.get('inStock') === '1') filters.inStock = true;
  const sort = searchParams.get('sort');
  if (ALLOWED_SORTS.includes(sort)) filters.sort = sort;
  const page = Number(searchParams.get('page'));
  filters.page = Number.isInteger(page) && page > 0 ? page : 1;
  const query = searchParams.get('q')?.trim();
  if (query) filters.q = query;
  return filters;
}

/**
 * Serializes filters to a stable, shareable query string.
 * @param {Record<string, any>} filters
 * @returns {string}
 */
export function serializeFilters(filters = {}) {
  const params = new URLSearchParams();
  if (filters.q) params.set('q', filters.q.trim());
  LIST_KEYS.forEach((key) => { if (filters[key]?.length) params.set(key, [...filters[key]].sort().join(',')); });
  if (filters.price?.length === 2) params.set('price', `${filters.price[0]}-${filters.price[1]}`);
  if ([2, 3, 4].includes(filters.rating)) params.set('rating', String(filters.rating));
  if (Number.isInteger(filters.discount) && filters.discount > 0) params.set('discount', String(filters.discount));
  if (filters.inStock) params.set('inStock', '1');
  if (ALLOWED_SORTS.includes(filters.sort)) params.set('sort', filters.sort);
  if (Number.isInteger(filters.page) && filters.page > 1) params.set('page', String(filters.page));
  return params.toString();
}

/**
 * Returns a copy of filters with pagination reset after a filter change.
 * @param {Record<string, any>} filters
 * @returns {Record<string, any>}
 */
export function resetFilterPage(filters) {
  return { ...filters, page: 1 };
}