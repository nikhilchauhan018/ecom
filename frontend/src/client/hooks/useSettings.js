import { useEffect, useState } from 'react';
import { getSettings } from '../services/settings';
import { deriveBrandTokens } from '../utils/color';
import { mockSettings } from '../data/settings.mock';

/**
 * Accesses store settings and synchronizes dynamic brand tokens into CSS variables.
 * @returns {import('../types/settings').Settings}
 */
export function useSettings() {
  const [settings, setSettings] = useState(mockSettings);

  useEffect(() => {
    let mounted = true;
    getSettings().then((data) => {
      if (mounted && data) {
        setSettings(data);
        const tokens = deriveBrandTokens(data.brandColor);
        const root = document.documentElement;
        root.style.setProperty('--brand', tokens.brand);
        root.style.setProperty('--brand-contrast', tokens.brandContrast);
        root.style.setProperty('--brand-tint', tokens.brandTint);
        root.style.setProperty('--brand-hover', tokens.brandHover);
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  return settings;
}

export default useSettings;
