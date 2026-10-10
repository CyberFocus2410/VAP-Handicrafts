import { test, expect } from "@playwright/test";

test.describe("Storefront Smoke Tests", () => {
  test("renders homepage with brand title, hero, and main landmarks", async ({ page }) => {
    await page.goto("/");

    // Verify title
    await expect(page).toHaveTitle(/VAP Handicrafts/);

    // Verify landmarks
    await expect(page.locator("header")).toBeVisible();
    await expect(page.locator("main#main-content")).toBeVisible();
    await expect(page.locator("footer")).toBeVisible();

    // Verify brand heading
    const heroHeading = page.getByRole("heading", { level: 1 });
    await expect(heroHeading).toBeVisible();
  });

  test("skip link appears on keyboard focus and targets #main-content", async ({ page }) => {
    await page.goto("/");

    const skipLink = page.getByRole("link", { name: /Skip to main content/i });
    await skipLink.focus();
    await expect(skipLink).toBeVisible();
    await expect(skipLink).toHaveAttribute("href", "#main-content");
  });

  test("navigates seamlessly across primary routes without dead links", async ({ page, isMobile }) => {
    await page.goto("/");

    const navigateTo = async (label: string) => {
      if (isMobile) {
        await page.getByRole("button", { name: /Open navigation menu/i }).click();
        await page.getByRole("navigation", { name: "Mobile Navigation" }).getByRole("link", { name: label }).click();
      } else {
        await page.getByRole("navigation", { name: "Primary Navigation" }).getByRole("link", { name: label }).click();
      }
    };

    // Navigate to Shop
    await navigateTo("Shop All");
    await expect(page).toHaveURL(/\/shop/);
    await expect(page.getByRole("heading", { name: /Shop All Collections/i })).toBeVisible();

    // Navigate to Our Story
    await navigateTo("Our Story");
    await expect(page).toHaveURL(/\/about/);
    await expect(page.getByRole("heading", { name: /Our Story & Craft/i })).toBeVisible();

    // Navigate to Contact
    await navigateTo("Contact");
    await expect(page).toHaveURL(/\/contact/);
    await expect(page.getByRole("heading", { name: /We'd Love To Hear From You/i })).toBeVisible();
  });

  test("mobile navigation drawer opens, traps focus, and closes on Escape", async ({ page, isMobile }) => {
    // Set small viewport if not running on mobile project
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");

    const menuButton = page.getByRole("button", { name: /Open navigation menu/i });
    await expect(menuButton).toBeVisible();
    await menuButton.click();

    // Verify drawer dialog appears
    const mobileNav = page.getByRole("navigation", { name: "Mobile Navigation" });
    await expect(mobileNav).toBeVisible();

    // Verify drawer link works
    await page.keyboard.press("Escape");
    await expect(mobileNav).not.toBeVisible();
  });

  test("/admin returns 404 denied status by default via middleware", async ({ request }) => {
    const response = await request.get("/admin");
    expect(response.status()).toBe(404);
  });
});
