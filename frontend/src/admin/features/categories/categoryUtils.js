export function slugifyCategory(value) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export function categoryTree(categories) {
  const byParent = new Map();
  categories.forEach((category) => {
    const key = category.parentId || '__root__';
    byParent.set(key, [...(byParent.get(key) || []), category]);
  });
  return byParent;
}

export function validateCategory({ name, slug }, categories = [], id = '') {
  const errors = {};
  if (!name?.trim()) errors.name = 'Category name is required.';
  if (!slug?.trim()) errors.slug = 'Slug is required.';
  const duplicate = categories.some((category) => category.id !== id && (category.slug === slug.trim() || category.name.toLowerCase() === name.trim().toLowerCase()));
  if (duplicate) errors.name = 'Category name or slug already exists.';
  return errors;
}

export function categoryParentName(category, categories = []) {
  return categories.find((item) => item.id === category.parentId)?.name || '—';
}

export function escapeCategoryCsvCell(value) {
  const text = String(value ?? '');
  const safe = /^[=+\-@]/.test(text) ? `'${text}` : text;
  return `"${safe.replaceAll('"', '""')}"`;
}

export function exportCategoriesCsv(categories) {
  const header = ['name', 'slug', 'parentId', 'status', 'productCount'];
  const rows = categories.map((category) => header.map((key) => escapeCategoryCsvCell(category[key])).join(','));
  return [header.join(','), ...rows].join('\n');
}
