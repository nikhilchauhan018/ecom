import { z } from 'zod';

/**
 * Single source of truth for blog data. Types are inferred from these schemas.
 * SERVER: run the same validation again on the backend.
 */

export const POST_STATUSES = ['published', 'draft'] as const;

export const LIMITS = {
  title: 150,
  slug: 80,
  excerpt: 300,
  heading: 150,
  text: 10000,
  quote: 500,
  cite: 100,
  alt: 125,
  termName: 60,
  termDescription: 200,
  seoTitle: 70,
  seoDescription: 160,
  maxBlocks: 100,
  maxTags: 10,
  totalChars: 100000,
} as const;

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
// Control characters except tab, line feed and carriage return.
// eslint-disable-next-line no-control-regex
const CONTROL_CHARS_RE = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/;

const text = (max: number, min = 0) => {
  let schema = z.string().trim().max(max, `Use ${max} characters or fewer`);
  if (min > 0) schema = schema.min(min, 'This field is required');
  return schema.refine((v) => !CONTROL_CHARS_RE.test(v), 'Contains characters that are not allowed');
};

export const slugSchema = z
  .string()
  .trim()
  .min(1, 'Permalink is required')
  .max(LIMITS.slug, `Use ${LIMITS.slug} characters or fewer`)
  .regex(SLUG_RE, 'Use lowercase letters, numbers and single hyphens only');

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

const requiredHttpsUrl = httpsUrl.refine((v) => v !== '', 'Upload an image or paste an https:// link');
const blockId = z.string().min(1).max(64);
const dbId = z.number().int().positive();

export const postBlockSchema = z.discriminatedUnion('type', [
  z.object({ id: blockId, type: z.literal('heading'), text: text(LIMITS.heading, 1), level: z.union([z.literal(2), z.literal(3)]) }),
  z.object({ id: blockId, type: z.literal('text'), text: text(LIMITS.text, 1) }),
  z.object({ id: blockId, type: z.literal('quote'), text: text(LIMITS.quote, 1), cite: text(LIMITS.cite) }),
  z.object({ id: blockId, type: z.literal('image'), url: requiredHttpsUrl, alt: text(LIMITS.alt, 1) }),
]);

const charCount = (blocks: z.infer<typeof postBlockSchema>[]) =>
  blocks.reduce((sum, b) => sum + (b.type === 'image' ? b.alt.length : b.text.length), 0);

export const postInputSchema = z
  .object({
    title: text(LIMITS.title, 1),
    slug: slugSchema,
    excerpt: text(LIMITS.excerpt),
    status: z.enum(POST_STATUSES),
    categoryId: dbId.nullable(),
    tagIds: z
      .array(dbId)
      .max(LIMITS.maxTags, `Use ${LIMITS.maxTags} tags or fewer`)
      .refine((ids) => new Set(ids).size === ids.length, 'Each tag can be added only once'),
    imageUrl: httpsUrl,
    blocks: z.array(postBlockSchema).max(LIMITS.maxBlocks, `Use ${LIMITS.maxBlocks} blocks or fewer`),
    seoTitle: text(LIMITS.seoTitle),
    seoDescription: text(LIMITS.seoDescription),
    noindex: z.boolean(),
  })
  .refine((post) => charCount(post.blocks) <= LIMITS.totalChars, { message: 'This post is too long. Split it into two posts', path: ['blocks'] });

/** Categories and tags share the same shape. Tags simply leave description empty. */
export const termInputSchema = z.object({
  name: text(LIMITS.termName, 1),
  slug: slugSchema,
  description: text(LIMITS.termDescription),
});

export type PostInput = z.infer<typeof postInputSchema>;
export type PostBlock = z.infer<typeof postBlockSchema>;
export type PostBlockType = PostBlock['type'];
export type PostStatus = (typeof POST_STATUSES)[number];
export type TermInput = z.infer<typeof termInputSchema>;
