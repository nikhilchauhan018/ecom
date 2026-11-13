import type { ZodType } from 'zod';
import type { FieldErrors, Result, ServiceError, PostRecord, PostsList, PostsQuery, Term, TermKind, TermWithCount } from '../types';
import { issuesToErrors, newId, validateImageFile } from '../utils';
import { postInputSchema, termInputSchema, type PostInput } from '../schema';

/**
 * In-memory mock of the blog API. Replace this file with real fetch() calls;
 * keep the function names, arguments and Result<T> shape so no component changes.
 *
 * SERVER: re-validate input, check admin permission, add CSRF protection and
 * rate limiting, and enforce unique indexes on (posts.slug) and (terms.kind, terms.slug).
 */

const MAX_SEARCH_LENGTH = 100;

let latencyMs = 0;
export function setBlogServiceLatency(ms: number): void {
  latencyMs = Math.max(0, Math.floor(ms));
}
const wait = (): Promise<void> => (latencyMs === 0 ? Promise.resolve() : new Promise((r) => setTimeout(r, latencyMs)));

const STAMP = '2026-09-12T09:00:00.000Z';
const term = (id: number, name: string, slug: string, description = ''): Term => ({ id, name, slug, description, createdAt: STAMP });

function createSeed() {
  const post = (id: number, title: string, slug: string, categoryId: number | null, tagIds: number[], status: PostInput['status']): PostRecord => ({
    id,
    title,
    slug,
    excerpt: '',
    status,
    categoryId,
    tagIds,
    imageUrl: '',
    blocks: [{ id: `b-${id}-1`, type: 'text', text: 'Sample content for this post.' }],
    seoTitle: '',
    seoDescription: '',
    noindex: false,
    author: 'Admin',
    createdAt: `2026-09-1${id}T09:00:00.000Z`,
    updatedAt: `2026-09-1${id}T09:00:00.000Z`,
    publishedAt: status === 'published' ? `2026-09-1${id}T09:00:00.000Z` : null,
  });
  return {
    posts: [
      post(1, 'How to pick the right size online', 'how-to-pick-the-right-size', 2, [1], 'published'),
      post(2, 'Care guide for linen shirts', 'care-guide-for-linen-shirts', 3, [2, 3], 'published'),
      post(3, 'Festive collection is here', 'festive-collection-is-here', 1, [4], 'published'),
      post(4, 'Behind the scenes at our studio', 'behind-the-scenes', null, [], 'draft'),
    ],
    terms: {
      category: [term(1, 'News', 'news'), term(2, 'Style guides', 'style-guides', 'Fit and styling help'), term(3, 'Care tips', 'care-tips')],
      tag: [term(1, 'sizing', 'sizing'), term(2, 'linen', 'linen'), term(3, 'washing', 'washing'), term(4, 'festive', 'festive')],
    } as Record<TermKind, Term[]>,
    nextPostId: 5,
    nextTermId: { category: 4, tag: 5 } as Record<TermKind, number>,
  };
}

let db = createSeed();
export function resetBlogDb(): void {
  db = createSeed();
}

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;
const ok = <T,>(data: T): Result<T> => ({ ok: true, data: clone(data) });
const fail = (code: ServiceError['code'], message: string, fieldErrors?: FieldErrors): Result<never> => ({
  ok: false,
  error: fieldErrors ? { code, message, fieldErrors } : { code, message },
});

function validate<T>(schema: ZodType<T>, input: unknown) {
  const parsed = schema.safeParse(input);
  return parsed.success ? ({ ok: true, data: parsed.data } as const) : ({ ok: false, errors: issuesToErrors(parsed.error) } as const);
}

const SLUG_TAKEN: FieldErrors = { slug: 'This permalink is already used' };
const postSlugTaken = (slug: string, exceptId?: number) => db.posts.some((p) => p.slug === slug && p.id !== exceptId);
const termSlugTaken = (kind: TermKind, slug: string, exceptId?: number) => db.terms[kind].some((t) => t.slug === slug && t.id !== exceptId);

/** Checks that the category and tags a post points to really exist. */
function referenceErrors(data: PostInput): FieldErrors | null {
  const errors: FieldErrors = {};
  if (data.categoryId !== null && !db.terms.category.some((c) => c.id === data.categoryId)) errors['categoryId'] = 'Choose an existing category';
  if (data.tagIds.some((id) => !db.terms.tag.some((t) => t.id === id))) errors['tagIds'] = 'One of the selected tags no longer exists';
  return Object.keys(errors).length > 0 ? errors : null;
}

