/**
 * Stale-response guard. Only the most recently started request may write its result.
 *
 *   const guard = createLatestOnly();
 *   const request = guard.start();
 *   const data = await fetchSomething();
 *   if (request.isCurrent()) save(data);   // an older, slower response is ignored
 *
 * `cancel()` invalidates the request in flight (use it on unmount or when the inputs change).
 */
export function createLatestOnly() {
  let latest = 0;
  return {
    start() {
      latest += 1;
      const id = latest;
      return { isCurrent: () => id === latest };
    },
    cancel() {
      latest += 1;
    },
  };
}
