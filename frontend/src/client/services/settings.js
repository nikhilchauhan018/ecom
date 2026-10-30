import { mockSettings } from '../data/settings.mock';

/**
 * Retrieves white-label store settings.
 * Designed to switch from mock data to REST endpoint with zero component changes.
 * @returns {Promise<import('../types/settings').Settings>}
 */
export async function getSettings() {
  // If a real backend URL is configured, fetch('/api/store/settings') can be called here.
  return Promise.resolve(mockSettings);
}