export async function listPosts(query: PostsQuery): Promise<Result<PostsList>> {
  await wait();
  const pageSize = Math.min(50, Math.max(5, Math.floor(query.pageSize) || 10));
  const search = query.search.trim().toLowerCase().slice(0, MAX_SEARCH_LENGTH);
  const filtered = db.posts
    .filter((p) => query.status === 'all' || p.status === query.status)
    .filter((p) => query.categoryId === 'all' || p.categoryId === query.categoryId)
    .filter((p) => search === '' || p.title.toLowerCase().includes(search))
    .sort((a, b) => b.id - a.id);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const page = Math.min(totalPages, Math.max(1, Math.floor(query.page) || 1));
  return ok({ items: filtered.slice((page - 1) * pageSize, page * pageSize), total: filtered.length, page, pageSize });
}

export async function getPost(id: number): Promise<Result<PostRecord>> {
  await wait();
  const post = db.posts.find((p) => p.id === id);
  return post ? ok(post) : fail('NOT_FOUND', 'This post no longer exists.');
}

export async function createPost(input: unknown): Promise<Result<PostRecord>> {
  await wait();
  const v = validate(postInputSchema, input);
  if (!v.ok) return fail('VALIDATION', 'Fix the highlighted fields.', v.errors);
  const refs = referenceErrors(v.data);
  if (refs) return fail('VALIDATION', 'Fix the highlighted fields.', refs);
  if (postSlugTaken(v.data.slug)) return fail('CONFLICT', 'This permalink is already used.', SLUG_TAKEN);
  const now = new Date().toISOString();
  const post: PostRecord = { ...v.data, id: db.nextPostId++, author: 'Admin', createdAt: now, updatedAt: now, publishedAt: v.data.status === 'published' ? now : null };
  db.posts.push(post);
  return ok(post);
}

export async function updatePost(id: number, input: unknown): Promise<Result<PostRecord>> {
  await wait();
  const existing = db.posts.find((p) => p.id === id);
  if (!existing) return fail('NOT_FOUND', 'This post no longer exists.');
  const v = validate(postInputSchema, input);
  if (!v.ok) return fail('VALIDATION', 'Fix the highlighted fields.', v.errors);
  const refs = referenceErrors(v.data);
  if (refs) return fail('VALIDATION', 'Fix the highlighted fields.', refs);
  if (postSlugTaken(v.data.slug, id)) return fail('CONFLICT', 'This permalink is already used.', SLUG_TAKEN);
  const now = new Date().toISOString();
  Object.assign(existing, v.data, { updatedAt: now, publishedAt: existing.publishedAt ?? (v.data.status === 'published' ? now : null) });
  return ok(existing);
}

export async function deletePost(id: number): Promise<Result<{ id: number }>> {
  await wait();
  if (!db.posts.some((p) => p.id === id)) return fail('NOT_FOUND', 'This post no longer exists.');
  db.posts = db.posts.filter((p) => p.id !== id);
  return ok({ id });
}

const countPosts = (kind: TermKind, id: number) =>
  db.posts.filter((p) => (kind === 'category' ? p.categoryId === id : p.tagIds.includes(id))).length;

export async function listTerms(kind: TermKind): Promise<Result<TermWithCount[]>> {
  await wait();
  const items = db.terms[kind].map((t) => ({ ...t, postCount: countPosts(kind, t.id) })).sort((a, b) => a.name.localeCompare(b.name));
  return ok(items);
}

export async function createTerm(kind: TermKind, input: unknown): Promise<Result<Term>> {
  await wait();
  const v = validate(termInputSchema, input);
  if (!v.ok) return fail('VALIDATION', 'Fix the highlighted fields.', v.errors);
  if (termSlugTaken(kind, v.data.slug)) return fail('CONFLICT', 'This permalink is already used.', SLUG_TAKEN);
  const created: Term = { ...v.data, id: db.nextTermId[kind]++, createdAt: new Date().toISOString() };
  db.terms[kind].push(created);
  return ok(created);
}

export async function updateTerm(kind: TermKind, id: number, input: unknown): Promise<Result<Term>> {
  await wait();
  const existing = db.terms[kind].find((t) => t.id === id);
  if (!existing) return fail('NOT_FOUND', 'This item no longer exists.');
  const v = validate(termInputSchema, input);
  if (!v.ok) return fail('VALIDATION', 'Fix the highlighted fields.', v.errors);
  if (termSlugTaken(kind, v.data.slug, id)) return fail('CONFLICT', 'This permalink is already used.', SLUG_TAKEN);
  Object.assign(existing, v.data);
  return ok(existing);
}

export async function deleteTerm(kind: TermKind, id: number): Promise<Result<{ id: number }>> {
  await wait();
  const existing = db.terms[kind].find((t) => t.id === id);
  if (!existing) return fail('NOT_FOUND', 'This item no longer exists.');
  const used = countPosts(kind, id);
  if (used > 0) return fail('CONFLICT', `"${existing.name}" is used by ${used} post(s). Remove it from those posts first.`);
  db.terms[kind] = db.terms[kind].filter((t) => t.id !== id);
  return ok({ id });
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
