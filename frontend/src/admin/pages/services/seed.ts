import type { Block, Faq, PageStatus, PageTemplate } from '../schema';
import type { PageRecord, Revision } from '../types';
import { slugify } from '../utils/slug';

function seedPage(
  id: number,
  name: string,
  template: PageTemplate,
  status: PageStatus,
  isSystem: boolean,
  blocks: Block[] = [],
  faqs: Faq[] = [],
): PageRecord {
  const stamp = `2026-09-12T09:${String(id).padStart(2, '0')}:00.000Z`;
  return {
    id,
    name,
    slug: slugify(name),
    description: '',
    status,
    template,
    imageUrl: '',
    blocks,
    faqs,
    seoTitle: '',
    seoDescription: '',
    noindex: false,
    showInHeader: false,
    showInFooter: isSystem,
    isSystem,
    createdAt: stamp,
    updatedAt: stamp,
  };
}

export function createSeed(): { pages: PageRecord[]; revisions: Revision[]; nextId: number } {
  const pages: PageRecord[] = [
    seedPage(1, 'About us', 'default', 'published', false, [
      { id: 'b-1-1', type: 'heading', text: 'Clothing made for everyday life', level: 2 },
      { id: 'b-1-2', type: 'text', text: 'We design every piece in-house and check each order ourselves.' },
    ]),
    seedPage(2, 'Privacy policy', 'default', 'published', true),
    seedPage(3, 'Terms and conditions', 'default', 'published', true),
    seedPage(4, 'Refund policy', 'default', 'published', true),
    seedPage(5, 'Shipping and returns', 'default', 'published', false),
    seedPage(6, 'FAQs', 'default', 'published', false),
    seedPage(
      7,
      'Contact',
      'full-width',
      'published',
      false,
      [
        { id: 'b-7-1', type: 'text', text: 'We would love to hear from you. Reach out for order help or sizing questions.' },
        { id: 'b-7-2', type: 'map', address: 'Shop address, City, State, PIN' },
        { id: 'b-7-3', type: 'contactInfo', title: 'Contact us for any questions', phone: '', email: '' },
        { id: 'b-7-4', type: 'contactForm', successMessage: 'Thanks. We will reply within one working day.' },
      ],
      [
        { id: 'f-7-1', question: 'How long does delivery take?', answer: 'Orders arrive in 3 to 5 working days in most cities.' },
        { id: 'f-7-2', question: 'Can I exchange a size?', answer: 'Yes, within 7 days of delivery if the tags are intact.' },
      ],
    ),
    seedPage(8, 'Cookie policy', 'default', 'published', true),
    seedPage(9, 'Size guide', 'default', 'draft', false, [{ id: 'b-9-1', type: 'sizeGuide', title: 'Size guide', unit: 'cm' }]),
    seedPage(10, 'Careers', 'default', 'published', false),
    seedPage(11, 'Lookbook', 'full-width', 'draft', false),
    seedPage(12, 'Coming soon', 'coming-soon', 'published', false),
  ];

  const revisions: Revision[] = pages.map((p) => ({
    id: `r-${p.id}-1`,
    pageId: p.id,
    createdAt: p.createdAt,
    author: 'Admin',
    note: 'Page created',
    snapshot: snapshotOf(p),
  }));

  return { pages, revisions, nextId: pages.length + 1 };
}

export function snapshotOf(p: PageRecord): Revision['snapshot'] {
  const { id: _id, isSystem: _s, createdAt: _c, updatedAt: _u, ...input } = p;
  return JSON.parse(JSON.stringify(input)) as Revision['snapshot'];
}
