import { useEffect, useMemo, useRef, useState } from 'react';
import { emptyPageInput, toInput } from '../defaults';
import { PAGE_STATUSES, PAGE_TEMPLATES, pageInputSchema, type PageInput } from '../schema';
import { createPage, getPage, updatePage } from '../services/pagesService';
import type { FieldErrors, PageRecord } from '../types';
import { issuesToErrors } from '../utils/errors';
import { formatDateTime } from '../utils/format';
import { normalizeSlugInput, slugify } from '../utils/slug';
import { BlocksEditor } from './BlocksEditor';
import { ConfirmDialog } from './ConfirmDialog';
import { FaqEditor } from './FaqEditor';
import { ImageUploader } from './ImageUploader';
import { CheckboxField, SelectField, TextAreaField, TextField } from './fields';
import { TEMPLATE_LABELS } from './PagesListView';
import { RevisionsPanel } from './RevisionsPanel';
import { SeoPanel } from './SeoPanel';
import { LIMITS } from '../schema';

interface Props {
  /** null means "create a new page". */
  pageId: number | null;
  onBack: () => void;
}

type Load = 'loading' | 'ready' | 'missing' | 'failed';
type Banner = { kind: 'success' | 'error'; text: string } | null;
type Tab = 'detail' | 'revisions';

