import { describe, it, expect } from "vitest";
import {
  getShippingConfig,
  updateShippingConfig,
  listDiscountCoupons,
  createDiscountCoupon,
  validateCoupon,
  incrementCouponUsage,
  listPublicStorefrontCoupons,
  updateDiscountCoupon,
  deleteDiscountCoupon,
} from "@/server/admin/promotions-service";

describe("Promotions & Coupon Service", () => {
  it("manages dynamic shipping configuration schemes", async () => {
    const updated = await updateShippingConfig({
      standardShippingPaise: 7900, // ₹79
      freeShippingThresholdPaise: 79900, // ₹799
      freeShippingEnabled: true,
    });

    expect(updated.standardShippingPaise).toBe(7900);
    expect(updated.freeShippingThresholdPaise).toBe(79900);

    const fetched = await getShippingConfig();
    expect(fetched.standardShippingPaise).toBe(7900);
    expect(fetched.freeShippingThresholdPaise).toBe(79900);
  });

  it("creates and validates percentage-based coupons with minimum order checks", async () => {
    const coupon = await createDiscountCoupon({
      code: "FESTIVE10",
      type: "percentage",
      value: 10, // 10%
      minOrderMinor: 50000, // ₹500 min order
      isActive: true,
      isVisibleOnStorefront: true,
    });

    expect(coupon.code).toBe("FESTIVE10");
    expect(coupon.type).toBe("percentage");
    expect(coupon.isVisibleOnStorefront).toBe(true);

    // Case 1: Subtotal below minimum order
    const belowMin = await validateCoupon("FESTIVE10", 40000); // ₹400
    expect(belowMin.valid).toBe(false);
    expect(belowMin.error?.toLowerCase()).toContain("minimum order");

    // Case 2: Subtotal eligible
    const validResult = await validateCoupon("FESTIVE10", 100000); // ₹1000
    expect(validResult.valid).toBe(true);
    expect(validResult.discountMinor).toBe(10000); // 10% of 1000 = ₹100

    // Case 3: Case insensitivity
    const caseResult = await validateCoupon("festive10", 100000);
    expect(caseResult.valid).toBe(true);
  });

  it("creates and validates flat rupee discount coupons and increments usage", async () => {
    const coupon = await createDiscountCoupon({
      code: "FLAT50",
      type: "flat",
      value: 50, // ₹50 off
      minOrderMinor: 20000, // ₹200
      isActive: true,
      isVisibleOnStorefront: true,
    });

    expect(coupon.code).toBe("FLAT50");

    const validResult = await validateCoupon("FLAT50", 30000); // ₹300
    expect(validResult.valid).toBe(true);
    expect(validResult.discountMinor).toBe(5000); // ₹50 in paise

    // Increment usage
    await incrementCouponUsage("FLAT50");
    const coupons = await listDiscountCoupons();
    const found = coupons.find((c) => c.code === "FLAT50");
    expect(found?.usageCount).toBeGreaterThanOrEqual(1);
  });

  it("rejects inactive or nonexistent coupon codes", async () => {
    await createDiscountCoupon({
      code: "EXPIRED20",
      type: "percentage",
      value: 20,
      isActive: false,
    });

    const result = await validateCoupon("EXPIRED20", 100000);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("inactive");

    const nonexistent = await validateCoupon("DOESNOTEXIST", 100000);
    expect(nonexistent.valid).toBe(false);
    expect(nonexistent.error).toContain("Invalid coupon code");
  });

  it("supports secret VIP codes: hidden from public storefront listings but valid when entered", async () => {
    // 1. Create a secret VIP coupon (isVisibleOnStorefront: false)
    const secretCoupon = await createDiscountCoupon({
      code: "SECRET50VIP",
      type: "flat",
      value: 150, // Flat ₹150 off
      minOrderMinor: 50000, // Min ₹500
      isActive: true,
      isVisibleOnStorefront: false, // Secret code!
      description: "Exclusive secret VIP discount for selected customer",
    });

    expect(secretCoupon.code).toBe("SECRET50VIP");
    expect(secretCoupon.isVisibleOnStorefront).toBe(false);

    // 2. Verify it is NEVER included in public storefront listings
    const publicCoupons = await listPublicStorefrontCoupons();
    const isExposed = publicCoupons.some((c) => c.code === "SECRET50VIP");
    expect(isExposed).toBe(false);

    // 3. But when the customer enters this secret code, it validates successfully!
    const validated = await validateCoupon("SECRET50VIP", 80000); // ₹800 subtotal
    expect(validated.valid).toBe(true);
    expect(validated.discountMinor).toBe(15000); // Flat ₹150 in paise
    expect(validated.message).toContain("Saved ₹150");

    // 4. Case-insensitivity for secret code entry
    const lowercaseEntry = await validateCoupon("secret50vip", 80000);
    expect(lowercaseEntry.valid).toBe(true);
    expect(lowercaseEntry.discountMinor).toBe(15000);

    // 5. Toggling visibility: merchant makes it public later
    const updated = await updateDiscountCoupon(secretCoupon.id, { isVisibleOnStorefront: true });
    expect(updated.isVisibleOnStorefront).toBe(true);

    const publicAfterUpdate = await listPublicStorefrontCoupons();
    expect(publicAfterUpdate.some((c) => c.code === "SECRET50VIP")).toBe(true);

    // Clean up
    await deleteDiscountCoupon(secretCoupon.id);
  });

  it("supports pausing (activating/deactivating) and permanently deleting coupons", async () => {
    // 1. Create active coupon
    const coupon = await createDiscountCoupon({
      code: "PAUSETEST25",
      type: "percentage",
      value: 25,
      isActive: true,
      isVisibleOnStorefront: true,
    });

    // Valid while active
    let check = await validateCoupon("PAUSETEST25", 100000);
    expect(check.valid).toBe(true);
    expect(check.discountMinor).toBe(25000); // 25% of 1000

    // 2. Pause coupon
    const paused = await updateDiscountCoupon(coupon.id, { isActive: false });
    expect(paused.isActive).toBe(false);

    // Validation must immediately reject paused coupon
    check = await validateCoupon("PAUSETEST25", 100000);
    expect(check.valid).toBe(false);
    expect(check.error).toContain("inactive");

    // Public list must not include paused coupons even if isVisibleOnStorefront was true
    const publicList = await listPublicStorefrontCoupons();
    expect(publicList.some((c) => c.code === "PAUSETEST25")).toBe(false);

    // 3. Reactivate coupon
    const reactivated = await updateDiscountCoupon(coupon.id, { isActive: true });
    expect(reactivated.isActive).toBe(true);

    check = await validateCoupon("PAUSETEST25", 100000);
    expect(check.valid).toBe(true);

    // 4. Delete coupon permanently
    const deleted = await deleteDiscountCoupon(coupon.id);
    expect(deleted).toBe(true);

    // Validating deleted coupon must fail with invalid coupon code
    const deletedCheck = await validateCoupon("PAUSETEST25", 100000);
    expect(deletedCheck.valid).toBe(false);
    expect(deletedCheck.error).toContain("Invalid coupon code");

    // Must be gone from list
    const all = await listDiscountCoupons();
    expect(all.some((c) => c.id === coupon.id)).toBe(false);
  });
});
