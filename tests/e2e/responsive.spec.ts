import { test, expect } from "@playwright/test";

const VIEWPORTS = [
  { width: 360, height: 740, name: "360px (Small Mobile)" },
  { width: 390, height: 844, name: "390px (Standard Mobile)" },
  { width: 768, height: 1024, name: "768px (Tablet)" },
  { width: 1024, height: 768, name: "1024px (Laptop)" },
  { width: 1440, height: 900, name: "1440px (Wide Desktop)" },
];

const PAGES_TO_TEST = ["/", "/shop", "/contact", "/about", "/cart"];

test.describe("Responsive No-Horizontal-Overflow Tests", () => {
  for (const vp of VIEWPORTS) {
    for (const pagePath of PAGES_TO_TEST) {
      test(`verifies zero horizontal overflow at ${vp.name} on ${pagePath}`, async ({ page }) => {
        await page.setViewportSize({ width: vp.width, height: vp.height });
        await page.goto(pagePath);
        await page.waitForLoadState("domcontentloaded");

        // Measure document scrollWidth vs clientWidth
        const overflow = await page.evaluate(() => {
          const docElem = document.documentElement;
          const body = document.body;
          const scrollWidth = Math.max(docElem.scrollWidth, body.scrollWidth);
          const clientWidth = docElem.clientWidth;
          return {
            hasOverflow: scrollWidth > clientWidth,
            scrollWidth,
            clientWidth,
            delta: scrollWidth - clientWidth,
          };
        });

        expect(
          overflow.hasOverflow,
          `Horizontal scroll detected on ${pagePath} at ${vp.width}px: scrollWidth (${overflow.scrollWidth}px) > clientWidth (${overflow.clientWidth}px) by ${overflow.delta}px`
        ).toBe(false);
      });
    }
  }
});
