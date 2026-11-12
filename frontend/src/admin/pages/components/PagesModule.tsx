import { useState } from 'react';
import '../pages.css';
import { PageEditorView } from './PageEditorView';
import { PagesListView } from './PagesListView';

type View = { name: 'list' } | { name: 'edit'; id: number | null };

/** Entry point. Mount this inside your admin layout or router. */
export function PagesModule() {
  const [view, setView] = useState<View>({ name: 'list' });
  return (
    <div className="pg-root">
      {view.name === 'list' ? (
        <PagesListView onCreate={() => setView({ name: 'edit', id: null })} onEdit={(id) => setView({ name: 'edit', id })} />
      ) : (
        <PageEditorView key={view.id ?? 'new'} pageId={view.id} onBack={() => setView({ name: 'list' })} />
      )}
    </div>
  );
}
