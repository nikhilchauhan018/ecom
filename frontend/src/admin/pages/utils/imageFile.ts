export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
export const IMAGE_ACCEPT = ALLOWED_IMAGE_TYPES.join(',');

export type ImageCheck = { ok: true } | { ok: false; error: string };

const startsWith = (bytes: Uint8Array, signature: readonly number[], offset = 0) =>
  signature.every((value, i) => bytes[offset + i] === value);

/**
 * Checks size, declared type AND the real file signature (magic bytes), so a
 * renamed file or a fake content-type is rejected. SVG is rejected on purpose
 * because it can carry scripts.
 *
 * SERVER: repeat these checks, then re-encode the image before storing it.
 */
export async function validateImageFile(file: File): Promise<ImageCheck> {
  const name = file.name.slice(0, 60);
  if (file.size === 0) return { ok: false, error: `${name} is empty.` };
  if (file.size > MAX_IMAGE_BYTES) return { ok: false, error: `${name} is larger than 5 MB.` };
  if (!(ALLOWED_IMAGE_TYPES as readonly string[]).includes(file.type)) {
    return { ok: false, error: 'Use a JPG, PNG or WebP image.' };
  }

  let bytes: Uint8Array;
  try {
    bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  } catch {
    return { ok: false, error: 'Could not read this file. Try another one.' };
  }

  const isJpeg = startsWith(bytes, [0xff, 0xd8, 0xff]);
  const isPng = startsWith(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const isWebp = startsWith(bytes, [0x52, 0x49, 0x46, 0x46]) && startsWith(bytes, [0x57, 0x45, 0x42, 0x50], 8);
  const matches =
    (file.type === 'image/jpeg' && isJpeg) || (file.type === 'image/png' && isPng) || (file.type === 'image/webp' && isWebp);

  return matches ? { ok: true } : { ok: false, error: `${name} is not a real JPG, PNG or WebP image.` };
}