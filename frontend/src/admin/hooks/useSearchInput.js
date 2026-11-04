import { useEffect, useRef, useState } from 'react';

/**
 * A search box whose text is local while typing and is saved (committed) after a pause.
 *
 *   const [text, setText] = useSearchInput(query.search, (value) => setQuery({ search: value }, { replace: true }));
 *
 * - `value` is the committed value (usually from the URL). If it changes from outside (Back button,
 *   "Clear filters"), the box text follows it. Echoes of our own commit never touch the box, so
 *   typing during the round trip is not overwritten.
 * - `onCommit(trimmedText)` runs `delay` ms after the last keystroke, and only when it differs from `value`.
 */
export function useSearchInput(value, onCommit, delay = 250) {
  const [text, setText] = useState(value);
  const [seen, setSeen] = useState(value);
  const [committed, setCommitted] = useState(value);
  if (value !== seen) {
    setSeen(value);
    if (value !== committed) {
      setText(value);
      setCommitted(value);
    }
  }

  const commit = useRef(onCommit);
  useEffect(() => { commit.current = onCommit; });

  useEffect(() => {
    const next = text.trim();
    if (next === value) return undefined;
    const timer = setTimeout(() => {
      setCommitted(next);
      commit.current(next);
    }, delay);
    return () => clearTimeout(timer);
  }, [text, value, delay]);

  return [text, setText];
}
