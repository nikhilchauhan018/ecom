import { describe, expect, it } from 'vitest';
import { MAX_IMAGE_BYTES, normalizeSlugInput, slugify, validateImageFile } from '../utils';

describe('slugify', () => {
  it('lowercases and joins words with hyphens', () => {
    expect(slugify('Navy Travel Jacket')).toBe('navy-travel-jacket');
  });
  it('removes accents, symbols and edge hyphens', () => {
    expect(slugify('  Café & Co. -- 2026!  ')).toBe('cafe-co-2026');
  });
  it('returns an empty string when nothing usable is left', () => {
    expect(slugify('!!!')).toBe('');
  });
  it('never exceeds 80 characters or ends with a hyphen', () => {
    const out = slugify(`${'a'.repeat(79)} b`);
    expect(out.length).toBeLessThanOrEqual(80);
    expect(out.endsWith('-')).toBe(false);
  });
  it('removes path and script characters', () => {
    expect(slugify('../../etc/passwd')).toBe('etc-passwd');
    expect(slugify('<script>x</script>')).toBe('script-x-script');
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

const PNG = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0];
const JPG = [0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0, 0, 0, 0, 0];
const WEBP = [0x52, 0x49, 0x46, 0x46, 1, 2, 3, 4, 0x57, 0x45, 0x42, 0x50];
const file = (bytes: number[], name: string, type: string) => new File([new Uint8Array(bytes)], name, { type });

describe('validateImageFile', () => {
  it('accepts real PNG, JPG and WebP files', async () => {
    expect((await validateImageFile(file(PNG, 'a.png', 'image/png'))).ok).toBe(true);
    expect((await validateImageFile(file(JPG, 'a.jpg', 'image/jpeg'))).ok).toBe(true);
    expect((await validateImageFile(file(WEBP, 'a.webp', 'image/webp'))).ok).toBe(true);
  });
  it('rejects a fake image (script renamed to .png)', async () => {
    const fake = new File(['<script>alert(1)</script>'], 'evil.png', { type: 'image/png' });
    expect((await validateImageFile(fake)).ok).toBe(false);
  });
  it('rejects a PNG that claims to be a JPG', async () => {
    expect((await validateImageFile(file(PNG, 'a.jpg', 'image/jpeg'))).ok).toBe(false);
  });
  it('rejects SVG, GIF and other types', async () => {
    expect((await validateImageFile(file(PNG, 'a.svg', 'image/svg+xml'))).ok).toBe(false);
    expect((await validateImageFile(file(PNG, 'a.gif', 'image/gif'))).ok).toBe(false);
    expect((await validateImageFile(file(PNG, 'a.pdf', 'application/pdf'))).ok).toBe(false);
  });
  it('rejects empty and oversized files', async () => {
    expect((await validateImageFile(file([], 'a.png', 'image/png'))).ok).toBe(false);
    const big = new File([new Uint8Array(MAX_IMAGE_BYTES + 1)], 'big.png', { type: 'image/png' });
    expect((await validateImageFile(big)).ok).toBe(false);
  });
});
