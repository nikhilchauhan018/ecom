/**
 * HTTP client utility shaped for future REST integration.
 * Reads VITE_API_URL from environment with fallback.
 */

const BASE_URL = typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace(/\/$/, '')
  : '';

/**
 * Standard HTTP request wrapper with consistent error shapes.
 * @param {string} endpoint
 * @param {RequestInit} [options]
 * @returns {Promise<any>}
 */
export async function http(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(options.headers || {}),
  };

  try {
    const res = await fetch(url, { ...options, headers });
    if (!res.ok) {
      const errorBody = await res.json().catch(() => ({}));
      throw {
        status: res.status,
        message: errorBody.message || `Request failed with status ${res.status}`,
        details: errorBody,
      };
    }
    return await res.json();
  } catch (err) {
    if (err.status) {
      throw err;
    }
    throw {
      status: 0,
      message: err.message || 'Network error encountered',
      details: err,
    };
  }
}
