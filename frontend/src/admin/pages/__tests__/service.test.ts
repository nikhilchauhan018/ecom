import { beforeEach, describe, expect, it } from 'vitest';
import { emptyPageInput } from '../defaults';
import { bulkDelete, bulkSetStatus, createPage, deletePage, getPage, listPages, listRevisions, resetPagesDb, restoreRevision, updatePage } from '../services/pagesService';
import type { PagesQuery } from '../types';

const base: PagesQuery = { search: '', status: 'all', template: 'all', page: 1, pageSize: 10 };
const input = (over: Record<string, unknown> = {}) => ({ ...emptyPageInput(), name: 'Lookbook 2026', slug: 'lookbook-2026', ...over });

beforeEach(() => resetPagesDb());

describe('listPages', () => {
  it('paginates and reports totals', async () => {
    const r = await listPages({ ...base, pageSize: 5 });
    if (!r.ok) throw new Error('expected ok');
    expect(r.data.total).toBe(12);
    expect(r.data.items).toHaveLength(5);
  });
  it('filters by search, status and template', async () => {
    const s = await listPages({ ...base, search: 'CONTACT' });
    expect(s.ok && s.data.items.map((p) => p.name)).toEqual(['Contact']);
    const d = await listPages({ ...base, status: 'draft' });
    expect(d.ok && d.data.total).toBe(2);
    const t = await listPages({ ...base, template: 'coming-soon' });
    expect(t.ok && t.data.total).toBe(1);
  });
  it('clamps an out-of-range page', async () => {
    const r = await listPages({ ...base, page: 99 });
    expect(r.ok && r.data.page).toBe(2);
  });
  it('returns copies, so callers cannot mutate stored data', async () => {
    const a = await listPages(base);
    if (a.ok && a.data.items[0]) a.data.items[0].name = 'HACKED';
    const b = await listPages(base);
    expect(b.ok && b.data.items[0]?.name).not.toBe('HACKED');
  });
});

describe('createPage and updatePage', () => {
  it('creates a page with a first revision', async () => {
    const r = await createPage(input());
    if (!r.ok) throw new Error('expected ok');
    const revs = await listRevisions(r.data.id);
    expect(revs.ok && revs.data).toHaveLength(1);
  });
  it('rejects invalid input with field errors', async () => {
    const r = await createPage(input({ name: '' }));
    expect(!r.ok && r.error.code === 'VALIDATION' && r.error.fieldErrors?.['name']).toBeTruthy();
  });
  it('rejects duplicate permalinks', async () => {
    const r = await createPage(input({ slug: 'contact' }));
    expect(!r.ok && r.error.code).toBe('CONFLICT');
  });
  it('locks the permalink of system pages', async () => {
    const r = await updatePage(2, input({ name: 'Privacy policy', slug: 'privacy-new' }));
    expect(!r.ok && r.error.code).toBe('FORBIDDEN');
  });
  it('returns NOT_FOUND for unknown pages', async () => {
    const r = await updatePage(999, input());
    expect(!r.ok && r.error.code).toBe('NOT_FOUND');
  });
});

describe('delete and bulk actions', () => {
  it('refuses to delete system pages', async () => {
    const r = await deletePage(2);
    expect(!r.ok && r.error.code).toBe('FORBIDDEN');
    expect((await getPage(2)).ok).toBe(true);
  });
  it('deletes normal pages', async () => {
    expect((await deletePage(10)).ok).toBe(true);
    expect((await getPage(10)).ok).toBe(false);
  });
  it('bulk delete skips system pages and reports counts', async () => {
    const r = await bulkDelete([2, 10, 11]);
    expect(r.ok && r.data).toEqual({ deleted: 2, skipped: 1 });
  });
  it('bulk status rejects empty, huge or non-integer id lists', async () => {
    expect((await bulkSetStatus([], 'draft')).ok).toBe(false);
    expect((await bulkSetStatus([1.5], 'draft')).ok).toBe(false);
    expect((await bulkSetStatus(Array.from({ length: 101 }, (_, i) => i + 1), 'draft')).ok).toBe(false);
  });
  it('bulk status updates only pages that change', async () => {
    const r = await bulkSetStatus([1, 9], 'published');
    expect(r.ok && r.data.updated).toBe(1);
  });
});

describe('revisions', () => {
  it('restores an older version', async () => {
    const before = await getPage(1);
    if (!before.ok) throw new Error('expected ok');
    await updatePage(1, { ...input({ slug: 'about-us' }), name: 'About us v2' });
    const revs = await listRevisions(1);
    if (!revs.ok) throw new Error('expected ok');
    const oldest = revs.data[revs.data.length - 1];
    if (!oldest) throw new Error('expected a revision');
    const restored = await restoreRevision(1, oldest.id);
    expect(restored.ok && restored.data.name).toBe('About us');
  });
  it('fails for an unknown revision', async () => {
    const r = await restoreRevision(1, 'nope');
    expect(!r.ok && r.error.code).toBe('NOT_FOUND');
  });
});
