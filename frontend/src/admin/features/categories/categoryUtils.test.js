import test from 'node:test';
import assert from 'node:assert/strict';
import { categoryParentName, categoryTree, escapeCategoryCsvCell, exportCategoriesCsv, slugifyCategory, validateCategory } from './categoryUtils.js';

test('slugifies category names', () => assert.equal(slugifyCategory('  Men & Women  '), 'men-women'));
test('groups categories by parent', () => {
  const tree = categoryTree([{ id: 'root', parentId: null }, { id: 'child', parentId: 'root' }]);
  assert.equal(tree.get('__root__').length, 1);
  assert.equal(tree.get('root').length, 1);
  assert.equal(tree.get('root')[0].id, 'child');
});
test('validates required and duplicate category fields', () => {
  const categories = [{ id: 'cat-1', name: 'Shirts', slug: 'shirts' }];
  assert.equal(validateCategory({ name: '', slug: '' }, categories).name, 'Category name is required.');
  assert.equal(validateCategory({ name: 'shirts', slug: 'shirts-2' }, categories).name, 'Category name or slug already exists.');
  assert.deepEqual(validateCategory({ name: 'Shoes', slug: 'shoes' }, categories), {});
});
test('resolves a category parent name', () => {
  assert.equal(categoryParentName({ parentId: 'cat-1' }, [{ id: 'cat-1', name: 'Shirts' }]), 'Shirts');
  assert.equal(categoryParentName({ parentId: null }, []), '—');
});
test('exports categories with formula-safe CSV cells', () => {
  assert.equal(escapeCategoryCsvCell('=SUM(A1:A2)'), '"\'=SUM(A1:A2)"');
  assert.match(exportCategoriesCsv([{ name: 'Shirts', slug: 'shirts', status: 'active', productCount: 2 }]), /Shirts/);
});
