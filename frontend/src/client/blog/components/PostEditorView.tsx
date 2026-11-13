import { useEffect, useMemo, useRef, useState } from 'react';
import { ConfirmDialog, CheckboxField, SelectField, TextAreaField, TextField } from './ui';
import { ImageUploader } from './ImageUploader';
import type { FieldErrors, PostRecord, TermWithCount } from '../types';
import { issuesToErrors, formatDateTime, normalizeSlugInput, slugify } from '../utils';
import { emptyPostInput, toPostInput } from '../defaults';
import { LIMITS, POST_STATUSES, postInputSchema, type PostInput } from '../schema';
import { createPost, getPost, listTerms, updatePost } from '../services/blogService';
import { PostBlocksEditor } from './PostBlocksEditor';

interface Props {
  /** null means "create a new post". */
  postId: number | null;
  onBack: () => void;
}

type Load = 'loading' | 'ready' | 'missing' | 'failed';
type Banner = { kind: 'success' | 'error'; text: string } | null;

export function PostEditorView({ postId, onBack }: Props) {
  const [load, setLoad] = useState<Load>('loading');
  const [record, setRecord] = useState<PostRecord | null>(null);
  const [categories, setCategories] = useState<TermWithCount[]>([]);
  const [tags, setTags] = useState<TermWithCount[]>([]);
  const [draft, setDraft] = useState<PostInput>(emptyPostInput);
  const [savedJson, setSavedJson] = useState(() => JSON.stringify(emptyPostInput()));
  const [slugTouched, setSlugTouched] = useState(postId !== null);
  const [submitted, setSubmitted] = useState(false);
  const [serverErrors, setServerErrors] = useState<{ forJson: string; errors: FieldErrors } | null>(null);
  const [banner, setBanner] = useState<Banner>(null);
  const [saving, setSaving] = useState(false);
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [focusTick, setFocusTick] = useState(0);
  const savingRef = useRef(false);
  const rootRef = useRef<HTMLElement>(null);

  const draftJson = useMemo(() => JSON.stringify(draft), [draft]);
  const dirty = draftJson !== savedJson;
  const liveErrors = useMemo<FieldErrors>(() => {
    if (!submitted) return {};
    const parsed = postInputSchema.safeParse(draft);
    return parsed.success ? {} : issuesToErrors(parsed.error);
  }, [draft, submitted]);
  const errors: FieldErrors = { ...liveErrors, ...(serverErrors && serverErrors.forJson === draftJson ? serverErrors.errors : {}) };

  useEffect(() => {
    let cancelled = false;
    Promise.all([listTerms('category'), listTerms('tag'), postId === null ? Promise.resolve(null) : getPost(postId)])
      .then(([cats, tgs, post]) => {
        if (cancelled) return;
        if (!cats.ok || !tgs.ok) return setLoad('failed');
        setCategories(cats.data);
        setTags(tgs.data);
        if (post) {
          if (!post.ok) return setLoad(post.error.code === 'NOT_FOUND' ? 'missing' : 'failed');
          const input = toPostInput(post.data);
          setRecord(post.data);
          setDraft(input);
          setSavedJson(JSON.stringify(input));
        }
        setLoad('ready');
      })
      .catch(() => {
        if (!cancelled) setLoad('failed');
      });
    return () => {
      cancelled = true;
    };
  }, [postId]);

  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [dirty]);

  useEffect(() => {
    if (focusTick === 0) return;
    rootRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
  }, [focusTick]);

  function patch(change: Partial<PostInput>) {
    setDraft((d) => ({ ...d, ...change }));
    setBanner(null);
  }

  function toggleTag(id: number, on: boolean) {
    if (on) patch({ tagIds: draft.tagIds.includes(id) || draft.tagIds.length >= LIMITS.maxTags ? draft.tagIds : [...draft.tagIds, id] });
    else patch({ tagIds: draft.tagIds.filter((t) => t !== id) });
  }

  async function save(exit: boolean) {
    if (savingRef.current) return;
    const parsed = postInputSchema.safeParse(draft);
    if (!parsed.success) {
      setSubmitted(true);
      setBanner({ kind: 'error', text: 'Some fields need your attention. Fix them and save again.' });
      setFocusTick((n) => n + 1);
      return;
    }
    savingRef.current = true;
    setSaving(true);
    setBanner(null);
    try {
      const res = record ? await updatePost(record.id, parsed.data) : await createPost(parsed.data);
      if (!res.ok) {
        if (res.error.fieldErrors) {
          setServerErrors({ forJson: draftJson, errors: res.error.fieldErrors });
          setFocusTick((n) => n + 1);
        }
        setBanner({ kind: 'error', text: res.error.message });
        return;
      }
      const input = toPostInput(res.data);
      setRecord(res.data);
      setDraft(input);
      setSavedJson(JSON.stringify(input));
      setSubmitted(false);
      setServerErrors(null);
      setBanner({ kind: 'success', text: 'Post saved.' });
      if (exit) onBack();
    } catch {
      setBanner({ kind: 'error', text: 'Could not save. Check your connection and try again. Your changes are still here.' });
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  }

  const requestBack = () => (dirty ? setLeaveOpen(true) : onBack());

  if (load === 'loading') return <p className="bl-empty" role="status">Loading post…</p>;
  if (load !== 'ready') {
    return (
      <div className="bl-empty">
        <p>{load === 'missing' ? 'This post no longer exists.' : 'Could not load this post.'}</p>
        <button type="button" className="bl-btn" onClick={onBack}>Back to posts</button>
      </div>
    );
  }

  return (
    <section ref={rootRef} aria-labelledby="blog-edit-title">
      <header className="bl-header">
        <div>
          <p className="bl-crumb"><button type="button" className="bl-link" onClick={requestBack}>Posts</button> / {record ? 'Edit' : 'New'}</p>
          <h1 id="blog-edit-title">{record ? `Edit “${record.title}”` : 'Create post'}</h1>
        </div>
        <div className="bl-actions">
          <button type="button" className="bl-btn" onClick={requestBack}>Cancel</button>
          <button type="button" className="bl-btn" onClick={() => void save(true)} disabled={saving}>Save and exit</button>
          <button type="button" className="bl-btn bl-btn-primary" onClick={() => void save(false)} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
        </div>
      </header>

      <div role="status" aria-live="polite">
        {banner && <p className={banner.kind === 'success' ? 'bl-notice bl-notice-ok' : 'bl-notice bl-notice-error'}>{banner.text}</p>}
        {dirty && !banner && <p className="bl-hint">You have unsaved changes.</p>}
      </div>

      <div className="bl-layout">
        <div className="bl-main">
          <div className="bl-card">
            <TextField label="Title" required value={draft.title} counter={{ value: draft.title.length, max: LIMITS.title }} error={errors['title']} onChange={(e) => patch(slugTouched ? { title: e.target.value } : { title: e.target.value, slug: slugify(e.target.value) })} />
            <TextField label="Permalink" required value={draft.slug} hint={`Preview: yoursite.com/blog/${draft.slug || '…'}`} error={errors['slug']} onChange={(e) => { setSlugTouched(true); patch({ slug: normalizeSlugInput(e.target.value) }); }} onBlur={() => patch({ slug: slugify(draft.slug) })} />
            <TextAreaField label="Excerpt" rows={3} value={draft.excerpt} counter={{ value: draft.excerpt.length, max: LIMITS.excerpt }} hint="A short summary shown in the blog list." error={errors['excerpt']} onChange={(e) => patch({ excerpt: e.target.value })} />
          </div>

          <div className="bl-card">
            <h2>Content</h2>
            <PostBlocksEditor blocks={draft.blocks} errors={errors} onChange={(blocks) => patch({ blocks })} />
          </div>

          <div className="bl-card">
            <h2>Search engine listing</h2>
            <TextField label="SEO title" value={draft.seoTitle} counter={{ value: draft.seoTitle.length, max: LIMITS.seoTitle }} hint="Leave empty to use the post title." error={errors['seoTitle']} onChange={(e) => patch({ seoTitle: e.target.value })} />
            <TextAreaField label="SEO description" rows={3} value={draft.seoDescription} counter={{ value: draft.seoDescription.length, max: LIMITS.seoDescription }} hint="Leave empty to use the excerpt." error={errors['seoDescription']} onChange={(e) => patch({ seoDescription: e.target.value })} />
            <CheckboxField label="Hide this post from search engines" checked={draft.noindex} onChange={(e) => patch({ noindex: e.target.checked })} />
          </div>
        </div>

        <aside className="bl-side">
          <div className="bl-card">
            <h2>Publish</h2>
            <SelectField label="Status" required value={draft.status} options={POST_STATUSES.map((s) => ({ value: s, label: s === 'published' ? 'Published' : 'Draft' }))} onChange={(e) => patch({ status: e.target.value === 'published' ? 'published' : 'draft' })} />
            {record && <p className="bl-hint">Last saved {formatDateTime(record.updatedAt)}{record.publishedAt ? `. First published ${formatDateTime(record.publishedAt)}.` : '.'}</p>}
          </div>

          <div className="bl-card">
            <h2>Category</h2>
            <SelectField label="Category" value={draft.categoryId === null ? '' : String(draft.categoryId)} error={errors['categoryId']} options={[{ value: '', label: 'Uncategorized' }, ...categories.map((c) => ({ value: String(c.id), label: c.name }))]} onChange={(e) => patch({ categoryId: categories.find((c) => String(c.id) === e.target.value)?.id ?? null })} />
          </div>

          <div className="bl-card">
            <h2>Tags ({draft.tagIds.length}/{LIMITS.maxTags})</h2>
            {tags.length === 0 && <p className="bl-hint">No tags yet. Create them under Blog, Tags.</p>}
            <div className="bl-check-grid">
              {tags.map((t) => {
                const on = draft.tagIds.includes(t.id);
                return <CheckboxField key={t.id} label={t.name} checked={on} disabled={!on && draft.tagIds.length >= LIMITS.maxTags} onChange={(e) => toggleTag(t.id, e.target.checked)} />;
              })}
            </div>
            {errors['tagIds'] && <p className="bl-error">{errors['tagIds']}</p>}
          </div>

          <div className="bl-card">
            <h2>Featured image</h2>
            <ImageUploader value={draft.imageUrl} error={errors['imageUrl']} onChange={(imageUrl) => patch({ imageUrl })} />
          </div>
        </aside>
      </div>

      <ConfirmDialog open={leaveOpen} title="Leave without saving?" message="Your changes on this post will be lost." confirmLabel="Leave page" danger onConfirm={() => { setLeaveOpen(false); onBack(); }} onCancel={() => setLeaveOpen(false)} />
    </section>
  );
}
