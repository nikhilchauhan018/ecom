import { useEffect } from 'react';

/** useHotkey('k', handler) → fires on Ctrl/Cmd + K */
export function useHotkey(key, handler) {
  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === key) { e.preventDefault(); handler(e); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [key, handler]);
}
