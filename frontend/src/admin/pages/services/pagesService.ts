import { pageInputSchema, type PageStatus } from '../schema';
import type { FieldErrors, ListResult, PageRecord, PagesQuery, Result, Revision, ServiceError } from '../types';
import { issuesToErrors } from '../utils/errors';
import { newId } from '../utils/id';
import { createSeed, snapshotOf } from './seed';
import { validateImageFile } from '../utils/imageFile';
/**
 * In-memory mock of the pages API.
 *
 * Every function has the signature the real API client will have, so swapping
 * this file for fetch() calls will not change any component.
 *
 * SERVER: the real backend must re-validate input, check the admin's
 * permission, protect against CSRF and rate-limit these endpoints.
 */

const MAX_REVISIONS_PER_PAGE = 50;
const MAX_BULK_IDS = 100;
const MAX_SEARCH_LENGTH = 100;

let latencyMs = 0;
export function setPagesServiceLatency(ms: number): void {
  latencyMs = Math.max(0, Math.floor(ms));
}
const wait = (): Promise<void> => (latencyMs === 0 ? Promise.resolve() : new Promise((r) => setTimeout(r, latencyMs)));

let db = createSeed();
export function resetPagesDb(): void {
  db = createSeed();
}

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;
const ok = <T,>(data: T): Result<T> => ({ ok: true, data: clone(data) });
const fail = (code: ServiceError['code'], message: string, fieldErrors?: FieldErrors): Result<never> => ({
  ok: false,
  error: fieldErrors ? { code, message, fieldErrors } : { code, message },
});

function validate(input: unknown) {
  const parsed = pageInputSchema.safeParse(input);
  return parsed.success
    ? ({ ok: true, data: parsed.data } as const)
    : ({ ok: false, errors: issuesToErrors(parsed.error) } as const);
}

const slugTaken = (slug: string, exceptId?: number) => db.pages.some((p) => p.slug === slug && p.id !== exceptId);

function addRevision(page: PageRecord, note: string): void {
  db.revisions.push({
    id: newId(),
    pageId: page.id,
    createdAt: new Date().toISOString(),
    author: 'Admin',
    note,
    snapshot: snapshotOf(page),
  });
  const own = db.revisions.filter((r) => r.pageId === page.id);
  if (own.length > MAX_REVISIONS_PER_PAGE) {
    const drop = new Set(own.slice(0, own.length - MAX_REVISIONS_PER_PAGE).map((r) => r.id));
    db.revisions = db.revisions.filter((r) => !drop.has(r.id));
  }
}

function validIds(ids: unknown): number[] | null {
  if (!Array.isArray(ids) || ids.length === 0 || ids.length > MAX_BULK_IDS) return null;
  return ids.every((n) => Number.isInteger(n)) ? (ids as number[]) : null;
}

export async function listPages(query: PagesQuery): Promise<Result<ListResult>> {
  await wait();
  const pageSize = Math.min(50, Math.max(5, Math.floor(query.pageSize) || 10));
  const search = query.search.trim().toLowerCase().slice(0, MAX_SEARCH_LENGTH);

  const filtered = db.pages
    .filter((p) => query.status === 'all' || p.status === query.status)
    .filter((p) => query.template === 'all' || p.template === query.template)
    .filter((p) => search === '' || p.name.toLowerCase().includes(search))
    .sort((a, b) => b.id - a.id);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const page = Math.min(totalPages, Math.max(1, Math.floor(query.page) || 1));
  const items = filtered.slice((page - 1) * pageSize, page * pageSize);
  return ok({ items, total: filtered.length, page, pageSize });
}

export async function getPage(id: number): Promise<Result<PageRecord>> {
  await wait();
  const page = db.pages.find((p) => p.id === id);
  return page ? ok(page) : fail('NOT_FOUND', 'This page no longer exists.');
}

export async function createPage(input: unknown): Promise<Result<PageRecord>> {
  await wait();
  const v = validate(input);
  if (!v.ok) return fail('VALIDATION', 'Fix the highlighted fields.', v.errors);
  if (slugTaken(v.data.slug)) return fail('CONFLICT', 'This permalink is already used.', { slug: 'This permalink is already used by another page' });

  const now = new Date().toISOString();
  const page: PageRecord = { ...v.data, id: db.nextId++, isSystem: false, createdAt: now, updatedAt: now };
  db.pages.push(page);
  addRevision(page, 'Page created');
  return ok(page);
}

