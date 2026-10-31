import { useEffect } from 'react';

/** Asks the browser to confirm before the tab closes/reloads while `dirty` is true. */
export function useUnsavedChangesWarning(dirty) {
  useEffect(() => {
    if (!dirty) return undefined;
    const handler = (event) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [dirty]);
}

export default useUnsavedChangesWarning;
