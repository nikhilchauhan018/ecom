import { useEffect, useMemo, useRef, useState } from 'react';
import { usePagesList } from '../hooks/usePagesList';
import { useDebounced } from '../hooks/useDebounced';
import { PAGE_STATUSES, PAGE_TEMPLATES, type PageStatus, type PageTemplate } from '../schema';
import { bulkDelete, bulkSetStatus, deletePage } from '../services/pagesService';
import type { PageRecord, PagesQuery } from '../types';
import { formatDate } from '../utils/format';
import { ConfirmDialog } from './ConfirmDialog';
import { StatusBadge } from './StatusBadge';

export const TEMPLATE_LABELS: Record<PageTemplate, string> = {
  default: 'Default',
  'full-width': 'Full width',
  sidebar: 'With sidebar',
  'coming-soon': 'Coming soon',
};

type BulkAction = '' | 'publish' | 'draft' | 'delete';
type Confirm = { kind: 'one'; page: PageRecord } | { kind: 'bulk' } | null;
type Notice = { kind: 'success' | 'error'; text: string } | null;

interface Props {
  onCreate: () => void;
  onEdit: (id: number) => void;
}

export function PagesListView({ onCreate, onEdit }: Props) {
  const [searchInput, setSearchInput] = useState('');
  const search = useDebounced(searchInput.trim(), 300);
  const [status, setStatus] = useState<'all' | PageStatus>('all');
  const [template, setTemplate] = useState<'all' | PageTemplate>('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selected, setSelected] = useState<ReadonlySet<number>>(new Set());
  const [bulk, setBulk] = useState<BulkAction>('');
  const [confirm, setConfirm] = useState<Confirm>(null);
  const [notice, setNotice] = useState<Notice>(null);
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);

  const query = useMemo<PagesQuery>(() => ({ search, status, template, page, pageSize }), [search, status, template, page, pageSize]);
  const { data, loading, error, reload } = usePagesList(query);
  const items = data?.items ?? [];

  // Filters change the result set, so go back to page 1 and clear the selection.
  useEffect(() => {
    setPage(1);
    setSelected(new Set());
  }, [search, status, template, pageSize]);

  // The service clamps out-of-range pages (for example after deleting the last row).
  useEffect(() => {
    if (data && data.page !== page) setPage(data.page);
  }, [data, page]);

  const allSelected = items.length > 0 && items.every((p) => selected.has(p.id));
  const someSelected = items.some((p) => selected.has(p.id));
  const headerCheckRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (headerCheckRef.current) headerCheckRef.current.indeterminate = someSelected && !allSelected;
  }, [someSelected, allSelected]);

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;
  const filtersActive = searchInput !== '' || status !== 'all' || template !== 'all';

  function toggle(id: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function run(task: () => Promise<string | { error: string }>) {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    try {
      const outcome = await task();
      setNotice(typeof outcome === 'string' ? { kind: 'success', text: outcome } : { kind: 'error', text: outcome.error });
      setSelected(new Set());
      setBulk('');
      reload();
    } catch {
      setNotice({ kind: 'error', text: 'Something went wrong. Please try again.' });
    } finally {
      busyRef.current = false;
      setBusy(false);
      setConfirm(null);
    }
  }

  function applyBulk() {
    if (selected.size === 0 || bulk === '') return;
    const ids = [...selected];
    if (bulk === 'delete') {
      setConfirm({ kind: 'bulk' });
      return;
    }
    const next: PageStatus = bulk === 'publish' ? 'published' : 'draft';
    void run(async () => {
      const res = await bulkSetStatus(ids, next);
      return res.ok ? `${res.data.updated} page(s) updated.` : { error: res.error.message };
    });
  }

  function confirmDelete() {
    if (!confirm) return;
    if (confirm.kind === 'one') {
      const target = confirm.page;
      void run(async () => {
        const res = await deletePage(target.id);
        return res.ok ? `"${target.name}" was deleted.` : { error: res.error.message };
      });
    } else {
      const ids = [...selected];
      void run(async () => {
        const res = await bulkDelete(ids);
        if (!res.ok) return { error: res.error.message };
        return res.data.skipped > 0
          ? `${res.data.deleted} deleted. ${res.data.skipped} system page(s) were kept.`
          : `${res.data.deleted} page(s) deleted.`;
      });
    }
  }

  function clearFilters() {
    setSearchInput('');
    setStatus('all');
    setTemplate('all');
  }

  return (
    <section aria-labelledby="pg-list-title">
      <header className="pg-header">
        <div>
          <p className="pg-crumb">Dashboard / Content</p>
          <h1 id="pg-list-title">Pages</h1>
        </div>
        <div className="pg-actions">
          <button type="button" className="pg-btn" onClick={reload} disabled={loading}>Reload</button>
          <button type="button" className="pg-btn pg-btn-primary" onClick={onCreate}>Create page</button>
        </div>
      </header>

      <div className="pg-card">
        <div className="pg-toolbar">
          <div className="pg-toolbar-group">
            <label className="pg-sr" htmlFor="pg-bulk">Bulk action</label>
            <select id="pg-bulk" className="pg-input pg-input-auto" value={bulk} onChange={(e) => setBulk(e.target.value as BulkAction)}>
              <option value="">Bulk actions</option>
              <option value="publish">Publish</option>
              <option value="draft">Move to draft</option>
              <option value="delete">Delete</option>
            </select>
            <button type="button" className="pg-btn" onClick={applyBulk} disabled={busy || bulk === '' || selected.size === 0}>Apply</button>
            <label className="pg-sr" htmlFor="pg-status">Filter by status</label>
            <select id="pg-status" className="pg-input pg-input-auto" value={status} onChange={(e) => setStatus(e.target.value as 'all' | PageStatus)}>
              <option value="all">All statuses</option>
              {PAGE_STATUSES.map((s) => (
                <option key={s} value={s}>{s === 'published' ? 'Published' : 'Draft'}</option>
              ))}
            </select>
            <label className="pg-sr" htmlFor="pg-template">Filter by template</label>
            <select id="pg-template" className="pg-input pg-input-auto" value={template} onChange={(e) => setTemplate(e.target.value as 'all' | PageTemplate)}>
              <option value="all">All templates</option>
              {PAGE_TEMPLATES.map((t) => (
                <option key={t} value={t}>{TEMPLATE_LABELS[t]}</option>
              ))}
            </select>
            <label className="pg-sr" htmlFor="pg-search">Search pages by name</label>
            <input id="pg-search" className="pg-input pg-input-auto" type="search" placeholder="Search by name" maxLength={100} value={searchInput} onChange={(e) => setSearchInput(e.target.value)} />
          </div>
          <span className="pg-hint" aria-live="polite">{selected.size > 0 ? `${selected.size} selected` : ''}</span>
        </div>

        <div role="status" aria-live="polite">
          {notice && <p className={notice.kind === 'success' ? 'pg-notice pg-notice-ok' : 'pg-notice pg-notice-error'}>{notice.text}</p>}
        </div>

        {error ? (
          <div className="pg-empty">
            <p>{error}</p>
            <button type="button" className="pg-btn" onClick={reload}>Try again</button>
          </div>
        ) : (
          <div className="pg-table-wrap" aria-busy={loading}>
            <table className="pg-table">
              <caption className="pg-sr">Pages</caption>
              <thead>
                <tr>
                  <th scope="col" className="pg-col-check"><input ref={headerCheckRef} type="checkbox" aria-label="Select all pages on this screen" checked={allSelected} onChange={() => setSelected(allSelected ? new Set() : new Set(items.map((p) => p.id)))} disabled={items.length === 0} /></th>
                  <th scope="col">ID</th>
                  <th scope="col">Name</th>
                  <th scope="col">Template</th>
                  <th scope="col">Created</th>
                  <th scope="col">Status</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((p) => (
                  <tr key={p.id} className={selected.has(p.id) ? 'pg-row-selected' : undefined}>
                    <td className="pg-col-check"><input type="checkbox" aria-label={`Select ${p.name}`} checked={selected.has(p.id)} onChange={() => toggle(p.id)} /></td>
                    <td>{p.id}</td>
                    <td>
                      <button type="button" className="pg-link" onClick={() => onEdit(p.id)}>{p.name}</button>
                      {p.isSystem && <span className="pg-tag">System</span>}
                    </td>
                    <td>{TEMPLATE_LABELS[p.template]}</td>
                    <td>{formatDate(p.createdAt)}</td>
                    <td><StatusBadge status={p.status} /></td>
                    <td>
                      <span className="pg-row-actions">
                        <button type="button" className="pg-btn pg-btn-sm" onClick={() => onEdit(p.id)} aria-label={`Edit ${p.name}`}>Edit</button>
                        <button type="button" className="pg-btn pg-btn-sm pg-btn-danger" onClick={() => setConfirm({ kind: 'one', page: p })} disabled={p.isSystem || busy} aria-label={`Delete ${p.name}`} title={p.isSystem ? 'System pages cannot be deleted' : undefined}>Delete</button>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {loading && items.length === 0 && <p className="pg-empty">Loading pages…</p>}
            {!loading && items.length === 0 && (
              <div className="pg-empty">
                <p>{filtersActive ? 'No pages match your filters.' : 'No pages yet. Create your first page.'}</p>
                {filtersActive && <button type="button" className="pg-btn" onClick={clearFilters}>Clear filters</button>}
              </div>
            )}
          </div>
        )}

        <footer className="pg-pager">
          <span className="pg-hint">{data ? `Showing ${items.length} of ${data.total} pages` : ''}</span>
          <span className="pg-pager-controls">
            <label className="pg-sr" htmlFor="pg-size">Rows per page</label>
            <select id="pg-size" className="pg-input pg-input-auto" value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))}>
              {[5, 10, 20, 50].map((n) => (
                <option key={n} value={n}>{n} per page</option>
              ))}
            </select>
            <button type="button" className="pg-btn pg-btn-sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1 || loading}>Previous</button>
            <span className="pg-hint">Page {page} of {totalPages}</span>
            <button type="button" className="pg-btn pg-btn-sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages || loading}>Next</button>
          </span>
        </footer>
      </div>

      <ConfirmDialog
        open={confirm !== null}
        danger
        busy={busy}
        title={confirm?.kind === 'one' ? `Delete "${confirm.page.name}"?` : `Delete ${selected.size} page(s)?`}
        message="This cannot be undone. System pages are always kept."
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setConfirm(null)}
      />
    </section>
  );
}
