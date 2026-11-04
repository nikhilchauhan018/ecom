/**
 * Page buttons to show for a pager: numbers and `'ellipsis'` gaps. Always includes the first and last page
 * and the pages around the current one, in at most 7 slots.
 */
export function getPageItems(page, totalPages) {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, index) => index + 1);
  if (page <= 4) return [1, 2, 3, 4, 5, 'ellipsis', totalPages];
  if (page >= totalPages - 3) return [1, 'ellipsis', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  return [1, 'ellipsis', page - 1, page, page + 1, 'ellipsis', totalPages];
}

/** "Showing from X to Y" numbers for the current page. */
export function pageRange(page, pageSize, total) {
  return { first: total ? (page - 1) * pageSize + 1 : 0, last: Math.min(page * pageSize, total) };
}
