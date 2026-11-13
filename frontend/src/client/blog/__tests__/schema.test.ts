import { describe, expect, it } from 'vitest';
import { issuesToErrors } from '../utils';
import { emptyPostInput } from '../defaults';
import { LIMITS, postInputSchema, termInputSchema } from '../schema';

const valid = () => ({ ...emptyPostInput(), title: 'Linen care', slug: 'linen-care' });
const errorsFor = (input: unknown) => {
  const r = postInputSchema.safeParse(input);
  return r.success ? {} : issuesToErrors(r.error);
};

describe('postInputSchema', () => {
  it('accepts a minimal valid post', () => {
    expect(postInputSchema.safeParse(valid()).success).toBe(true);
  });
  it('requires a title and a valid permalink', () => {
    expect(errorsFor({ ...valid(), title: '  ' })['title']).toBeDefined();
    for (const slug of ['', 'Has Space', 'a_b', '-a', 'a-', 'a--b', '../etc/passwd', 'a/b']) {
      expect(errorsFor({ ...valid(), slug })['slug'], slug).toBeDefined();
    }
  });
  it('allows only https featured images', () => {
    expect(errorsFor({ ...valid(), imageUrl: 'https://cdn.example.com/a.jpg' })).toEqual({});
    for (const imageUrl of ['http://x.com/a.jpg', 'javascript:alert(1)', 'data:text/html,<b>', 'file:///etc/passwd', '//evil.com/a.jpg', 'nope']) {
      expect(errorsFor({ ...valid(), imageUrl })['imageUrl'], imageUrl).toBeDefined();
    }
  });
  it('rejects control characters but keeps script-like text as plain text', () => {
    expect(errorsFor({ ...valid(), title: 'Bad\u0000title' })['title']).toBeDefined();
    const r = postInputSchema.safeParse({ ...valid(), excerpt: '<script>alert(1)</script>' });
    expect(r.success && r.data.excerpt).toBe('<script>alert(1)</script>');
  });
  it('rejects raw HTML or unknown block types', () => {
    expect(postInputSchema.safeParse({ ...valid(), blocks: [{ id: 'x', type: 'html', html: '<b>x</b>' }] }).success).toBe(false);
    expect(postInputSchema.safeParse({ ...valid(), status: 'archived' }).success).toBe(false);
  });
  it('validates block fields with exact error paths', () => {
    const blocks = [
      { id: 'a', type: 'text' as const, text: '' },
      { id: 'b', type: 'image' as const, url: '', alt: '' },
      { id: 'c', type: 'image' as const, url: 'http://x.com/a.png', alt: 'ok' },
      { id: 'd', type: 'quote' as const, text: 'Hi', cite: 'x'.repeat(LIMITS.cite + 1) },
    ];
    const e = errorsFor({ ...valid(), blocks });
    expect(e['blocks.0.text']).toBeDefined();
    expect(e['blocks.1.url']).toBeDefined();
    expect(e['blocks.1.alt']).toBeDefined();
    expect(e['blocks.2.url']).toBeDefined();
    expect(e['blocks.3.cite']).toBeDefined();
  });
  it('limits blocks, tags and total length', () => {
    const many = Array.from({ length: LIMITS.maxBlocks + 1 }, (_, i) => ({ id: `b${i}`, type: 'text' as const, text: 'x' }));
    expect(errorsFor({ ...valid(), blocks: many })['blocks']).toBeDefined();
    expect(errorsFor({ ...valid(), tagIds: Array.from({ length: 11 }, (_, i) => i + 1) })['tagIds']).toBeDefined();
    const huge = Array.from({ length: 11 }, (_, i) => ({ id: `h${i}`, type: 'text' as const, text: 'x'.repeat(LIMITS.text) }));
    expect(errorsFor({ ...valid(), blocks: huge })['blocks']).toBeDefined();
  });
  it('rejects duplicate, zero, negative, decimal and non-numeric tag or category ids', () => {
    expect(errorsFor({ ...valid(), tagIds: [1, 1] })['tagIds']).toBeDefined();
    for (const bad of [0, -1, 1.5, '1', NaN]) {
      expect(errorsFor({ ...valid(), tagIds: [bad] })['tagIds.0'], String(bad)).toBeDefined();
      expect(errorsFor({ ...valid(), categoryId: bad })['categoryId'], String(bad)).toBeDefined();
    }
  });
});

describe('termInputSchema', () => {
  it('accepts a normal category', () => {
    expect(termInputSchema.safeParse({ name: 'Style guides', slug: 'style-guides', description: '' }).success).toBe(true);
  });
  it('rejects empty names, bad slugs and long descriptions', () => {
    const bad = (over: object) => termInputSchema.safeParse({ name: 'A', slug: 'a', description: '', ...over }).success;
    expect(bad({ name: '' })).toBe(false);
    expect(bad({ slug: 'A B' })).toBe(false);
    expect(bad({ description: 'x'.repeat(LIMITS.termDescription + 1) })).toBe(false);
  });
});
