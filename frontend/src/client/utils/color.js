/**
 * Parses a hex color string (#rgb, #rrggbb) into { r, g, b }.
 * @param {string} hex
 * @returns {{ r: number, g: number, b: number }}
 */
export function hexToRgb(hex) {
  if (!hex || typeof hex !== 'string') {
    return { r: 23, g: 51, b: 44 }; // fallback #17332c
  }
  let clean = hex.replace('#', '').trim();
  if (clean.length === 3) {
    clean = clean.split('').map((char) => char + char).join('');
  }
  const intVal = parseInt(clean, 16);
  if (Number.isNaN(intVal) || clean.length !== 6) {
    return { r: 23, g: 51, b: 44 };
  }
  return {
    r: (intVal >> 16) & 255,
    g: (intVal >> 8) & 255,
    b: intVal & 255,
  };
}

/**
 * Calculates relative luminance according to WCAG 2.1 specs.
 * @param {number} r
 * @param {number} g
 * @param {number} b
 * @returns {number}
 */
export function getRelativeLuminance(r, g, b) {
  const [sR, sG, sB] = [r, g, b].map((val) => {
    const s = val / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * sR + 0.7152 * sG + 0.0722 * sB;
}

/**
 * Returns readable text color (#ffffff or #17181a) on a given background color to satisfy WCAG 4.5:1.
 * @param {string} hexColor
 * @returns {string}
 */
export function getReadableTextColor(hexColor) {
  const { r, g, b } = hexToRgb(hexColor);
  const bgLuminance = getRelativeLuminance(r, g, b);
  // White luminance is 1.0, dark luminance is ~0.015
  const contrastWithWhite = (1.0 + 0.05) / (bgLuminance + 0.05);
  const contrastWithDark = (bgLuminance + 0.05) / (0.015 + 0.05);

  return contrastWithWhite >= 4.5 || contrastWithWhite >= contrastWithDark
    ? '#ffffff'
    : '#17181a';
}

/**
 * Generates brand color variables based on settings.brandColor.
 * @param {string} brandColor
 * @returns {{ brand: string, brandContrast: string, brandTint: string, brandHover: string }}
 */
export function deriveBrandTokens(brandColor) {
  const hex = brandColor || '#17332c';
  const { r, g, b } = hexToRgb(hex);
  const contrast = getReadableTextColor(hex);
  return {
    brand: hex,
    brandContrast: contrast,
    brandTint: `rgba(${r}, ${g}, ${b}, 0.12)`,
    brandHover: `rgba(${r}, ${g}, ${b}, 0.88)`,
  };
}
