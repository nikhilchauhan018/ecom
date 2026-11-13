import { useEffect, useRef, useState, type FormEvent } from 'react';
import { ConfirmDialog, TextAreaField, TextField } from './ui';
import type { FieldErrors, TermKind, TermWithCount } from '../types';
import { issuesToErrors, normalizeSlugInput, slugify } from '../utils';
import { emptyTermInput } from '../defaults';
import { LIMITS, termInputSchema, type TermInput } from '../schema';
import { createTerm, deleteTerm, listTerms, updateTerm } from '../services/blogService';

const COPY = {
  category: { title: 'Categories', singular: 'category', hint: 'Group related posts, for example “Style guides”.' },
  tag: { title: 'Tags', singular: 'tag', hint: 'Short keywords, for example “linen”.' },
} as const;

type Notice = { kind: 'success' | 'error'; text: string } | null;

/** One screen for both Categories and Tags. Tags just hide the description field. */
export function TermsView({ kind }: { kind: TermKind }) {
  const copy = COPY[kind];
  const [terms, setTerms] = useState<TermWithCount[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  const [form, setForm] = useState<TermInput>(emptyTermInput);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [slugTouched, setSlugTouched] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [notice, setNotice] = useState<Notice>(null);
  const [saving, setSaving] = useState(false);
  const [confirm, setConfirm] = useState<TermWithCount | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [focusTick, setFocusTick] = useState(0);
  const savingRef = useRef(false);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    let cancelled = false;
    listTerms(kind)
      .then((res) => {
        if (cancelled) return;
        if (res.ok) {
          setTerms(res.data);
          setLoadError(null);
        } else setLoadError(res.error.message);
      })
      .catch(() => {
        if (!cancelled) setLoadError('Could not load this list. Check your connection and try again.');
      });
    return () => {
      cancelled = true;
    };
  }, [kind, tick]);

  useEffect(() => {
    if (focusTick === 0) return;
    formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
  }, [focusTick]);

  function resetForm() {
    setForm(emptyTermInput());
    setEditingId(null);
    setSlugTouched(false);
    setErrors({});
  }

  function startEdit(t: TermWithCount) {
    setForm({ name: t.name, slug: t.slug, description: t.description });
    setEditingId(t.id);
    setSlugTouched(true);
    setErrors({});
    setNotice(null);
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (savingRef.current) return;
    const parsed = termInputSchema.safeParse(form);
    if (!parsed.success) {
      setErrors(issuesToErrors(parsed.error));
      setFocusTick((n) => n + 1);
      return;
    }
    savingRef.current = true;
    setSaving(true);
    setNotice(null);
    try {
      const res = editingId === null ? await createTerm(kind, parsed.data) : await updateTerm(kind, editingId, parsed.data);
      if (!res.ok) {
        setErrors(res.error.fieldErrors ?? {});
        setNotice({ kind: 'error', text: res.error.message });
        setFocusTick((n) => n + 1);
        return;
      }
      setNotice({ kind: 'success', text: `${copy.singular[0]?.toUpperCase() ?? ''}${copy.singular.slice(1)} saved.` });
      resetForm();
      setTick((n) => n + 1);
    } catch {
      setNotice({ kind: 'error', text: 'Could not save. Check your connection and try again.' });
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!confirm || deleting) return;
    setDeleting(true);
    try {
      const res = await deleteTerm(kind, confirm.id);
      setNotice(res.ok ? { kind: 'success', text: `"${confirm.name}" was deleted.` } : { kind: 'error', text: res.error.message });
      if (res.ok && editingId === confirm.id) resetForm();
      setTick((n) => n + 1);
    } catch {
      setNotice({ kind: 'error', text: 'Something went wrong. Please try again.' });
    } finally {
      setDeleting(false);
      setConfirm(null);
    }
  }

  return (
    <section aria-labelledby="blog-terms-title">
      <header className="bl-header">
        <div>
          <p className="bl-crumb">Dashboard / Blog</p>
          <h1 id="blog-terms-title">{copy.title}</h1>
        </div>
      </header>

      <div role="status" aria-live="polite">
        {notice && <p className={notice.kind === 'success' ? 'bl-notice bl-notice-ok' : 'bl-notice bl-notice-error'}>{notice.text}</p>}
      </div>

      <div className="bl-layout">
        <div className="bl-main">
          <div className="bl-card">
            {loadError ? (
              <div className="bl-empty">
                <p>{loadError}</p>
                <button type="button" className="bl-btn" onClick={() => setTick((n) => n + 1)}>Try again</button>
              </div>
            ) : terms === null ? (
              <p className="bl-empty">Loading…</p>
            ) : terms.length === 0 ? (
              <p className="bl-empty">No {copy.title.toLowerCase()} yet. Add your first one.</p>
            ) : (
              <div className="bl-table-wrap">
                <table className="bl-table">
                  <caption className="bl-sr">{copy.title}</caption>
                  <thead>
                    <tr>
                      <th scope="col">Name</th>
                      <th scope="col">Permalink</th>
                      <th scope="col">Posts</th>
                      <th scope="col">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {terms.map((t) => (
                      <tr key={t.id}>
                        <td>{t.name}</td>
                        <td>{t.slug}</td>
                        <td>{t.postCount}</td>
                        <td>
                          <span className="bl-row-actions">
                            <button type="button" className="bl-btn bl-btn-sm" onClick={() => startEdit(t)} aria-label={`Edit ${t.name}`}>Edit</button>
                            <button type="button" className="bl-btn bl-btn-sm bl-btn-danger" onClick={() => setConfirm(t)} disabled={t.postCount > 0} title={t.postCount > 0 ? `Used by ${t.postCount} post(s)` : undefined} aria-label={`Delete ${t.name}`}>Delete</button>
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <aside className="bl-side">
          <form ref={formRef} className="bl-card" onSubmit={(e) => void submit(e)} noValidate>
            <h2>{editingId === null ? `Add ${copy.singular}` : `Edit ${copy.singular}`}</h2>
            <p className="bl-hint">{copy.hint}</p>
            <TextField label="Name" required value={form.name} counter={{ value: form.name.length, max: LIMITS.termName }} error={errors['name']} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value, ...(slugTouched ? {} : { slug: slugify(e.target.value) }) }))} />
            <TextField label="Permalink" required value={form.slug} error={errors['slug']} onChange={(e) => { setSlugTouched(true); setForm((f) => ({ ...f, slug: normalizeSlugInput(e.target.value) })); }} onBlur={() => setForm((f) => ({ ...f, slug: slugify(f.slug) }))} />
            {kind === 'category' && <TextAreaField label="Description" rows={3} value={form.description} counter={{ value: form.description.length, max: LIMITS.termDescription }} error={errors['description']} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />}
            <div className="bl-row">
              <button type="submit" className="bl-btn bl-btn-primary" disabled={saving}>{saving ? 'Saving…' : editingId === null ? `Add ${copy.singular}` : 'Save changes'}</button>
              {editingId !== null && <button type="button" className="bl-btn" onClick={resetForm}>Cancel</button>}
            </div>
          </form>
        </aside>
      </div>

      <ConfirmDialog open={confirm !== null} danger busy={deleting} title={`Delete "${confirm?.name ?? ''}"?`} message="This cannot be undone." confirmLabel="Delete" onConfirm={() => void confirmDelete()} onCancel={() => setConfirm(null)} />
    </section>
  );
}
