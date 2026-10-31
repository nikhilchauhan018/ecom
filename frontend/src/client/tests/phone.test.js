import { describe, it } from 'node:test';
import assert from 'node:assert';
import { detectCountry, matchDialCode, resolvePhone } from '../utils/phone.js';
import { validatePhone } from '../utils/validators.js';

describe('detectCountry', () => {
  it('prefers the user\'s saved choice over everything else', () => {
    const result = detectCountry({ saved: 'GB', serverHint: 'IN', timeZone: 'Asia/Kolkata', languages: ['en-US'] });
    assert.deepStrictEqual(result, { code: 'GB', source: 'saved' });
  });

  it('then the server IP hint', () => {
    const result = detectCountry({ serverHint: 'AE', timeZone: 'Asia/Kolkata', languages: ['en-US'] });
    assert.deepStrictEqual(result, { code: 'AE', source: 'server' });
  });

  it('then the time zone, which beats a generic en-US browser language', () => {
    const result = detectCountry({ timeZone: 'Asia/Kolkata', languages: ['en-US'] });
    assert.deepStrictEqual(result, { code: 'IN', source: 'timezone' });
    assert.strictEqual(detectCountry({ timeZone: 'Asia/Calcutta' }).code, 'IN');
    assert.strictEqual(detectCountry({ timeZone: 'America/Los_Angeles' }).code, 'US');
  });

  it('then the browser language region', () => {
    const result = detectCountry({ timeZone: 'Etc/UTC', languages: ['hi', 'en-GB'] });
    assert.deepStrictEqual(result, { code: 'GB', source: 'language' });
  });

  it('ignores unknown values and falls back', () => {
    assert.deepStrictEqual(detectCountry({ saved: 'ZZ', serverHint: 'QQ', timeZone: 'Mars/Base', languages: ['xx-YY'] }), {
      code: 'US',
      source: 'fallback',
    });
    assert.deepStrictEqual(detectCountry({ fallback: 'IN' }), { code: 'IN', source: 'fallback' });
    assert.strictEqual(detectCountry({ fallback: 'ZZ' }).code, 'US');
    assert.strictEqual(detectCountry().source, 'fallback');
  });
});

describe('matchDialCode', () => {
  it('finds the longest matching dial code', () => {
    assert.strictEqual(matchDialCode('919876543210').code, 'IN');
    assert.strictEqual(matchDialCode('447700900123').code, 'GB');
    assert.strictEqual(matchDialCode('971501234567').code, 'AE');
    assert.strictEqual(matchDialCode('353871234567').code, 'IE');
  });

  it('prefers the selected country among countries sharing a code', () => {
    assert.strictEqual(matchDialCode('15555550142').code, 'US');
    assert.strictEqual(matchDialCode('15555550142', 'CA').code, 'CA');
    assert.strictEqual(matchDialCode('15555550142', 'IN').code, 'US');
  });

  it('returns null when nothing matches', () => {
    assert.strictEqual(matchDialCode('0000'), null);
    assert.strictEqual(matchDialCode(''), null);
    assert.strictEqual(matchDialCode(undefined), null);
  });
});

describe('resolvePhone', () => {
  it('builds E.164 from the selected country and national digits', () => {
    assert.deepStrictEqual(resolvePhone('98765 43210', 'IN'), {
      e164: '+919876543210',
      country: 'IN',
      national: '9876543210',
      international: false,
    });
    assert.strictEqual(resolvePhone('(555) 555-0142', 'US').e164, '+15555550142');
  });

  it('drops the leading trunk zero', () => {
    assert.strictEqual(resolvePhone('07700 900123', 'GB').e164, '+447700900123');
    assert.strictEqual(resolvePhone('09876543210', 'IN').e164, '+919876543210');
  });

  it('lets a pasted +number override the selected country', () => {
    const result = resolvePhone('+44 7700 900123', 'IN');
    assert.deepStrictEqual(result, {
      e164: '+447700900123',
      country: 'GB',
      national: '7700900123',
      international: true,
    });
  });

  it('treats a 00 prefix like +', () => {
    assert.strictEqual(resolvePhone('0091 98765 43210', 'US').e164, '+919876543210');
    assert.strictEqual(resolvePhone('0091 98765 43210', 'US').country, 'IN');
    assert.strictEqual(resolvePhone('0044 7700 900123', 'IN').e164, '+447700900123');
  });

  it('keeps the selected country when a +number shares its dial code', () => {
    assert.strictEqual(resolvePhone('+1 555 555 0142', 'CA').country, 'CA');
  });

  it('returns an empty number for empty input', () => {
    assert.strictEqual(resolvePhone('', 'IN').e164, '');
    assert.strictEqual(resolvePhone('   ', 'IN').e164, '');
    assert.strictEqual(resolvePhone('abc', 'IN').e164, '');
    assert.strictEqual(resolvePhone(null, 'IN').e164, '');
  });

  it('produces numbers that pass E.164 validation, or are rejected when too short', () => {
    assert.strictEqual(validatePhone(resolvePhone('98765 43210', 'IN').e164).valid, true);
    assert.strictEqual(validatePhone(resolvePhone('123', 'IN').e164).valid, false);
    assert.strictEqual(validatePhone(resolvePhone('', 'IN').e164).error, 'required');
  });
});
