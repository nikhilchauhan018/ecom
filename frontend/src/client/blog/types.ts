import type { PostInput, PostStatus, TermInput } from './schema';

export type TermKind = 'category' | 'tag';

export interface Term extends TermInput {
  id: number;
  createdAt: string;
}

export interface TermWithCount extends Term {
  postCount: number;
}

export interface PostRecord extends PostInput {
  id: number;
  author: string;
  createdAt: string;
  updatedAt: string;
  /** Set by the server the first time a post is published. */
  publishedAt: string | null;
}

export interface PostsQuery {
  search: string;
  status: 'all' | PostStatus;
  categoryId: 'all' | number;
  page: number;
  pageSize: number;
}

export interface PostsList {
  items: PostRecord[];
  total: number;
  page: number;
  pageSize: number;
}

export type FieldErrors = Record<string, string>;

export interface ServiceError {
  code: 'VALIDATION' | 'NOT_FOUND' | 'CONFLICT' | 'FORBIDDEN';
  message: string;
  fieldErrors?: FieldErrors;
}

export type Result<T> = { ok: true; data: T } | { ok: false; error: ServiceError };
