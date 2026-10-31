import { describe, it } from 'node:test';
import assert from 'node:assert';
import en from '../locales/en.js';
import { formatWait, getErrorMessage, isAuthError, translateFieldErrors } from '../utils/errors.js';

/** Same lookup + interpolation rules as the useT hook. */
function t(path, params = {}) {
  let value = en;
  for (const key of path.split('.')) {
    if (value && typeof value === 'object' && key in value) value = value[key];
    else return path;
  }
  if (typeof value !== 'string') return path;
  return Object.entries(params).reduce((acc, [k, v]) => acc.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v)), value);
}

describe('getErrorMessage', () => {
  it('maps known codes to friendly copy', () => {
    assert.strictEqual(getErrorMessage(t, { code: 'otp_expired' }), 'That code has expired. Request a new one.');
    assert.strictEqual(getErrorMessage(t, { code: 'not_found' }), 'We could not find that.');
  });

  it('includes remaining attempts and wait time', () => {
    assert.strictEqual(
      getErrorMessage(t, { code: 'otp_invalid', meta: { attemptsLeft: 3 } }),
      'That code is not correct. 3 attempts left.'
    );
    assert.strictEqual(getErrorMessage(t, { code: 'otp_invalid', meta: {} }), 'That code is not correct.');
    assert.strictEqual(
      getErrorMessage(t, { code: 'rate_limited', meta: { retryAfterSec: 20 } }),
      'Too many attempts. Please try again in 20s.'
    );
    assert.strictEqual(
      getErrorMessage(t, { code: 'rate_limited', meta: { retryAfterSec: 900 } }),
      'Too many attempts. Please try again in 15 min.'
    );
  });

  it('never leaks unknown codes or raw messages', () => {
    const generic = 'Something went wrong. Please try again.';
    assert.strictEqual(getErrorMessage(t, { code: 'sql_syntax_error_near', message: 'SELECT * FROM users' }), generic);
    assert.strictEqual(getErrorMessage(t, new Error('stack trace here')), generic);
    assert.strictEqual(getErrorMessage(t, null), generic);
  });
});

describe('error helpers', () => {
  it('formats waits', () => {
    assert.strictEqual(formatWait(t, 1), '1s');
    assert.strictEqual(formatWait(t, 61), '2 min');
    assert.strictEqual(formatWait(t, 0), '1s');
  });

  it('translates field errors with a safe fallback', () => {
    assert.deepStrictEqual(translateFieldErrors(t, { name: 'required', email: 'invalidEmail', x: 'weird' }), {
      name: 'This field is required.',
      email: 'Enter a valid email address.',
      x: 'This contains characters that are not allowed.',
    });
    assert.deepStrictEqual(translateFieldErrors(t, null), {});
  });

  it('detects auth failures', () => {
    assert.strictEqual(isAuthError({ status: 401 }), true);
    assert.strictEqual(isAuthError({ code: 'session_expired' }), true);
    assert.strictEqual(isAuthError({ status: 404 }), false);
    assert.strictEqual(isAuthError(null), false);
  });
});
