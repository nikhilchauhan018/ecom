import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { readQuery, writeQuery } from '../utils/queryState';

/**
 * Screen state that lives in the URL (search, filters, page...), so refresh, Back and shared links all work.
 *
 *   const SCHEMA = { search: '', status: '', page: 1 };          // module level: it must be a stable reference
 *   const [query, setQuery] = useQueryState(SCHEMA);
 *   setQuery({ status: 'active' });                              // page returns to 1 on its own
 *   setQuery({ search: text }, { replace: true });               // replace: do not add a history entry
 *
 * `query` always has every key of the schema (defaults filled in). Pass it straight to `useResource`.
 */
export function useQueryState(schema) {
  const [params, setParams] = useSearchParams();
  const query = useMemo(() => readQuery(params, schema), [params, schema]);
  const setQuery = useCallback((changes, { replace = false } = {}) => {
    setParams((current) => writeQuery(current, changes, schema), { replace });
  }, [schema, setParams]);
  return [query, setQuery];
}
