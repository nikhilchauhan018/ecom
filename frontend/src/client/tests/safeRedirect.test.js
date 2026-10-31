import { describe, it } from 'node:test';
import assert from 'node:assert';
import { safeRedirectPath } from '../utils/safeRedirect.js';

describe('safeRedirectPath (open-redirect protection)', () => {
  it('keeps same-site paths, query and hash', () => {
    assert.strictEqual(safeRedirectPath('/orders/1042'), '/orders/1042');
    assert.strictEqual(safeRedirectPath('/orders?filter=active#top'), '/orders?filter=active#top');
  });

  it('rejects absolute and protocol-relative URLs', () => {
    assert.strictEqual(safeRedirectPath('https://evil.com'), '/account');
    assert.strictEqual(safeRedirectPath('//evil.com'), '/account');
    assert.strictEqual(safeRedirectPath('///evil.com'), '/account');
    assert.strictEqual(safeRedirectPath('javascript:alert(1)'), '/account');
    assert.strictEqual(safeRedirectPath('data:text/html,hi'), '/account');
  });

  it('rejects backslash tricks and control characters', () => {
    assert.strictEqual(safeRedirectPath('/\\evil.com'), '/account');
    assert.strictEqual(safeRedirectPath('/ok\u0000/path'), '/account');
    assert.strictEqual(safeRedirectPath('/ok\n/path'), '/account');
  });

  it('never redirects back to /login (loop) and ignores non-strings', () => {
    assert.strictEqual(safeRedirectPath('/login?next=/x'), '/account');
    assert.strictEqual(safeRedirectPath(null), '/account');
    assert.strictEqual(safeRedirectPath(undefined), '/account');
    assert.strictEqual(safeRedirectPath({ a: 1 }), '/account');
  });

  it('uses a custom fallback and bounds length', () => {
    assert.strictEqual(safeRedirectPath('nope', '/'), '/');
    assert.strictEqual(safeRedirectPath(`/${'a'.repeat(3000)}`), '/account');
  });
});
