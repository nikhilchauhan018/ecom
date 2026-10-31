import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  isValidId,
  maskPhone,
  normalizePhone,
  sanitizeMultiline,
  sanitizeText,
  validateAddress,
  validateEmail,
  validateName,
  validatePhone,
  validatePostalCode,
  validateProfile,
} from '../utils/validators.js';

const validAddress = {
  label: 'home',
  fullName: 'Alex Morgan',
  phone: '+1 (555) 555-0142',
  line1: '221 Market Street',
  line2: '',
  city: 'San Francisco',
  state: 'CA',
  postalCode: '94105',
  country: 'US',
  isDefault: false,
};

describe('phone helpers', () => {
  it('normalizes formatting but keeps the leading +', () => {
    assert.strictEqual(normalizePhone('+1 (555) 555-0142'), '+15555550142');
    assert.strictEqual(normalizePhone('555 555'), '555555');
    assert.strictEqual(normalizePhone('abc'), '');
  });

  it('requires E.164 style numbers', () => {
    assert.strictEqual(validatePhone('+15555550142').valid, true);
    assert.strictEqual(validatePhone('5555550142').error, 'invalidPhone');
    assert.strictEqual(validatePhone('+0123456789').error, 'invalidPhone');
    assert.strictEqual(validatePhone('+1234').error, 'invalidPhone');
    assert.strictEqual(validatePhone('').error, 'required');
  });

  it('masks all but the country code and last 4 digits', () => {
    assert.strictEqual(maskPhone('+15555550142'), '+15 •••••0142');
    assert.strictEqual(maskPhone('garbage'), '');
  });
});

describe('text sanitising', () => {
  it('strips control characters and collapses whitespace', () => {
    assert.strictEqual(sanitizeText('  Alex\u0000\u0007   Morgan \n '), 'Alex Morgan');
    assert.strictEqual(sanitizeText(null), '');
  });

  it('enforces max length', () => {
    assert.strictEqual(sanitizeText('abcdef', 3), 'abc');
  });

  it('keeps single line breaks in multiline text', () => {
    assert.strictEqual(sanitizeMultiline('a\r\nb\n\n\n\nc\u0000'), 'a\nb\n\nc');
  });
});

describe('field validators', () => {
  it('accepts real names and rejects markup or digits', () => {
    assert.strictEqual(validateName("Mary-Jane O'Neil").error, null);
    assert.strictEqual(validateName('José Álvarez').error, null);
    assert.strictEqual(validateName('A').error, 'tooShort');
    assert.strictEqual(validateName('12345').error, 'invalid');
    assert.strictEqual(validateName('<script>alert(1)</script>').error, 'invalid');
    assert.strictEqual(validateName('x'.repeat(200)).error, 'tooLong');
    assert.strictEqual(validateName('').error, 'required');
  });

  it('validates and lowercases email, optional by default', () => {
    assert.deepStrictEqual(validateEmail(' Alex@Example.COM '), { value: 'alex@example.com', error: null });
    assert.strictEqual(validateEmail('').error, null);
    assert.strictEqual(validateEmail('', { required: true }).error, 'required');
    assert.strictEqual(validateEmail('not-an-email').error, 'invalidEmail');
    assert.strictEqual(validateEmail('a b@c.com').error, 'invalidEmail');
  });

  it('validates postal codes per country', () => {
    assert.strictEqual(validatePostalCode('94105', 'US').error, null);
    assert.strictEqual(validatePostalCode('94105-1234', 'US').error, null);
    assert.strictEqual(validatePostalCode('9410', 'US').error, 'invalidPostal');
    assert.strictEqual(validatePostalCode('560001', 'IN').error, null);
    assert.strictEqual(validatePostalCode('sw1a 1aa', 'GB').error, null);
    assert.strictEqual(validatePostalCode('', 'US').error, 'required');
  });

  it('validates profile input together', () => {
    const ok = validateProfile({ name: ' Alex Morgan ', email: 'ALEX@example.com' });
    assert.strictEqual(ok.valid, true);
    assert.deepStrictEqual(ok.values, { name: 'Alex Morgan', email: 'alex@example.com' });

    const bad = validateProfile({ name: '', email: 'nope' });
    assert.strictEqual(bad.valid, false);
    assert.deepStrictEqual(Object.keys(bad.errors).sort(), ['email', 'name']);
  });

  it('only accepts opaque, URL-safe ids', () => {
    assert.strictEqual(isValidId('a_12-X'), true);
    assert.strictEqual(isValidId('../etc/passwd'), false);
    assert.strictEqual(isValidId(''), false);
    assert.strictEqual(isValidId(42), false);
    assert.strictEqual(isValidId('x'.repeat(41)), false);
  });
});

describe('validateAddress', () => {
  it('accepts a complete address and normalises the phone', () => {
    const result = validateAddress(validAddress);
    assert.strictEqual(result.valid, true);
    assert.strictEqual(result.values.phone, '+15555550142');
    assert.strictEqual(result.values.isDefault, false);
  });

  it('flags every missing/invalid field', () => {
    const result = validateAddress({ ...validAddress, fullName: '', line1: 'ab', postalCode: '!!', country: 'XX', label: 'boat', phone: '123' });
    assert.strictEqual(result.valid, false);
    assert.deepStrictEqual(
      Object.keys(result.errors).sort(),
      ['country', 'fullName', 'label', 'line1', 'phone', 'postalCode']
    );
  });

  it('treats line2 as optional', () => {
    assert.strictEqual(validateAddress({ ...validAddress, line2: '' }).valid, true);
  });
});
