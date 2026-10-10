import "server-only";

export interface MagicByteValidationResult {
  isValid: boolean;
  detectedMime: string | null;
  extension: string | null;
  error?: string;
}

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10MB cap

/**
 * Sniffs the magic byte signature from the initial buffer bytes.
 * Strictly ignores user-provided filename extension or Content-Type headers.
 */
export function sniffImageMagicBytes(buffer: Uint8Array): MagicByteValidationResult {
  if (!buffer || buffer.length < 12) {
    return {
      isValid: false,
      detectedMime: null,
      extension: null,
      error: "File is too small or truncated to verify signature.",
    };
  }

  // 1. JPEG check: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return {
      isValid: true,
      detectedMime: "image/jpeg",
      extension: "jpg",
    };
  }

  // 2. PNG check: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return {
      isValid: true,
      detectedMime: "image/png",
      extension: "png",
    };
  }

  // 3. WebP check: RIFF at 0..3, WEBP at 8..11
  const isRiff =
    buffer[0] === 0x52 && // 'R'
    buffer[1] === 0x49 && // 'I'
    buffer[2] === 0x46 && // 'F'
    buffer[3] === 0x46; // 'F'

  const isWebp =
    buffer[8] === 0x57 && // 'W'
    buffer[9] === 0x45 && // 'E'
    buffer[10] === 0x42 && // 'B'
    buffer[11] === 0x50; // 'P'

  if (isRiff && isWebp) {
    return {
      isValid: true,
      detectedMime: "image/webp",
      extension: "webp",
    };
  }

  // Check for dangerous types (executable MZ header, script headers, etc.)
  if (buffer[0] === 0x4d && buffer[1] === 0x5a) {
    return {
      isValid: false,
      detectedMime: "application/x-dosexec",
      extension: null,
      error: "Executable binaries are strictly prohibited.",
    };
  }

  return {
    isValid: false,
    detectedMime: null,
    extension: null,
    error: "Unsupported file type. Please upload a valid JPG, PNG, or WebP photograph.",
  };
}
