import { z } from 'zod';

/**
 * Single source of truth for page data.
 * Types are inferred from these schemas, so the form, the service and
 * (later) the backend can all share the same rules.
 *
 * SERVER: re-run this same validation on the backend. Never trust the client.
 */

export const PAGE_STATUSES = ['published', 'draft'] as const;
export const PAGE_TEMPLATES = ['default', 'full-width', 'sidebar', 'coming-soon'] as const;
export const RESERVED_SLUGS = [
  'admin', 'api', 'login', 'logout', 'cart', 'checkout', 'account',
  'products', 'collections', 'search', 'orders',
] as const;

export const LIMITS = {
  name: 120,
  slug: 80,
  description: 300,
  heading: 120,
  blockText: 5000,
  address: 200,
  seoTitle: 70,
  seoDescription: 160,
  question: 200,
  answer: 1000,
  maxBlocks: 30,
  maxFaqs: 20,
  maxProductsInCollection: 24,
} as const;

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const PHONE_RE = /^\+?[0-9][0-9\s-]{6,19}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Control characters except tab, line feed and carriage return.
// eslint-disable-next-line no-control-regex
const CONTROL_CHARS_RE = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/;

const text = (max: number, min = 0) => {
  let schema = z.string().trim().max(max, `Use ${max} characters or fewer`);
  if (min > 0) schema = schema.min(min, 'This field is required');
  return schema.refine((v) => !CONTROL_CHARS_RE.test(v), 'Contains characters that are not allowed');
};

const slugPart = z
  .string()
  .trim()
  .min(1, 'This field is required')
  .max(LIMITS.slug, `Use ${LIMITS.slug} characters or fewer`)
  .regex(SLUG_RE, 'Use lowercase letters, numbers and single hyphens only');

export const slugSchema = slugPart.refine(
  (v) => !(RESERVED_SLUGS as readonly string[]).includes(v),
  'This permalink is reserved. Choose another one',
);

const httpsUrl = z
  .string()
  .trim()
  .max(2048, 'URL is too long')
  .refine((v) => {
    if (v === '') return true;
    try {
      return new URL(v).protocol === 'https:';
    } catch {
      return false;
    }
  }, 'Enter a valid URL starting with https://');

const optionalPhone = text(20).refine((v) => v === '' || PHONE_RE.test(v), 'Enter a valid phone number');
const optionalEmail = text(120).refine((v) => v === '' || EMAIL_RE.test(v), 'Enter a valid email address');
const id = z.string().min(1).max(64);

export const blockSchema = z.discriminatedUnion('type', [
  z.object({ id, type: z.literal('heading'), text: text(LIMITS.heading, 1), level: z.union([z.literal(2), z.literal(3)]) }),
  z.object({ id, type: z.literal('text'), text: text(LIMITS.blockText, 1) }),
  z.object({ id, type: z.literal('map'), address: text(LIMITS.address, 1) }),
  z.object({ id, type: z.literal('contactInfo'), title: text(80, 1), phone: optionalPhone, email: optionalEmail }),
  z.object({ id, type: z.literal('contactForm'), successMessage: text(200, 1) }),
  z.object({
    id,
    type: z.literal('productCollection'),
    collectionSlug: slugPart,
    limit: z.number('Enter a number').int('Use a whole number').min(1, 'Minimum is 1').max(LIMITS.maxProductsInCollection, `Maximum is ${LIMITS.maxProductsInCollection}`),
  }),
  z.object({ id, type: z.literal('sizeGuide'), title: text(80, 1), unit: z.enum(['cm', 'inch']) }),
  z.object({ id, type: z.literal('newsletter'), heading: text(100, 1) }),
]);

export const faqSchema = z.object({
  id,
  question: text(LIMITS.question, 1),
  answer: text(LIMITS.answer, 1),
});

export const pageInputSchema = z.object({
  name: text(LIMITS.name, 1),
  slug: slugSchema,
  description: text(LIMITS.description),
  status: z.enum(PAGE_STATUSES),
  template: z.enum(PAGE_TEMPLATES),
  imageUrl: httpsUrl,
  blocks: z.array(blockSchema).max(LIMITS.maxBlocks, `Use ${LIMITS.maxBlocks} blocks or fewer`),
  faqs: z.array(faqSchema).max(LIMITS.maxFaqs, `Use ${LIMITS.maxFaqs} questions or fewer`),
  seoTitle: text(LIMITS.seoTitle),
  seoDescription: text(LIMITS.seoDescription),
  noindex: z.boolean(),
  showInHeader: z.boolean(),
  showInFooter: z.boolean(),
});

export type PageInput = z.infer<typeof pageInputSchema>;
export type Block = z.infer<typeof blockSchema>;
export type BlockType = Block['type'];
export type Faq = z.infer<typeof faqSchema>;
export type PageStatus = (typeof PAGE_STATUSES)[number];
export type PageTemplate = (typeof PAGE_TEMPLATES)[number];
