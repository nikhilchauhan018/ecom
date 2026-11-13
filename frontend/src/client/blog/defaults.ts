import type { PostInput, TermInput } from './schema';
import type { PostRecord } from './types';

export const emptyPostInput = (): PostInput => ({
  title: '',
  slug: '',
  excerpt: '',
  status: 'draft',
  categoryId: null,
  tagIds: [],
  imageUrl: '',
  blocks: [],
  seoTitle: '',
  seoDescription: '',
  noindex: false,
});

export const emptyTermInput = (): TermInput => ({ name: '', slug: '', description: '' });

export function toPostInput(r: PostRecord): PostInput {
  return {
    title: r.title,
    slug: r.slug,
    excerpt: r.excerpt,
    status: r.status,
    categoryId: r.categoryId,
    tagIds: [...r.tagIds],
    imageUrl: r.imageUrl,
    blocks: r.blocks.map((b) => ({ ...b })),
    seoTitle: r.seoTitle,
    seoDescription: r.seoDescription,
    noindex: r.noindex,
  };
}
