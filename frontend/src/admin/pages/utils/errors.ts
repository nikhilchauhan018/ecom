import type { ZodError } from 'zod';
import type { FieldErrors } from '../types';

/** Converts a Zod error into { "blocks.2.text": "message" }, first message per field. */
export function issuesToErrors(error: ZodError): FieldErrors {
  const out: FieldErrors = {};
  for (const issue of error.issues) {
    const key = issue.path.map(String).join('.') || '_form';
    if (!(key in out)) out[key] = issue.message;
  }
  return out;
}
