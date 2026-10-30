/**
 * Builds an optimized image URL supporting optional CDN transforms.
 * @param {string|null|undefined} src
 * @param {{ width?: number, quality?: number, format?: string }} [options]
 * @returns {string|null}
 */
export function getImageUrl(src, options = {}) {
  if (!src) return null;
  const cdn = typeof process !== 'undefined' && process.env?.VITE_IMAGE_CDN
    ? process.env.VITE_IMAGE_CDN
    : typeof import.meta !== 'undefined' && import.meta.env?.VITE_IMAGE_CDN
      ? import.meta.env.VITE_IMAGE_CDN
      : '';

  if (!cdn) {
    return src;
  }

  const cleanCdn = cdn.replace(/\/$/, '');
  const cleanSrc = src.replace(/^\//, '');
  const params = [];
  if (options.width) params.push(`w-${options.width}`);
  if (options.quality) params.push(`q-${options.quality}`);
  if (options.format) params.push(`f-${options.format}`);

  const transform = params.length > 0 ? `tr:${params.join(',')}/` : '';
  return `${cleanCdn}/${transform}${cleanSrc}`;
}

/**
 * Generates responsive srcset string for multiple image widths.
 * @param {string|null|undefined} src
 * @param {number[]} [widths=[320, 480, 640, 768, 1024, 1280]]
 * @returns {string|null}
 */
export function buildSrcSet(src, widths = [320, 480, 640, 768, 1024, 1280]) {
  if (!src) return null;
  return widths
    .map((w) => `${getImageUrl(src, { width: w })} ${w}w`)
    .join(', ');
}
