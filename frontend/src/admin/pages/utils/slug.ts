import { LIMITS } from '../schema';

/** Full conversion, used for auto-generating a permalink from a name. */
export function slugify(input: string): string {
  return input
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, LIMITS.slug)
    .replace(/-+$/g, '');
}

/**
 * Lenient conversion while the user is typing. Keeps a trailing hyphen so
 * "navy-" can become "navy-jacket". Call slugify() on blur to finish.
 */
export function normalizeSlugInput(input: string): string {
  return input
    .toLowerCase()
    .replace(/[\s_]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-{2,}/g, '-')
    .replace(/^-+/, '')
    .slice(0, LIMITS.slug);
}
