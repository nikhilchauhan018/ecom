import { useCallback } from 'react';
import en from '../locales/en';

/**
 * Accesses locale translations with parameter interpolation.
 * @returns {{ t: (path: string, params?: Record<string, any>) => string }}
 */
export function useT() {
  const t = useCallback((path, params = {}) => {
    if (!path) return '';
    const keys = path.split('.');
    let value = en;
    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        return path;
      }
    }

    if (typeof value === 'string' && params) {
      return Object.entries(params).reduce((acc, [k, v]) => {
        return acc.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
      }, value);
    }

    return typeof value === 'string' ? value : path;
  }, []);

  return { t };
}

export default useT;
