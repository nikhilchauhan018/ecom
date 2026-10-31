import { COUNTRY_CODES } from '../config/countries.js';

/**
 * Input validation + sanitisation shared by forms and mock services.
 * Field validators return `{ value, error }` where `error` is a code
 * (see `validation.*` in the locale) or null. The server MUST repeat these checks.
 */

export const LIMITS = Object.freeze({
  name: 80,
  email: 254,
  addressLine: 120,
  city: 60,
  state: 60,
  postalCode: 12,
  comment: 500,
});

export const ADDRESS_LABELS = ['home', 'work', 'other'];

const NAME_PATTERN = /^[\p{L}\p{M}][\p{L}\p{M}\s'.-]*$/u;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_PATTERN = /^\+[1-9]\d{7,14}$/;
const ID_PATTERN = /^[A-Za-z0-9_-]{1,40}$/;

const POSTAL_PATTERNS = {
  US: /^\d{5}(-\d{4})?$/,
  IN: /^\d{6}$/,
  GB: /^[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}$/i,
  CA: /^[A-Z]\d[A-Z] ?\d[A-Z]\d$/i,
  AU: /^\d{4}$/,
  AE: /^[A-Za-z0-9 -]{0,10}$/,
};
const GENERIC_POSTAL = /^[A-Za-z0-9][A-Za-z0-9 -]{1,10}$/;

/** Strips control characters, collapses whitespace and trims. */
export function sanitizeText(value, maxLength = 1000) {
  return String(value ?? '')
    .replace(/\p{Cc}/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);
}

/** Like sanitizeText but keeps line breaks (for comments). */
export function sanitizeMultiline(value, maxLength = LIMITS.comment) {
  return String(value ?? '')
    .replace(/\r\n?/g, '\n')
    .replace(/\p{Cc}/gu, (char) => (char === '\n' ? char : ''))
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
    .slice(0, maxLength);
}

/** Keeps a leading "+" and digits only. */
export function normalizePhone(input) {
  const raw = String(input ?? '').trim();
  const digits = raw.replace(/\D/g, '');
  if (!digits) return '';
  return `${raw.startsWith('+') ? '+' : ''}${digits}`;
}

export function validatePhone(input) {
  const value = normalizePhone(input);
  if (!value) return { value, error: 'required', valid: false };
  if (!PHONE_PATTERN.test(value)) return { value, error: 'invalidPhone', valid: false };
  return { value, error: null, valid: true };
}

/** "+919876543210" -> "+91 ••••••3210". Returns '' for invalid numbers. */
export function maskPhone(phone) {
  const normalized = normalizePhone(phone);
  if (!PHONE_PATTERN.test(normalized)) return '';
  const digits = normalized.slice(1);
  return `+${digits.slice(0, 2)} ${'•'.repeat(digits.length - 6)}${digits.slice(-4)}`;
}

export function validateName(input) {
  const value = sanitizeText(input);
  if (!value) return { value, error: 'required' };
  if (value.length < 2) return { value, error: 'tooShort' };
  if (value.length > LIMITS.name) return { value, error: 'tooLong' };
  if (!NAME_PATTERN.test(value)) return { value, error: 'invalid' };
  return { value, error: null };
}

export function validateEmail(input, { required = false } = {}) {
  const value = sanitizeText(input).toLowerCase();
  if (!value) return { value, error: required ? 'required' : null };
  if (value.length > LIMITS.email || !EMAIL_PATTERN.test(value)) {
    return { value, error: 'invalidEmail' };
  }
  return { value, error: null };
}

export function validateText(input, { min = 1, max = 120, required = true } = {}) {
  const value = sanitizeText(input);
  if (!value) return { value, error: required ? 'required' : null };
  if (value.length < min) return { value, error: 'tooShort' };
  if (value.length > max) return { value, error: 'tooLong' };
  return { value, error: null };
}

export function validatePostalCode(input, country) {
  const value = sanitizeText(input).toUpperCase();
  if (!value) return { value, error: 'required' };
  const pattern = POSTAL_PATTERNS[country] || GENERIC_POSTAL;
  if (!pattern.test(value)) return { value, error: 'invalidPostal' };
  return { value, error: null };
}

/** True for opaque ids safe to put in a URL path / look up. */
export function isValidId(id) {
  return typeof id === 'string' && ID_PATTERN.test(id);
}

function collect(results) {
  const values = {};
  const errors = {};
  for (const [key, result] of Object.entries(results)) {
    values[key] = result.value;
    if (result.error) errors[key] = result.error;
  }
  return { values, errors, valid: Object.keys(errors).length === 0 };
}

/** @returns {{ values: { name: string, email: string }, errors: Record<string,string>, valid: boolean }} */
export function validateProfile(input = {}) {
  return collect({
    name: validateName(input.name),
    email: validateEmail(input.email),
  });
}

/** @returns {{ values: object, errors: Record<string,string>, valid: boolean }} */
export function validateAddress(input = {}) {
  const country = COUNTRY_CODES.includes(input.country) ? input.country : '';
  const label = ADDRESS_LABELS.includes(input.label) ? input.label : '';

  const result = collect({
    fullName: validateName(input.fullName),
    phone: validatePhone(input.phone),
    line1: validateText(input.line1, { min: 3, max: LIMITS.addressLine }),
    line2: validateText(input.line2, { max: LIMITS.addressLine, required: false }),
    city: validateText(input.city, { min: 2, max: LIMITS.city }),
    state: validateText(input.state, { min: 2, max: LIMITS.state }),
    postalCode: validatePostalCode(input.postalCode, country),
  });

  if (!country) result.errors.country = 'required';
  if (!label) result.errors.label = 'required';
  result.values.country = country;
  result.values.label = label;
  result.values.isDefault = Boolean(input.isDefault);
  result.valid = Object.keys(result.errors).length === 0;
  return result;
}
