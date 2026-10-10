import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const A11Y_PAGES = ["/", "/shop", "/contact", "/about"];

test.describe("WCAG 2.2 AA Accessibility Audits (Axe Smoke)", () => {
  for (const pagePath of A11Y_PAGES) {
    test(`has zero serious or critical accessibility violations on ${pagePath}`, async ({ page }) => {
      await page.goto(pagePath);
      await page.waitForLoadState("domcontentloaded");

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
        .analyze();

      const seriousOrCritical = accessibilityScanResults.violations.filter(
        (v) => v.impact === "serious" || v.impact === "critical"
      );

      if (seriousOrCritical.length > 0) {
        console.error(`Accessibility Violations on ${pagePath}:`, JSON.stringify(seriousOrCritical, null, 2));
      }

      expect(seriousOrCritical).toEqual([]);
    });
  }
});
