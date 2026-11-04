/**
 * Loads one page of orders. If the requested page is past the end (for example the last order on the
 * last page was just deleted), it returns the last real page instead, with `meta.page` set to that page.
 * `list` is the service function (`listOrders`), passed in so this stays testable.
 */
export async function loadOrdersPage(list, query) {
  const result = await list(query);
  const { total, totalPages } = result.meta;
  if (!result.data.length && total && query.page > totalPages) {
    return list({ ...query, page: totalPages });
  }
  return result;
}
