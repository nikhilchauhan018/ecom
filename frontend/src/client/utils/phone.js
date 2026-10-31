import {
  DEFAULT_PHONE_COUNTRY,
  PHONE_COUNTRIES,
  TIMEZONE_COUNTRY,
  getPhoneCountry,
} from '../config/dialCodes.js';

/**
 * Picks the country whose dial code should be pre-selected in the phone field.
 * Priority: the user's own earlier choice > server IP hint > time zone > browser language region > fallback.
 * Time zone ranks above language because many browsers default to "en-US" regardless of where the user is.
 * All of this is a heuristic for convenience, never for security or access control.
 *
 * @param {{ saved?: string|null, serverHint?: string|null, timeZone?: string|null, languages?: readonly string[], fallback?: string }} input
 * @returns {{ code: string, source: 'saved'|'server'|'timezone'|'language'|'fallback' }}
 */
export function detectCountry({ saved, serverHint, timeZone, languages = [], fallback = DEFAULT_PHONE_COUNTRY } = {}) {
  if (saved && getPhoneCountry(saved)) return { code: saved, source: 'saved' };
  if (serverHint && getPhoneCountry(serverHint)) return { code: serverHint, source: 'server' };

  const fromZone = timeZone ? TIMEZONE_COUNTRY[timeZone] : null;
  if (fromZone && getPhoneCountry(fromZone)) return { code: fromZone, source: 'timezone' };

  for (const language of languages) {
    const region = String(language).split('-')[1]?.toUpperCase();
    if (region && getPhoneCountry(region)) return { code: region, source: 'language' };
  }

  return { code: getPhoneCountry(fallback) ? fallback : DEFAULT_PHONE_COUNTRY, source: 'fallback' };
}

/**
 * Finds the country whose dial code is the longest prefix of `digits` (digits only, no "+").
 * When several countries share that dial code, `preferredCode` wins if it is one of them,
 * otherwise the default country (so a bare "+1" resolves to US, not CA).
 * @returns {{ code: string, name: string, dial: string } | null}
 */
export function matchDialCode(digits, preferredCode) {
  const input = String(digits ?? '').replace(/\D/g, '');
  let best = [];
  let bestLength = 0;

  for (const country of PHONE_COUNTRIES) {
    if (input.startsWith(country.dial)) {
      if (country.dial.length > bestLength) {
        best = [country];
        bestLength = country.dial.length;
      } else if (country.dial.length === bestLength) {
        best.push(country);
      }
    }
  }

  if (best.length === 0) return null;
  return (
    best.find((country) => country.code === preferredCode) ||
    best.find((country) => country.code === DEFAULT_PHONE_COUNTRY) ||
    best[0]
  );
}

/**
 * Turns what the user typed plus the selected country into an E.164 number.
 *  - "+44 7700 900123" or "0044 7700…": the number carries its own country code, which wins
 *  - "98765 43210" with IN selected: "+919876543210"
 *  - leading zeros (trunk prefix) are dropped from national numbers
 *
 * @param {string} rawInput
 * @param {string} selectedCode ISO country currently selected
 * @returns {{ e164: string, country: string, national: string, international: boolean }}
 */
export function resolvePhone(rawInput, selectedCode) {
  let raw = String(rawInput ?? '').trim();
  if (/^00\d/.test(raw.replace(/[\s().-]/g, ''))) raw = `+${raw.replace(/\D/g, '').slice(2)}`;

  if (raw.startsWith('+')) {
    const digits = raw.replace(/\D/g, '');
    const match = matchDialCode(digits, selectedCode);
    return {
      e164: digits ? `+${digits}` : '',
      country: match ? match.code : selectedCode,
      national: match ? digits.slice(match.dial.length) : digits,
      international: true,
    };
  }

  const country = getPhoneCountry(selectedCode) || getPhoneCountry(DEFAULT_PHONE_COUNTRY);
  const national = raw.replace(/\D/g, '').replace(/^0+/, '');
  return {
    e164: national ? `+${country.dial}${national}` : '',
    country: country.code,
    national,
    international: false,
  };
}
