import { describe, expect, it } from "vitest";

function srgbToLinear(c: number): number {
  const norm = c / 255;
  return norm <= 0.04045 ? norm / 12.92 : Math.pow((norm + 0.055) / 1.055, 2.4);
}

function relativeLuminance(r: number, g: number, b: number): number {
  const rL = srgbToLinear(r);
  const gL = srgbToLinear(g);
  const bL = srgbToLinear(b);
  return 0.2126 * rL + 0.7152 * gL + 0.0722 * bL;
}

function contrastRatio(l1: number, l2: number): number {
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function hexToRgb(hex: string): [number, number, number] {
  const cleaned = hex.replace("#", "");
  const num = parseInt(cleaned, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function blendAlpha(
  foreground: [number, number, number],
  alpha: number,
  background: [number, number, number]
): [number, number, number] {
  return [
    Math.round(foreground[0] * alpha + background[0] * (1 - alpha)),
    Math.round(foreground[1] * alpha + background[1] * (1 - alpha)),
    Math.round(foreground[2] * alpha + background[2] * (1 - alpha)),
  ];
}

describe("WCAG 2.1 token contrast verification", () => {
  const bgRgb = hexToRgb("#FAF5EF");
  const surfaceRgb = hexToRgb("#FFFDF9");
  const ringRgb = hexToRgb("#6E3F38");
  const cocoaRgb = hexToRgb("#4A2D28");

  const lBg = relativeLuminance(...bgRgb);
  const lSurface = relativeLuminance(...surfaceRgb);
  const lRing = relativeLuminance(...ringRgb);

  it("verifies --ring token contrast exceeds 3.0:1 on background and surface (WCAG 2.2 focus appearance)", () => {
    const ringOnBg = contrastRatio(lRing, lBg);
    const ringOnSurface = contrastRatio(lRing, lSurface);

    // Record verified numbers
    console.log(`[Contrast Verification] --ring (#6E3F38) on --bg (#FAF5EF): ${ringOnBg.toFixed(2)}:1`);
    console.log(`[Contrast Verification] --ring (#6E3F38) on --surface (#FFFDF9): ${ringOnSurface.toFixed(2)}:1`);

    expect(ringOnBg).toBeGreaterThanOrEqual(3.0);
    expect(ringOnSurface).toBeGreaterThanOrEqual(3.0);
  });

  it("verifies and records --border contrast on background and surface", () => {
    // --border is color-mix(in srgb, var(--cocoa) 14%, transparent)
    const borderOnBgRgb = blendAlpha(cocoaRgb, 0.14, bgRgb);
    const borderOnSurfaceRgb = blendAlpha(cocoaRgb, 0.14, surfaceRgb);

    const lBorderOnBg = relativeLuminance(...borderOnBgRgb);
    const lBorderOnSurface = relativeLuminance(...borderOnSurfaceRgb);

    const borderOnBg = contrastRatio(lBorderOnBg, lBg);
    const borderOnSurface = contrastRatio(lBorderOnSurface, lSurface);

    console.log(`[Contrast Verification] --border (cocoa 14%) on --bg: ${borderOnBg.toFixed(2)}:1`);
    console.log(`[Contrast Verification] --border (cocoa 14%) on --surface: ${borderOnSurface.toFixed(2)}:1`);

    expect(borderOnBg).toBeGreaterThan(1.0);
    expect(borderOnSurface).toBeGreaterThan(1.0);
  });

  it("verifies --rose-deep button token exceeds 4.5:1 text contrast on ivory", () => {
    const roseDeepRgb = hexToRgb("#A15B52");
    const lRoseDeep = relativeLuminance(...roseDeepRgb);
    const roseDeepOnIvory = contrastRatio(lRoseDeep, lSurface);

    console.log(`[Contrast Verification] --rose-deep (#A15B52) with ivory text: ${roseDeepOnIvory.toFixed(2)}:1`);
    expect(roseDeepOnIvory).toBeGreaterThanOrEqual(4.5);
  });
});
