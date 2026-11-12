import { describe, expect, it } from 'vitest';
import { emptyPageInput } from '../defaults';
import { pageInputSchema } from '../schema';
import { issuesToErrors } from '../utils/errors';

const valid = () => ({ ...emptyPageInput(), name: 'About us', slug: 'about-us' });
const errorsFor = (input: unknown) => {
  const r = pageInputSchema.safeParse(input);
  return r.success ? {} : issuesToErrors(r.error);
};

describe('pageInputSchema', () => {
  it('accepts a minimal valid page', () => {
    expect(pageInputSchema.safeParse(valid()).success).toBe(true);
  });
  it('requires a name', () => {
    expect(errorsFor({ ...valid(), name: '   ' })['name']).toBeDefined();
  });
  it('rejects bad and reserved permalinks', () => {
    for (const slug of ['', 'Has Space', 'under_score', '-start', 'end-', 'a--b', 'admin', 'checkout']) {
      expect(errorsFor({ ...valid(), slug })['slug'], slug).toBeDefined();
    }
  });
  it('allows only https image URLs', () => {
    expect(errorsFor({ ...valid(), imageUrl: 'https://cdn.example.com/a.jpg' })).toEqual({});
    for (const imageUrl of ['http://x.com/a.jpg', 'javascript:alert(1)', 'data:text/html,hi', 'not a url']) {
      expect(errorsFor({ ...valid(), imageUrl })['imageUrl'], imageUrl).toBeDefined();
    }
  });
  it('rejects control characters', () => {
    expect(errorsFor({ ...valid(), name: 'Bad\u0000name' })['name']).toBeDefined();
  });
  it('keeps script-like text as plain text instead of executing or stripping it', () => {
    const parsed = pageInputSchema.safeParse({ ...valid(), description: '<script>alert(1)</script>' });
    expect(parsed.success && parsed.data.description).toBe('<script>alert(1)</script>');
  });
  it('limits the number of blocks and FAQs', () => {
    const blocks = Array.from({ length: 31 }, (_, i) => ({ id: `b${i}`, type: 'text' as const, text: 'x' }));
    expect(errorsFor({ ...valid(), blocks })['blocks']).toBeDefined();
    const faqs = Array.from({ length: 21 }, (_, i) => ({ id: `f${i}`, question: 'q', answer: 'a' }));
    expect(errorsFor({ ...valid(), faqs })['faqs']).toBeDefined();
  });
  it('validates block fields with exact paths', () => {
    const blocks = [
      { id: 'a', type: 'text' as const, text: '' },
      { id: 'b', type: 'productCollection' as const, collectionSlug: 'new-arrivals', limit: 2.5 },
      { id: 'c', type: 'contactInfo' as const, title: 'Hi', phone: 'abc', email: 'nope' },
    ];
    const e = errorsFor({ ...valid(), blocks });
    expect(e['blocks.0.text']).toBeDefined();
    expect(e['blocks.1.limit']).toBeDefined();
    expect(e['blocks.2.phone']).toBeDefined();
    expect(e['blocks.2.email']).toBeDefined();
  });
  it('rejects unknown block types and statuses', () => {
    expect(pageInputSchema.safeParse({ ...valid(), blocks: [{ id: 'x', type: 'html', html: '<b>x</b>' }] }).success).toBe(false);
    expect(pageInputSchema.safeParse({ ...valid(), status: 'archived' }).success).toBe(false);
  });
});
