import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Loads async data with loading / error state, reload and local updates.
 * Stale responses (after unmount or a newer request) are ignored.
 * @template T
 * @param {() => Promise<T>} fetcher
 * @param {any[]} [deps] re-fetch when these change
 * @returns {{ data: T|null, error: any, loading: boolean, reload: () => void, setData: (next: T | ((prev: T|null) => T)) => void }}
 */
export function useResource(fetcher, deps = []) {
  const [state, setState] = useState({ data: null, error: null, loading: true });
  const [tick, setTick] = useState(0);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  useEffect(() => {
    let active = true;
    setState((prev) => ({ ...prev, loading: true, error: null }));

    fetcherRef
      .current()
      .then((data) => {
        if (active) setState({ data, error: null, loading: false });
      })
      .catch((error) => {
        if (active) setState({ data: null, error, loading: false });
      });

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick]);

  const reload = useCallback(() => setTick((value) => value + 1), []);
  const setData = useCallback(
    (next) => setState((prev) => ({ ...prev, data: typeof next === 'function' ? next(prev.data) : next })),
    []
  );

  return { ...state, reload, setData };
}

export default useResource;