export function PageEditorView({ pageId, onBack }: Props) {
  const [load, setLoad] = useState<Load>(pageId === null ? 'ready' : 'loading');
  const [record, setRecord] = useState<PageRecord | null>(null);
  const [draft, setDraft] = useState<PageInput>(emptyPageInput);
  const [savedJson, setSavedJson] = useState(() => JSON.stringify(emptyPageInput()));
  const [slugTouched, setSlugTouched] = useState(pageId !== null);
  const [submitted, setSubmitted] = useState(false);
  const [serverErrors, setServerErrors] = useState<{ forJson: string; errors: FieldErrors } | null>(null);
  const [banner, setBanner] = useState<Banner>(null);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<Tab>('detail');
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [focusTick, setFocusTick] = useState(0);
  const savingRef = useRef(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const draftJson = useMemo(() => JSON.stringify(draft), [draft]);
  const dirty = draftJson !== savedJson;

  const liveErrors = useMemo<FieldErrors>(() => {
    if (!submitted) return {};
    const parsed = pageInputSchema.safeParse(draft);
    return parsed.success ? {} : issuesToErrors(parsed.error);
  }, [draft, submitted]);
  const errors: FieldErrors = { ...liveErrors, ...(serverErrors && serverErrors.forJson === draftJson ? serverErrors.errors : {}) };

  // Load an existing page once.
  useEffect(() => {
    if (pageId === null) return;
    let cancelled = false;
    getPage(pageId)
      .then((res) => {
        if (cancelled) return;
        if (!res.ok) {
          setLoad(res.error.code === 'NOT_FOUND' ? 'missing' : 'failed');
          return;
        }
        const input = toInput(res.data);
        setRecord(res.data);
        setDraft(input);
        setSavedJson(JSON.stringify(input));
        setLoad('ready');
      })
      .catch(() => {
        if (!cancelled) setLoad('failed');
      });
    return () => {
      cancelled = true;
    };
  }, [pageId]);

  // Warn before closing the tab with unsaved work.
  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [dirty]);

  // Move focus to the first invalid field after a failed save.
  useEffect(() => {
    if (focusTick === 0) return;
    rootRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
  }, [focusTick]);

  function patch(change: Partial<PageInput>) {
    setDraft((d) => ({ ...d, ...change }));
    setBanner(null);
  }

  function onNameChange(name: string) {
    patch(slugTouched ? { name } : { name, slug: slugify(name) });
  }

  function applySaved(saved: PageRecord) {
    const input = toInput(saved);
    setRecord(saved);
    setDraft(input);
    setSavedJson(JSON.stringify(input));
    setSubmitted(false);
    setServerErrors(null);
  }

  async function save(exit: boolean) {
    if (savingRef.current) return;
    const parsed = pageInputSchema.safeParse(draft);
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
      const res = record ? await updatePage(record.id, parsed.data) : await createPage(parsed.data);
      if (!res.ok) {
        if (res.error.fieldErrors) {
          setServerErrors({ forJson: draftJson, errors: res.error.fieldErrors });
          setFocusTick((n) => n + 1);
        }
        setBanner({ kind: 'error', text: res.error.message });
        return;
      }
      applySaved(res.data);
      setBanner({ kind: 'success', text: 'Page saved.' });
      if (exit) onBack();
    } catch {
      setBanner({ kind: 'error', text: 'Could not save. Check your connection and try again. Your changes are still here.' });
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  }

  function requestBack() {
    if (dirty) setLeaveOpen(true);
    else onBack();
  }

  if (load === 'loading') return <p className="pg-empty" role="status">Loading page…</p>;
  if (load === 'missing' || load === 'failed') {
    return (
      <div className="pg-empty">
        <p>{load === 'missing' ? 'This page no longer exists.' : 'Could not load this page.'}</p>
        <button type="button" className="pg-btn" onClick={onBack}>Back to pages</button>
      </div>
    );
  }

  const isSystem = record?.isSystem ?? false;
  const title = record ? `Edit “${record.name}”` : 'Create page';

  return (
    <section ref={rootRef} aria-labelledby="pg-edit-title">
      <header className="pg-header">
        <div>
          <p className="pg-crumb">
            <button type="button" className="pg-link" onClick={requestBack}>Pages</button> / {record ? 'Edit' : 'New'}
          </p>
          <h1 id="pg-edit-title">{title}</h1>
        </div>
        <div className="pg-actions">
          <button type="button" className="pg-btn" onClick={requestBack}>Cancel</button>
          <button type="button" className="pg-btn" onClick={() => void save(true)} disabled={saving}>Save and exit</button>
          <button type="button" className="pg-btn pg-btn-primary" onClick={() => void save(false)} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
        </div>
      </header>

      <div role="status" aria-live="polite">
        {banner && <p className={banner.kind === 'success' ? 'pg-notice pg-notice-ok' : 'pg-notice pg-notice-error'}>{banner.text}</p>}
        {dirty && !banner && <p className="pg-hint">You have unsaved changes.</p>}
      </div>

      <div className="pg-tabs" role="tablist" aria-label="Page sections">
        <button type="button" role="tab" aria-selected={tab === 'detail'} className="pg-tab" onClick={() => setTab('detail')}>Detail</button>
        {record && <button type="button" role="tab" aria-selected={tab === 'revisions'} className="pg-tab" onClick={() => setTab('revisions')}>Revision history</button>}
      </div>

      {tab === 'revisions' && record ? (
        <RevisionsPanel pageId={record.id} version={record.updatedAt} hasUnsavedChanges={dirty} onRestored={(p) => { applySaved(p); setBanner({ kind: 'success', text: 'Version restored.' }); setTab('detail'); }} />
      ) : (
        <div className="pg-layout">
          <div className="pg-main">
            <div className="pg-card">
              <TextField label="Name" required value={draft.name} counter={{ value: draft.name.length, max: LIMITS.name }} error={errors['name']} onChange={(e) => onNameChange(e.target.value)} />
              <TextField
                label="Permalink"
                required
                value={draft.slug}
                disabled={isSystem}
                hint={isSystem ? 'Locked for system pages.' : `Preview: yoursite.com/${draft.slug || '…'}`}
                error={errors['slug']}
                onChange={(e) => {
                  setSlugTouched(true);
                  patch({ slug: normalizeSlugInput(e.target.value) });
                }}
                onBlur={() => patch({ slug: slugify(draft.slug) })}
              />
              <TextAreaField label="Description" rows={3} value={draft.description} counter={{ value: draft.description.length, max: LIMITS.description }} hint="A short summary. Used as a fallback for search results." error={errors['description']} onChange={(e) => patch({ description: e.target.value })} />
            </div>

            <div className="pg-card">
              <h2>Content</h2>
              <BlocksEditor blocks={draft.blocks} errors={errors} onChange={(blocks) => patch({ blocks })} />
            </div>

            <div className="pg-card">
              <h2>FAQ</h2>
              <FaqEditor faqs={draft.faqs} errors={errors} onChange={(faqs) => patch({ faqs })} />
            </div>

            <div className="pg-card">
              <h2>Search engine listing</h2>
              <SeoPanel value={draft} errors={errors} onChange={patch} />
            </div>
          </div>

          <aside className="pg-side">
            <div className="pg-card">
              <h2>Publish</h2>
              <SelectField label="Status" required value={draft.status} options={PAGE_STATUSES.map((s) => ({ value: s, label: s === 'published' ? 'Published' : 'Draft' }))} onChange={(e) => patch({ status: e.target.value === 'published' ? 'published' : 'draft' })} />
              <SelectField label="Template" required value={draft.template} options={PAGE_TEMPLATES.map((t) => ({ value: t, label: TEMPLATE_LABELS[t] }))} onChange={(e) => patch({ template: PAGE_TEMPLATES.find((t) => t === e.target.value) ?? 'default' })} />
              {record && <p className="pg-hint">Last saved {formatDateTime(record.updatedAt)}</p>}
            </div>

           <div className="pg-card">
              <h2>Image</h2>
             <ImageUploader value={draft.imageUrl} error={errors['imageUrl']} onChange={(imageUrl) => patch({ imageUrl })} />
           </div>

            <div className="pg-card">
              <h2>Show in menu</h2>
              <CheckboxField label="Header" checked={draft.showInHeader} onChange={(e) => patch({ showInHeader: e.target.checked })} />
              <CheckboxField label="Footer" checked={draft.showInFooter} onChange={(e) => patch({ showInFooter: e.target.checked })} />
            </div>
          </aside>
        </div>
      )}

      <ConfirmDialog
        open={leaveOpen}
        title="Leave without saving?"
        message="Your changes on this page will be lost."
        confirmLabel="Leave page"
        danger
        onConfirm={() => { setLeaveOpen(false); onBack(); }}
        onCancel={() => setLeaveOpen(false)}
      />
    </section>
  );
}
