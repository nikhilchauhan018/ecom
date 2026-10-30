import { mockHomeData } from '../data/home.mock';

/**
 * Retrieves Home page data matching the API contract.
 * @returns {Promise<import('../types/home').HomeData>}
 */
export async function getHomeData() {
  return Promise.resolve(mockHomeData);
}

/**
 * Retrieves critical above-the-fold Home data (hero, categories, seasons).
 * @returns {Promise<{ hero: import('../types/home').HeroSection, categories: import('../types/home').Category[], seasons: import('../types/home').Season[] }>}
 */
export async function getHomeCriticalData() {
  return Promise.resolve({
    hero: mockHomeData.hero,
    categories: mockHomeData.categories,
    seasons: mockHomeData.seasons,
  });
}

/**
 * Retrieves streamed new arrivals data with optional latency simulation.
 * @param {number} [delayMs=0]
 * @returns {Promise<import('../types/home').Product[]>}
 */
export async function getNewArrivals(delayMs = 0) {
  if (delayMs > 0) {
    await new Promise((r) => setTimeout(r, delayMs));
  }
  return mockHomeData.newArrivals;
}
