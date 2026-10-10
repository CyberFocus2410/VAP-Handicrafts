import { describe, it, expect } from "vitest";
import { sniffImageMagicBytes } from "@/server/uploads/validator";

describe("Phase 4 Secure Uploads & Magic Byte Verification", () => {
  it("identifies authentic JPEG images from binary magic header", () => {
    // JPEG header: FF D8 FF E0 ...
    const jpegBuffer = new Uint8Array([
      0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01,
    ]);

    const result = sniffImageMagicBytes(jpegBuffer);
    expect(result.isValid).toBe(true);
    expect(result.detectedMime).toBe("image/jpeg");
    expect(result.extension).toBe("jpg");
  });

  it("identifies authentic PNG images from binary magic header", () => {
    // PNG header: 89 50 4E 47 0D 0A 1A 0A
    const pngBuffer = new Uint8Array([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
    ]);

    const result = sniffImageMagicBytes(pngBuffer);
    expect(result.isValid).toBe(true);
    expect(result.detectedMime).toBe("image/png");
    expect(result.extension).toBe("png");
  });

  it("identifies authentic WebP images from RIFF...WEBP header", () => {
    // RIFF (offset 0..3), length (4..7), WEBP (8..11)
    const webpBuffer = new Uint8Array([
      0x52, 0x49, 0x46, 0x46, // R I F F
      0x24, 0x00, 0x00, 0x00, // length
      0x57, 0x45, 0x42, 0x50, // W E B P
      0x56, 0x50, 0x38, 0x20,
    ]);

    const result = sniffImageMagicBytes(webpBuffer);
    expect(result.isValid).toBe(true);
    expect(result.detectedMime).toBe("image/webp");
    expect(result.extension).toBe("webp");
  });

  it("strictly rejects executable binaries disguised as images (e.g. evil.exe renamed to evil.jpg)", () => {
    // Windows PE executable header: 4D 5A ('MZ')
    const exeBuffer = new Uint8Array([
      0x4d, 0x5a, 0x90, 0x00, 0x03, 0x00, 0x00, 0x00, 0x04, 0x00, 0x00, 0x00,
    ]);

    const result = sniffImageMagicBytes(exeBuffer);
    expect(result.isValid).toBe(false);
    expect(result.detectedMime).toBe("application/x-dosexec");
    expect(result.error).toContain("Executable binaries are strictly prohibited");
  });

  it("strictly rejects plain text, HTML, or SVG files", () => {
    // Text: "Hello World"
    const textBuffer = new TextEncoder().encode("<html><body><script>alert(1)</script></body></html>");
    const result = sniffImageMagicBytes(textBuffer);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain("Unsupported file type");
  });

  it("rejects truncated buffers smaller than 12 bytes", () => {
    const tinyBuffer = new Uint8Array([0xff, 0xd8]);
    const result = sniffImageMagicBytes(tinyBuffer);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain("truncated");
  });
});
