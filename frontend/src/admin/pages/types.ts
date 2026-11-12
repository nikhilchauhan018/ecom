import type { PageInput, PageStatus, PageTemplate } from './schema';

export interface PageRecord extends PageInput {
  id: number;
  /** System pages (privacy, terms...) cannot be deleted or change their permalink. */
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Revision {
  id: string;
  pageId: number;
  createdAt: string;
  author: string;
  note: string;
  snapshot: PageInput;
}

export type FieldErrors = Record<string, string>;

export interface ServiceError {
  code: 'VALIDATION' | 'NOT_FOUND' | 'CONFLICT' | 'FORBIDDEN';
  message: string;
  fieldErrors?: FieldErrors;
}

export type Result<T> = { ok: true; data: T } | { ok: false; error: ServiceError };

export interface PagesQuery {
  search: string;
  status: 'all' | PageStatus;
  template: 'all' | PageTemplate;
  page: number;
  pageSize: number;
}

export interface ListResult {
  items: PageRecord[];
  total: number;
  page: number;
  pageSize: number;
}
