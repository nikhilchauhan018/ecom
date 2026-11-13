import { useCallback, useEffect, useState } from 'react';
import { listPosts } from './services/blogService';
import type { PostsList, PostsQuery } from './types';

export function useDebounced<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);
  return debounced;
}

interface State {
  loading: boolean;
  error: string | null;
  data: PostsList | null;
}

export function usePostsList(query: PostsQuery) {
  const [state, setState] = useState<State>({ loading: true, error: null, data: null });
  const [tick, setTick] = useState(0);
  const { search, status, categoryId, page, pageSize } = query;

  useEffect(() => {
    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: null }));
    listPosts({ search, status, categoryId, page, pageSize })
      .then((res) => {
        if (cancelled) return;
        setState(res.ok ? { loading: false, error: null, data: res.data } : { loading: false, error: res.error.message, data: null });
      })
      .catch(() => {
        if (!cancelled) setState({ loading: false, error: 'Could not load posts. Check your connection and try again.', data: null });
      });
    return () => {
      cancelled = true;
    };
  }, [search, status, categoryId, page, pageSize, tick]);

  const reload = useCallback(() => setTick((t) => t + 1), []);
  return { ...state, reload };
}
