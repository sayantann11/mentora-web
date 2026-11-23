/** Allowed screenshot types, detected from magic bytes — never from the extension or the browser's MIME claim. */
export type ImageKind = { mime: "image/jpeg" | "image/png" | "image/webp"; ext: "jpg" | "png" | "webp" };

export const MAX_SCREENSHOT_BYTES = 3 * 1024 * 1024;

export function detectImage(bytes: Uint8Array): ImageKind | null {
  if (bytes.length < 12) return null;
  // JPEG: FF D8 FF
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return { mime: "image/jpeg", ext: "jpg" };
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  const png = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  if (png.every((b, i) => bytes[i] === b)) return { mime: "image/png", ext: "png" };
  // WebP: "RIFF" .... "WEBP"
  if (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 && bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50)
    return { mime: "image/webp", ext: "webp" };
  return null;
}

export type ScreenshotCheck = { ok: true; kind: ImageKind } | { ok: false; error: string };

export function validateScreenshot(bytes: Uint8Array): ScreenshotCheck {
  if (bytes.length === 0) return { ok: false, error: "The file is empty." };
  if (bytes.length > MAX_SCREENSHOT_BYTES) return { ok: false, error: "The screenshot must be 3 MB or smaller." };
  const kind = detectImage(bytes);
  if (!kind) return { ok: false, error: "Please upload a JPG, PNG or WebP image." };
  return { ok: true, kind };
}
