import type { PageInput } from './schema';
import type { PageRecord } from './types';

export function emptyPageInput(): PageInput {
  return {
    name: '',
    slug: '',
    description: '',
    status: 'draft',
    template: 'default',
    imageUrl: '',
    blocks: [],
    faqs: [],
    seoTitle: '',
    seoDescription: '',
    noindex: false,
    showInHeader: false,
    showInFooter: false,
  };
}

/** Picks only the editable fields from a stored record. */
export function toInput(record: PageRecord): PageInput {
  return {
    name: record.name,
    slug: record.slug,
    description: record.description,
    status: record.status,
    template: record.template,
    imageUrl: record.imageUrl,
    blocks: record.blocks.map((b) => ({ ...b })),
    faqs: record.faqs.map((f) => ({ ...f })),
    seoTitle: record.seoTitle,
    seoDescription: record.seoDescription,
    noindex: record.noindex,
    showInHeader: record.showInHeader,
    showInFooter: record.showInFooter,
  };
}
