import { useCallback, useEffect, useState } from 'react';
import { listRevisions, restoreRevision } from '../services/pagesService';
import type { PageRecord, Revision } from '../types';
import { formatDateTime } from '../utils/format';
import { ConfirmDialog } from './ConfirmDialog';

interface Props {
  pageId: number;
  /** Changes on every save so the list refreshes. */
  version: string;
  hasUnsavedChanges: boolean;
  onRestored: (page: PageRecord) => void;
}

export function RevisionsPanel({ pageId, version, hasUnsavedChanges, onRestored }: Props) {
  const [revisions, setRevisions] = useState<Revision[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [target, setTarget] = useState<Revision | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await listRevisions(pageId);
      if (res.ok) {
        setRevisions(res.data);
        setError(null);
      } else {
        setError(res.error.message);
      }
    } catch {
      setError('Could not load revisions. Try again.');
    }
  }, [pageId]);

  useEffect(() => {
    void load();
  }, [load, version]);

  async function confirmRestore() {
    if (!target || busy) return;
    setBusy(true);
    try {
      const res = await restoreRevision(pageId, target.id);
      if (res.ok) {
        onRestored(res.data);
        setTarget(null);
      } else {
        setError(res.error.fieldErrors?.['slug'] ?? res.error.message);
        setTarget(null);
      }
    } catch {
      setError('Could not restore this version. Try again.');
      setTarget(null);
    } finally {
      setBusy(false);
    }
  }

  if (error && !revisions) return <p className="pg-error">{error}</p>;
  if (!revisions) return <p className="pg-empty">Loading revisions…</p>;

  return (
    <div className="pg-card">
      <h2>Revision history</h2>
      {error && <p className="pg-error">{error}</p>}
      <ul className="pg-rev-list">
        {revisions.map((r, i) => (
          <li key={r.id}>
            <div>
              <div className="pg-rev-note">{r.note}</div>
              <div className="pg-hint">{formatDateTime(r.createdAt)} by {r.author}</div>
            </div>
            {i === 0 ? <span className="pg-hint">Current</span> : <button type="button" className="pg-btn pg-btn-sm" onClick={() => setTarget(r)}>Restore</button>}
          </li>
        ))}
      </ul>
      <p className="pg-hint">Restoring an older version creates a new revision. Nothing is lost.</p>
      <ConfirmDialog
        open={target !== null}
        title="Restore this version?"
        message={hasUnsavedChanges ? 'You have unsaved changes on the Detail tab. They will be replaced by this version.' : 'The page will go back to how it looked at that time.'}
        confirmLabel="Restore version"
        busy={busy}
        onConfirm={() => void confirmRestore()}
        onCancel={() => setTarget(null)}
      />
    </div>
  );
}
