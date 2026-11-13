import { useEffect, useMemo, useRef, useState } from 'react';
import { ConfirmDialog, StatusBadge } from './ui';
import { useDebounced, usePostsList } from '../hooks';
import { formatDate } from '../utils';
import { POST_STATUSES, type PostStatus } from '../schema';
import { deletePost, listTerms } from '../services/blogService';
import type { PostRecord, PostsQuery, TermWithCount } from '../types';

type Notice = { kind: 'success' | 'error'; text: string } | null;

interface Props {
  onCreate: () => void;
  onEdit: (id: number) => void;
}

export function PostsListView({ onCreate, onEdit }: Props) {
  const [searchInput, setSearchInput] = useState('');
  const search = useDebounced(searchInput.trim(), 300);
  const [status, setStatus] = useState<'all' | PostStatus>('all');
  const [categoryId, setCategoryId] = useState<'all' | number>('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [categories, setCategories] = useState<TermWithCount[]>([]);
  const [confirm, setConfirm] = useState<PostRecord | null>(null);
  const [notice, setNotice] = useState<Notice>(null);
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);

  const query = useMemo<PostsQuery>(() => ({ search, status, categoryId, page, pageSize }), [search, status, categoryId, page, pageSize]);
  const { data, loading, error, reload } = usePostsList(query);
  const items = data?.items ?? [];
  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;
  const filtersActive = searchInput !== '' || status !== 'all' || categoryId !== 'all';

  useEffect(() => {
    let cancelled = false;
    listTerms('category')
      .then((res) => {
        if (!cancelled && res.ok) setCategories(res.data);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => setPage(1), [search, status, categoryId, pageSize]);
  useEffect(() => {
    if (data && data.page !== page) setPage(data.page);
  }, [data, page]);

  const categoryName = (id: number | null) => (id === null ? 'Uncategorized' : categories.find((c) => c.id === id)?.name ?? 'Uncategorized');

  async function confirmDelete() {
    if (!confirm || busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    try {
      const res = await deletePost(confirm.id);
      setNotice(res.ok ? { kind: 'success', text: `"${confirm.title}" was deleted.` } : { kind: 'error', text: res.error.message });
      reload();
    } catch {
      setNotice({ kind: 'error', text: 'Something went wrong. Please try again.' });
    } finally {
      busyRef.current = false;
      setBusy(false);
      setConfirm(null);
    }
  }

  return (
    <section aria-labelledby="blog-posts-title">
      <header className="bl-header">
        <div>
          <p className="bl-crumb">Dashboard / Blog</p>
          <h1 id="blog-posts-title">Posts</h1>
        </div>
        <div className="bl-actions">
          <button type="button" className="bl-btn" onClick={reload} disabled={loading}>Reload</button>
          <button type="button" className="bl-btn bl-btn-primary" onClick={onCreate}>Create post</button>
        </div>
      </header>

      <div className="bl-card">
        <div className="bl-toolbar-group">
          <label className="bl-sr" htmlFor="blog-status">Filter by status</label>
          <select id="blog-status" className="bl-input bl-input-auto" value={status} onChange={(e) => setStatus(e.target.value as 'all' | PostStatus)}>
            <option value="all">All statuses</option>
            {POST_STATUSES.map((s) => (
              <option key={s} value={s}>{s === 'published' ? 'Published' : 'Draft'}</option>
            ))}
          </select>
          <label className="bl-sr" htmlFor="blog-category">Filter by category</label>
          <select id="blog-category" className="bl-input bl-input-auto" value={categoryId === 'all' ? 'all' : String(categoryId)} onChange={(e) => setCategoryId(e.target.value === 'all' ? 'all' : Number(e.target.value))}>
            <option value="all">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <label className="bl-sr" htmlFor="blog-search">Search posts by title</label>
          <input id="blog-search" className="bl-input bl-input-auto" type="search" placeholder="Search by title" maxLength={100} value={searchInput} onChange={(e) => setSearchInput(e.target.value)} />
        </div>

        <div role="status" aria-live="polite">
          {notice && <p className={notice.kind === 'success' ? 'bl-notice bl-notice-ok' : 'bl-notice bl-notice-error'}>{notice.text}</p>}
        </div>

        {error ? (
          <div className="bl-empty">
            <p>{error}</p>
            <button type="button" className="bl-btn" onClick={reload}>Try again</button>
          </div>
        ) : (
          <div className="bl-table-wrap" aria-busy={loading}>
            <table className="bl-table">
              <caption className="bl-sr">Posts</caption>
              <thead>
                <tr>
                  <th scope="col">ID</th>
                  <th scope="col">Title</th>
                  <th scope="col">Category</th>
                  <th scope="col">Status</th>
                  <th scope="col">Published</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((p) => (
                  <tr key={p.id}>
                    <td>{p.id}</td>
                    <td><button type="button" className="bl-link" onClick={() => onEdit(p.id)}>{p.title}</button></td>
                    <td>{categoryName(p.categoryId)}</td>
                    <td><StatusBadge status={p.status} /></td>
                    <td>{p.publishedAt ? formatDate(p.publishedAt) : 'Not published'}</td>
                    <td>
                      <span className="bl-row-actions">
                        <button type="button" className="bl-btn bl-btn-sm" onClick={() => onEdit(p.id)} aria-label={`Edit ${p.title}`}>Edit</button>
                        <button type="button" className="bl-btn bl-btn-sm bl-btn-danger" onClick={() => setConfirm(p)} disabled={busy} aria-label={`Delete ${p.title}`}>Delete</button>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {loading && items.length === 0 && <p className="bl-empty">Loading posts…</p>}
            {!loading && items.length === 0 && (
              <div className="bl-empty">
                <p>{filtersActive ? 'No posts match your filters.' : 'No posts yet. Create your first post.'}</p>
                {filtersActive && <button type="button" className="bl-btn" onClick={() => { setSearchInput(''); setStatus('all'); setCategoryId('all'); }}>Clear filters</button>}
              </div>
            )}
          </div>
        )}

        <footer className="bl-pager">
          <span className="bl-hint">{data ? `Showing ${items.length} of ${data.total} posts` : ''}</span>
          <span className="bl-pager-controls">
            <label className="bl-sr" htmlFor="blog-size">Rows per page</label>
            <select id="blog-size" className="bl-input bl-input-auto" value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))}>
              {[5, 10, 20, 50].map((n) => (
                <option key={n} value={n}>{n} per page</option>
              ))}
            </select>
            <button type="button" className="bl-btn bl-btn-sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1 || loading}>Previous</button>
            <span className="bl-hint">Page {page} of {totalPages}</span>
            <button type="button" className="bl-btn bl-btn-sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages || loading}>Next</button>
          </span>
        </footer>
      </div>

      <ConfirmDialog open={confirm !== null} danger busy={busy} title={`Delete "${confirm?.title ?? ''}"?`} message="This cannot be undone." confirmLabel="Delete" onConfirm={() => void confirmDelete()} onCancel={() => setConfirm(null)} />
    </section>
  );
}
