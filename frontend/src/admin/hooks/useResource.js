import { useCallback, useEffect, useState } from 'react';
import { createLatestOnly } from '../utils/latestOnly';

const INITIAL = { key: null, reloads: -1, data: null, error: null };

/**
 * Loads data through a service function and keeps the screen consistent while inputs change quickly.
 *
 * - `fetcher(params)` must be a stable function (import it, do not create it inline).
 * - `params` is compared by value (JSON), so a new object with the same content does not refetch.
 * - Only the latest request may write its result: a slow old response never overwrites a newer one.
 * - `data` keeps the previous result while a new request is loading (`loading` is true meanwhile).
 *
 * Returns `{ data, error, loading, reload }`.
 */
export function useResource(fetcher, params) {
  const key = JSON.stringify(params);
  const [guard] = useState(createLatestOnly);
  const [reloads, setReloads] = useState(0);
  const [state, setState] = useState(INITIAL);

  useEffect(() => {
    const request = guard.start();
    fetcher(JSON.parse(key)).then(
      (data) => { if (request.isCurrent()) setState({ key, reloads, data, error: null }); },
      (error) => { if (request.isCurrent()) setState({ key, reloads, data: null, error }); },
    );
    return () => guard.cancel();
  }, [fetcher, guard, key, reloads]);

  const reload = useCallback(() => setReloads((count) => count + 1), []);
  const loading = state.key !== key || state.reloads !== reloads;
  return { data: state.data, error: state.error, loading, reload };
}
