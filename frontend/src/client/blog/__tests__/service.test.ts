import { beforeEach, describe, expect, it } from 'vitest';
import { emptyPostInput } from '../defaults';
import { createPost, createTerm, deletePost, deleteTerm, getPost, listPosts, listTerms, resetBlogDb, updatePost, updateTerm } from '../services/blogService';
import type { PostsQuery } from '../types';

const base: PostsQuery = { search: '', status: 'all', categoryId: 'all', page: 1, pageSize: 10 };
const post = (over: Record<string, unknown> = {}) => ({ ...emptyPostInput(), title: 'New post', slug: 'new-post', ...over });

beforeEach(() => resetBlogDb());

describe('listPosts', () => {
  it('filters by search, status and category', async () => {
    const s = await listPosts({ ...base, search: 'LINEN' });
    expect(s.ok && s.data.items.map((p) => p.id)).toEqual([2]);
    const d = await listPosts({ ...base, status: 'draft' });
    expect(d.ok && d.data.total).toBe(1);
    const c = await listPosts({ ...base, categoryId: 2 });
    expect(c.ok && c.data.total).toBe(1);
  });
  it('paginates and clamps an out-of-range page', async () => {
    const r = await listPosts({ ...base, pageSize: 5, page: 99 });
    expect(r.ok && r.data.page).toBe(1);
  });
  it('returns copies, so callers cannot change stored data', async () => {
    const a = await listPosts(base);
    if (a.ok && a.data.items[0]) a.data.items[0].title = 'HACKED';
    const b = await listPosts(base);
    expect(b.ok && b.data.items[0]?.title).not.toBe('HACKED');
  });
  it('treats search text as plain text, not as a pattern', async () => {
    const r = await listPosts({ ...base, search: '.*' });
    expect(r.ok && r.data.total).toBe(0);
  });
});

describe('createPost and updatePost', () => {
  it('creates a draft without a publish date', async () => {
    const r = await createPost(post());
    expect(r.ok && r.data.publishedAt).toBeNull();
  });
  it('sets the publish date once and keeps it afterwards', async () => {
    const created = await createPost(post());
    if (!created.ok) throw new Error('expected ok');
    const pub = await updatePost(created.data.id, post({ status: 'published' }));
    if (!pub.ok) throw new Error('expected ok');
    const first = pub.data.publishedAt;
    expect(first).not.toBeNull();
    await updatePost(created.data.id, post({ status: 'draft' }));
    const again = await updatePost(created.data.id, post({ status: 'published' }));
    expect(again.ok && again.data.publishedAt).toBe(first);
  });
  it('ignores client-supplied server fields (id, author, dates)', async () => {
    const r = await createPost({ ...post(), id: 999, author: 'Hacker', publishedAt: '2000-01-01T00:00:00.000Z' });
    expect(r.ok && r.data.id).toBe(5);
    expect(r.ok && r.data.author).toBe('Admin');
    expect(r.ok && r.data.publishedAt).toBeNull();
  });
  it('rejects invalid input with field errors', async () => {
    const r = await createPost(post({ title: '' }));
    expect(!r.ok && r.error.code === 'VALIDATION' && r.error.fieldErrors?.['title']).toBeTruthy();
  });
  it('rejects duplicate permalinks', async () => {
    const r = await createPost(post({ slug: 'care-guide-for-linen-shirts' }));
    expect(!r.ok && r.error.code).toBe('CONFLICT');
  });
  it('rejects a category or tag that does not exist', async () => {
    const c = await createPost(post({ categoryId: 999 }));
    expect(!c.ok && c.error.fieldErrors?.['categoryId']).toBeTruthy();
    const t = await createPost(post({ tagIds: [1, 999] }));
    expect(!t.ok && t.error.fieldErrors?.['tagIds']).toBeTruthy();
  });
  it('returns NOT_FOUND for unknown posts', async () => {
    const r = await updatePost(999, post());
    expect(!r.ok && r.error.code).toBe('NOT_FOUND');
  });
  it('deletes posts', async () => {
    expect((await deletePost(4)).ok).toBe(true);
    expect((await getPost(4)).ok).toBe(false);
    expect((await deletePost(4)).ok).toBe(false);
  });
});

describe('categories and tags', () => {
  it('counts posts per term', async () => {
    const r = await listTerms('tag');
    expect(r.ok && r.data.find((t) => t.slug === 'sizing')?.postCount).toBe(1);
  });
  it('allows the same permalink in categories and tags, but not twice in one list', async () => {
    expect((await createTerm('category', { name: 'Linen', slug: 'linen', description: '' })).ok).toBe(true);
    const dup = await createTerm('category', { name: 'Linen 2', slug: 'linen', description: '' });
    expect(!dup.ok && dup.error.code).toBe('CONFLICT');
  });
  it('validates term input', async () => {
    const r = await createTerm('tag', { name: '', slug: 'Bad Slug', description: '' });
    expect(!r.ok && r.error.fieldErrors?.['name'] && r.error.fieldErrors?.['slug']).toBeTruthy();
  });
  it('updates a term but keeps the permalink unique', async () => {
    const same = await updateTerm('category', 1, { name: 'News and updates', slug: 'news', description: '' });
    expect(same.ok).toBe(true);
    const clash = await updateTerm('category', 1, { name: 'News', slug: 'care-tips', description: '' });
    expect(!clash.ok && clash.error.code).toBe('CONFLICT');
  });
  it('blocks deleting a term that posts still use, and allows it once unused', async () => {
    const blocked = await deleteTerm('category', 2);
    expect(!blocked.ok && blocked.error.code).toBe('CONFLICT');
    await updatePost(1, { ...post({ slug: 'how-to-pick-the-right-size', title: 'How to pick the right size online' }), categoryId: null, tagIds: [] });
    expect((await deleteTerm('category', 2)).ok).toBe(true);
  });
  it('returns NOT_FOUND for unknown terms', async () => {
    const r = await deleteTerm('tag', 999);
    expect(!r.ok && r.error.code).toBe('NOT_FOUND');
  });
});
