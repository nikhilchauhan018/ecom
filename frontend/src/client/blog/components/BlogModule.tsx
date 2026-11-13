import { useState } from 'react';
import '../blog.css';
import { PostEditorView } from './PostEditorView';
import { PostsListView } from './PostsListView';
import { TermsView } from './TermsView';

export type BlogSection = 'posts' | 'categories' | 'tags';
type PostsView = { name: 'list' } | { name: 'edit'; id: number | null };

function PostsSection() {
  const [view, setView] = useState<PostsView>({ name: 'list' });
  return view.name === 'list' ? (
    <PostsListView onCreate={() => setView({ name: 'edit', id: null })} onEdit={(id) => setView({ name: 'edit', id })} />
  ) : (
    <PostEditorView key={view.id ?? 'new'} postId={view.id} onBack={() => setView({ name: 'list' })} />
  );
}

/**
 * Mount once per sidebar link:
 *   Blog > Posts       <BlogModule section="posts" />
 *   Blog > Categories  <BlogModule section="categories" />
 *   Blog > Tags        <BlogModule section="tags" />
 */
export function BlogModule({ section = 'posts' }: { section?: BlogSection }) {
  return (
    <div className="bl-root">
      {section === 'posts' ? <PostsSection /> : <TermsView key={section} kind={section === 'categories' ? 'category' : 'tag'} />}
    </div>
  );
}
