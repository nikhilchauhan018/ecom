import test from 'node:test';
import assert from 'node:assert/strict';
import { listCategories } from '../../services/api/categories.js';

test('lists categories by status and parent', async () => {
  const result = await listCategories({ status: 'active', parentId: 'cat-shirts' });
  assert.ok(result.data.length > 0);
  assert.ok(result.data.every((category) => category.parentId === 'cat-shirts' && category.status === 'active'));
});
