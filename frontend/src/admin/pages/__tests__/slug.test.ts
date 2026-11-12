import { describe, expect, it } from 'vitest';
import { normalizeSlugInput, slugify } from '../utils/slug';

describe('slugify', () => {
  it('lowercases and joins words with hyphens', () => {
    expect(slugify('Navy Travel Jacket')).toBe('navy-travel-jacket');
  });
  it('removes accents, symbols and edge hyphens', () => {
    expect(slugify('  Café & Co. -- 2026!  ')).toBe('cafe-co-2026');
  });
  it('returns an empty string when nothing usable is left', () => {
    expect(slugify('!!!')).toBe('');
    expect(slugify('')).toBe('');
  });
  it('never exceeds 80 characters or ends with a hyphen', () => {
    const out = slugify(`${'a'.repeat(79)} b`);
    expect(out.length).toBeLessThanOrEqual(80);
    expect(out.endsWith('-')).toBe(false);
  });
});

describe('normalizeSlugInput', () => {
  it('keeps a trailing hyphen while typing', () => {
    expect(normalizeSlugInput('Navy ')).toBe('navy-');
  });
  it('strips invalid characters and collapses hyphens', () => {
    expect(normalizeSlugInput('a<b>--c/d')).toBe('ab-cd');
  });
});
