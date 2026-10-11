import { test, expect } from "@playwright/test";

test.describe("Checkout & Payment Flow (Phase 5 E2E)", () => {
  test("end-to-end checkout with address validation and simulated payment", async ({ page }) => {
    test.setTimeout(90000);
    // 1. Visit product page and wait for client hydration
    await page.goto("/shop/shell-jewellery/spiral-conch-pink-crackle-bracelet");
    await page.waitForLoadState("networkidle");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    const addToCartButton = page.getByRole("button", { name: /Add to Cart/i });
    await addToCartButton.click();

    // 2. Cart drawer opens automatically; click "Proceed to Checkout"
    const checkoutLink = page.getByRole("link", { name: /Proceed to Checkout/i });
    await expect(checkoutLink).toBeVisible();
    await checkoutLink.click();

    // 3. Verify on Checkout page
    await expect(page).toHaveURL(/\/checkout/, { timeout: 30000 });
    await expect(page.getByRole("heading", { name: /Complete Your Order/i })).toBeVisible();

    // 4. Fill in delivery details
    await page.getByLabel(/Full Name/i).fill("Priya Sharma");
    await page.getByLabel(/Mobile Phone/i).fill("9876543210");
    await page.getByLabel(/Email Address/i).fill("priya.sharma@example.com");
    await page.getByLabel(/Street Address/i).fill("Flat 101, Lotus Blossom Apartments, MG Road");
    await page.getByLabel(/City/i).fill("New Delhi");
    await page.getByLabel(/PIN Code/i).fill("110001");

    // 5. Submit order
    const proceedButton = page.getByRole("button", { name: /Proceed to Payment/i });
    await proceedButton.click();

    // 6. Should redirect to the simulator (allow time for Next.js on-demand page compilation)
    await expect(page).toHaveURL(/\/checkout\/simulator/, { timeout: 30000 });
    await page.waitForLoadState("networkidle");
    await expect(page.getByText(/Development Payment Simulator/i)).toBeVisible();

    // 7. Click simulate successful payment
    const simulateSuccess = page.getByRole("button", { name: /Simulate Successful Payment/i });
    await expect(simulateSuccess).toBeVisible();
    await simulateSuccess.click();

    // 8. Should redirect to order confirmation
    await expect(page).toHaveURL(/\/order\//, { timeout: 30000 });
    await expect(page.getByRole("heading", { name: /Thank You! Order Confirmed/i })).toBeVisible();
    await expect(page.getByText(/Order Reference:/i)).toBeVisible();
  });
});
