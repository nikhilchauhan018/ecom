import { useCallback, useEffect, useState } from 'react';
import { listPages } from '../services/pagesService';
import type { ListResult, PagesQuery } from '../types';

interface State {
  loading: boolean;
  error: string | null;
  data: ListResult | null;
}

export function usePagesList(query: PagesQuery) {
  const [state, setState] = useState<State>({ loading: true, error: null, data: null });
  const [tick, setTick] = useState(0);
  const { search, status, template, page, pageSize } = query;

  useEffect(() => {
    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: null }));
    listPages({ search, status, template, page, pageSize })
      .then((res) => {
        if (cancelled) return;
        setState(res.ok ? { loading: false, error: null, data: res.data } : { loading: false, error: res.error.message, data: null });
      })
      .catch(() => {
        if (!cancelled) setState({ loading: false, error: 'Could not load pages. Check your connection and try again.', data: null });
      });
    return () => {
      cancelled = true;
    };
  }, [search, status, template, page, pageSize, tick]);

  const reload = useCallback(() => setTick((t) => t + 1), []);
  return { ...state, reload };
}
