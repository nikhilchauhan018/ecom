import type { PageStatus } from '../schema';

export function StatusBadge({ status }: { status: PageStatus }) {
  return <span className={status === 'published' ? 'pg-badge pg-badge-live' : 'pg-badge pg-badge-draft'}>{status === 'published' ? 'Published' : 'Draft'}</span>;
}
