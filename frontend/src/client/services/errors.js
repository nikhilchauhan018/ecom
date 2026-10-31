/**
 * Error shape shared by every service (mock now, REST later).
 * `code` is a stable machine-readable string; never put secrets in `meta`.
 */
export class ApiError extends Error {
  /**
   * @param {number} status HTTP-like status
   * @param {string} code
   * @param {{ message?: string, meta?: Record<string, any>, fieldErrors?: Record<string, string> | null }} [options]
   */
  constructor(status, code, { message, meta, fieldErrors } = {}) {
    super(message || code);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.meta = meta || {};
    this.fieldErrors = fieldErrors || null;
  }
}
