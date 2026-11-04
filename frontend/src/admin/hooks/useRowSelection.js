import { useCallback, useState } from 'react';

const NONE = [];

/**
 * Selected row ids that belong to one loaded result. When `source` (the loaded result) changes - reload, new page,
 * new filter - the selection is empty again, so a bulk action can never hit rows the user can no longer see.
 *
 *   const [selected, setSelected] = useRowSelection(result);
 *   setSelected((current) => [...current, id]);   // or setSelected([...ids])
 */
export function useRowSelection(source) {
  const [selection, setSelection] = useState({ source: null, ids: NONE });
  const ids = selection.source === source ? selection.ids : NONE;
  const setIds = useCallback((next) => setSelection((current) => {
    const base = current.source === source ? current.ids : NONE;
    return { source, ids: typeof next === 'function' ? next(base) : next };
  }), [source]);
  return [ids, setIds];
}
