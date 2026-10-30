import { describe, it } from 'node:test';
import assert from 'node:assert';
import { safeJsonLd, buildHomeJsonLd } from '../utils/seo.js';

describe('SEO and JSON-LD schema builder', () => {
  it('escapes < characters to \\u003c to prevent script injection', () => {
    const dangerous = { snippet: '<script>alert("test")</script>' };
    const escaped = safeJsonLd(dangerous);
    assert(!escaped.includes('<script>'));
    assert(escaped.includes('\\u003cscript>'));
  });

  it('builds valid WebSite schema with SearchAction query-input', () => {
    const schemas = buildHomeJsonLd({ storeName: 'Test Brand' });
    const website = schemas.find((s) => s['@type'] === 'WebSite');
    assert(website);
    assert.strictEqual(website.name, 'Test Brand');
    assert(website.potentialAction.target.includes('/search?q={search_term_string}'));
  });
});