export async function updatePage(id: number, input: unknown, note = 'Page updated'): Promise<Result<PageRecord>> {
  await wait();
  const existing = db.pages.find((p) => p.id === id);
  if (!existing) return fail('NOT_FOUND', 'This page no longer exists.');
  const v = validate(input);
  if (!v.ok) return fail('VALIDATION', 'Fix the highlighted fields.', v.errors);
  if (existing.isSystem && v.data.slug !== existing.slug) {
    return fail('FORBIDDEN', 'The permalink of a system page cannot be changed.', { slug: 'Permalink is locked for system pages' });
  }
  if (slugTaken(v.data.slug, id)) return fail('CONFLICT', 'This permalink is already used.', { slug: 'This permalink is already used by another page' });

  Object.assign(existing, v.data, { updatedAt: new Date().toISOString() });
  addRevision(existing, note);
  return ok(existing);
}

export async function deletePage(id: number): Promise<Result<{ id: number }>> {
  await wait();
  const existing = db.pages.find((p) => p.id === id);
  if (!existing) return fail('NOT_FOUND', 'This page no longer exists.');
  if (existing.isSystem) return fail('FORBIDDEN', `"${existing.name}" is a system page and cannot be deleted.`);
  db.pages = db.pages.filter((p) => p.id !== id);
  db.revisions = db.revisions.filter((r) => r.pageId !== id);
  return ok({ id });
}

export async function bulkSetStatus(ids: number[], status: PageStatus): Promise<Result<{ updated: number }>> {
  await wait();
  const list = validIds(ids);
  if (!list) return fail('VALIDATION', 'Select between 1 and 100 pages.');
  if (status !== 'published' && status !== 'draft') return fail('VALIDATION', 'Unknown status.');
  let updated = 0;
  for (const page of db.pages) {
    if (list.includes(page.id) && page.status !== status) {
      page.status = status;
      page.updatedAt = new Date().toISOString();
      addRevision(page, status === 'published' ? 'Published' : 'Moved to draft');
      updated += 1;
    }
  }
  return ok({ updated });
}

export async function bulkDelete(ids: number[]): Promise<Result<{ deleted: number; skipped: number }>> {
  await wait();
  const list = validIds(ids);
  if (!list) return fail('VALIDATION', 'Select between 1 and 100 pages.');
  const targets = db.pages.filter((p) => list.includes(p.id));
  const deletable = new Set(targets.filter((p) => !p.isSystem).map((p) => p.id));
  db.pages = db.pages.filter((p) => !deletable.has(p.id));
  db.revisions = db.revisions.filter((r) => !deletable.has(r.pageId));
  return ok({ deleted: deletable.size, skipped: targets.length - deletable.size });
}

export async function listRevisions(pageId: number): Promise<Result<Revision[]>> {
  await wait();
  if (!db.pages.some((p) => p.id === pageId)) return fail('NOT_FOUND', 'This page no longer exists.');
  return ok(db.revisions.filter((r) => r.pageId === pageId).sort((a, b) => b.createdAt.localeCompare(a.createdAt) || 0));
}

export async function restoreRevision(pageId: number, revisionId: string): Promise<Result<PageRecord>> {
  await wait();
  const revision = db.revisions.find((r) => r.id === revisionId && r.pageId === pageId);
  if (!revision) return fail('NOT_FOUND', 'This version no longer exists.');
  return updatePage(pageId, revision.snapshot, `Restored version from ${revision.createdAt.slice(0, 10)}`);
}
/**
 * Mock upload. The real endpoint should store the file (S3, Cloudinary or your
 * own disk), then return its public https URL.
 *
 * SERVER: authenticate, re-check type, size and magic bytes, re-encode the
 * image, and generate the file name yourself. Never use the client's name.
 */
export async function uploadImage(file: File): Promise<Result<{ url: string }>> {
  await wait();
  const check = await validateImageFile(file);
  if (!check.ok) return fail('VALIDATION', check.error);
  const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg';
  return ok({ url: `https://cdn.example.com/uploads/${newId()}.${ext}` });
}