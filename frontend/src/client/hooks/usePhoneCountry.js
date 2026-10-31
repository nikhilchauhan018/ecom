import { useCallback, useEffect, useState } from 'react';
import { STORAGE_KEYS } from '../config/constants';
import { getPhoneCountry } from '../config/dialCodes';
import { getCountryHint } from '../services/geo';
import { detectCountry } from '../utils/phone';

function readSaved() {
  try {
    const value = window.localStorage.getItem(STORAGE_KEYS.PHONE_COUNTRY);
    return value && getPhoneCountry(value) ? value : null;
  } catch {
    return null;
  }
}

function detectInitial() {
  let timeZone = null;
  try {
    timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    // Intl unavailable: fall through to language / fallback
  }
  return detectCountry({
    saved: readSaved(),
    timeZone,
    languages: typeof navigator !== 'undefined' ? navigator.languages || [navigator.language] : [],
  });
}

/**
 * Selected phone country. Starts from the best local guess (saved choice, time zone, language),
 * is upgraded by the server's IP hint when one exists, and remembers the user's explicit choice.
 * Only the ISO country code is stored: never the phone number.
 * @returns {{ country: string, source: 'saved'|'server'|'timezone'|'language'|'fallback'|'user', autoDetected: boolean, setCountry: (code: string) => void }}
 */
export function usePhoneCountry() {
  const [state, setState] = useState(detectInitial);

  useEffect(() => {
    if (state.source === 'saved') return undefined;
    let active = true;

    getCountryHint()
      .then((hint) => {
        if (!active || !hint || !getPhoneCountry(hint)) return;
        setState((prev) => (prev.source === 'saved' || prev.source === 'user' ? prev : { code: hint, source: 'server' }));
      })
      .catch(() => {
        // hint is optional: keep the local guess
      });

    return () => {
      active = false;
    };
    // run once: the hint is a one-off upgrade of the initial guess
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setCountry = useCallback((code) => {
    if (!getPhoneCountry(code)) return;
    setState({ code, source: 'user' });
    try {
      window.localStorage.setItem(STORAGE_KEYS.PHONE_COUNTRY, code);
    } catch {
      // storage blocked: the choice still applies for this visit
    }
  }, []);

  return {
    country: state.code,
    source: state.source,
    autoDetected: ['server', 'timezone', 'language'].includes(state.source),
    setCountry,
  };
}

export default usePhoneCountry;
