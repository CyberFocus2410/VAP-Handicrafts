import { describe, it, expect } from "vitest";
import {
  CheckoutAddressSchema,
  INDIAN_PHONE_REGEX,
  INDIAN_PINCODE_REGEX,
  normalizeIndianPhone,
} from "@/lib/checkout/validation";

describe("Indian Checkout Validation (PRD §11)", () => {
  describe("Phone number regex", () => {
    it("accepts valid 10-digit Indian phone numbers", () => {
      expect(INDIAN_PHONE_REGEX.test("9876543210")).toBe(true);
      expect(INDIAN_PHONE_REGEX.test("8765432109")).toBe(true);
      expect(INDIAN_PHONE_REGEX.test("7654321098")).toBe(true);
      expect(INDIAN_PHONE_REGEX.test("6543210987")).toBe(true);
      expect(INDIAN_PHONE_REGEX.test("+91 9876543210")).toBe(true);
      expect(INDIAN_PHONE_REGEX.test("09876543210")).toBe(true);
    });

    it("rejects invalid phone numbers", () => {
      expect(INDIAN_PHONE_REGEX.test("1234567890")).toBe(false); // does not start with 6-9
      expect(INDIAN_PHONE_REGEX.test("98765")).toBe(false); // too short
      expect(INDIAN_PHONE_REGEX.test("9876543210123")).toBe(false); // too long
      expect(INDIAN_PHONE_REGEX.test("abcdefghij")).toBe(false);
    });

    it("normalizes phone numbers to 10 digits", () => {
      expect(normalizeIndianPhone("+91 9876543210")).toBe("9876543210");
      expect(normalizeIndianPhone("09876543210")).toBe("9876543210");
      expect(normalizeIndianPhone("9876543210")).toBe("9876543210");
    });
  });

  describe("PIN code regex", () => {
    it("accepts valid 6-digit postal PIN codes", () => {
      expect(INDIAN_PINCODE_REGEX.test("110001")).toBe(true); // New Delhi
      expect(INDIAN_PINCODE_REGEX.test("400001")).toBe(true); // Mumbai
      expect(INDIAN_PINCODE_REGEX.test("560001")).toBe(true); // Bengaluru
      expect(INDIAN_PINCODE_REGEX.test("700001")).toBe(true); // Kolkata
    });

    it("rejects invalid PIN codes", () => {
      expect(INDIAN_PINCODE_REGEX.test("012345")).toBe(false); // cannot start with 0
      expect(INDIAN_PINCODE_REGEX.test("11000")).toBe(false); // only 5 digits
      expect(INDIAN_PINCODE_REGEX.test("1100012")).toBe(false); // 7 digits
      expect(INDIAN_PINCODE_REGEX.test("11000A")).toBe(false); // letters
    });
  });

  describe("CheckoutAddressSchema", () => {
    it("validates a complete, valid Indian shipping address", () => {
      const valid = {
        fullName: "Priya Sharma",
        email: "priya@example.com",
        phone: "9876543210",
        streetAddress: "Flat 402, Lotus Court, MG Road",
        city: "New Delhi",
        state: "Delhi",
        pincode: "110001",
        country: "India",
      };

      const result = CheckoutAddressSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("rejects address with invalid email or short street address", () => {
      const invalid = {
        fullName: "P", // too short
        email: "not-an-email",
        phone: "12345",
        streetAddress: "Hi", // too short
        city: "D",
        state: "Delhi",
        pincode: "000000",
      };

      const result = CheckoutAddressSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });
});
