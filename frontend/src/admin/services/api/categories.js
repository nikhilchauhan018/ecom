import { categoriesMock } from '../../data/categories.mock.js';

const delay = (value) => new Promise((resolve) => setTimeout(() => resolve(value), 120));

export async function listCategories({ search = '', status = '', parentId = '' } = {}) {
  const query = search.trim().toLowerCase();
  const filtered = categoriesMock.filter((category) => (!query || `${category.name} ${category.slug}`.toLowerCase().includes(query)) && (!status || category.status === status) && (!parentId || category.parentId === parentId));
  const data = [];
  const append = (parentId, depth) => {
    categoriesMock.filter((category) => category.parentId === parentId && filtered.includes(category)).sort((left, right) => left.name.localeCompare(right.name)).forEach((category) => {
      data.push({ ...category, depth });
      append(category.id, depth + 1);
    });
  };
  append(parentId || null, 0);
  return delay({ data, meta: { total: data.length } });
}

export async function getCategory(id) {
  return delay(categoriesMock.find((category) => category.id === String(id)) ?? null);
}

export async function createCategory(payload) {
  const category = { ...payload, id: `cat-${Date.now()}`, productCount: 0 };
  categoriesMock.unshift(category);
  return delay(category);
}

export async function updateCategory(id, payload) {
  const category = categoriesMock.find((item) => item.id === String(id));
  if (!category) return delay(null);
  Object.assign(category, payload);
  return delay(category);
}

export async function deleteCategory(id) {
  const index = categoriesMock.findIndex((category) => category.id === String(id));
  if (index < 0) return delay({ deleted: false });
  if (categoriesMock[index].productCount > 0) return delay({ deleted: false, reason: 'Category contains products.' });
  if (categoriesMock.some((category) => category.parentId === String(id))) return delay({ deleted: false, reason: 'Category contains child categories.' });
  categoriesMock.splice(index, 1);
  return delay({ deleted: true });
}
