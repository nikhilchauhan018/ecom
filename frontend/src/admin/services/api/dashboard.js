import { dashboardMock } from '../../data/dashboard.mock.js';

const delay = (value) => new Promise((resolve) => setTimeout(() => resolve(value), 120));

/**
 * Everything the dashboard shows, in one response (future: GET /admin/dashboard/summary).
 * Returns a copy, so a screen can never change the source data by accident.
 */
export async function getDashboardSummary() {
  return delay(structuredClone(dashboardMock));
}
