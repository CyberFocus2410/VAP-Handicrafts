import { describe, it, expect } from "vitest";
import {
  getShippingConfig,
  updateShippingConfig,
  listDiscountCoupons,
  createDiscountCoupon,
  validateCoupon,
  incrementCouponUsage,
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
    });

    expect(coupon.code).toBe("FESTIVE10");
    expect(coupon.type).toBe("percentage");

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
});
