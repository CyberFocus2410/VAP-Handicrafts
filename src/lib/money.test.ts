import { describe, expect, it } from "vitest";
import {
  MoneyError,
  addPaise,
  assertIntegerPaise,
  assertValidPaise,
  formatINR,
  multiplyPaise,
  subtractPaise,
  toPaise,
  toRupeesDecimal,
} from "./money";

describe("money utilities (paise arithmetic)", () => {
  describe("toPaise conversion", () => {
    it("converts whole rupee amounts accurately", () => {
      expect(toPaise(100)).toBe(10000);
      expect(toPaise("100")).toBe(10000);
      expect(toPaise("0")).toBe(0);
      expect(toPaise(0)).toBe(0);
    });

    it("converts decimal rupee strings without floating point drift", () => {
      expect(toPaise("12.99")).toBe(1299);
      expect(toPaise("1499.50")).toBe(149950);
      expect(toPaise("0.05")).toBe(5);
      expect(toPaise("0.5")).toBe(50);
      expect(toPaise(12.99)).toBe(1299);
      expect(toPaise(1499.5)).toBe(149950);
    });

    it("handles negative amounts correctly", () => {
      expect(toPaise("-50.25")).toBe(-5025);
    });

    it("rejects invalid inputs", () => {
      expect(() => toPaise("abc")).toThrow(MoneyError);
      expect(() => toPaise("12.999")).toThrow(MoneyError);
      expect(() => toPaise("")).toThrow(MoneyError);
      expect(() => toPaise(NaN)).toThrow(MoneyError);
      expect(() => toPaise(Infinity)).toThrow(MoneyError);
    });
  });

  describe("toRupeesDecimal", () => {
    it("converts integer paise to fixed 2-decimal string for gateways", () => {
      expect(toRupeesDecimal(129900)).toBe("1299.00");
      expect(toRupeesDecimal(129950)).toBe("1299.50");
      expect(toRupeesDecimal(5)).toBe("0.05");
      expect(toRupeesDecimal(0)).toBe("0.00");
      expect(toRupeesDecimal(-150)).toBe("-1.50");
    });

    it("rejects non-integer values", () => {
      expect(() => toRupeesDecimal(12.5)).toThrow(MoneyError);
    });
  });

  describe("formatINR", () => {
    it("formats Indian grouping system correctly", () => {
      expect(formatINR(0)).toBe("₹0");
      expect(formatINR(50000)).toBe("₹500");
      expect(formatINR(129900)).toBe("₹1,299");
      expect(formatINR(10000000)).toBe("₹1,00,000"); // 1 Lakh
      expect(formatINR(1000000000)).toBe("₹1,00,00,000"); // 1 Crore
    });

    it("formats remainder paise when non-zero", () => {
      expect(formatINR(129950)).toBe("₹1,299.50");
      expect(formatINR(129905)).toBe("₹1,299.05");
    });

    it("includes .00 when showZeroPaise is explicitly true", () => {
      expect(formatINR(129900, { showZeroPaise: true })).toBe("₹1,299.00");
    });

    it("formats negative currency values cleanly", () => {
      expect(formatINR(-50000)).toBe("-₹500");
      expect(formatINR(-129950)).toBe("-₹1,299.50");
    });
  });

  describe("integer arithmetic operations", () => {
    it("adds paise without float inaccuracies", () => {
      expect(addPaise(1000, 2050)).toBe(3050);
    });

    it("subtracts paise accurately", () => {
      expect(subtractPaise(5000, 1500)).toBe(3500);
    });

    it("multiplies unit price by quantity", () => {
      expect(multiplyPaise(129900, 3)).toBe(389700);
      expect(multiplyPaise(129900, 0)).toBe(0);
    });

    it("rejects non-integer or negative quantities in multiplication", () => {
      expect(() => multiplyPaise(1000, -1)).toThrow(MoneyError);
      expect(() => multiplyPaise(1000, 1.5)).toThrow(MoneyError);
    });
  });

  describe("paise assertions", () => {
    it("validates positive and non-negative integers", () => {
      expect(() => assertValidPaise(100)).not.toThrow();
      expect(() => assertValidPaise(0)).not.toThrow();
      expect(() => assertValidPaise(-1)).toThrow(MoneyError);
      expect(() => assertValidPaise(10.5)).toThrow(MoneyError);
      expect(() => assertValidPaise("100")).toThrow(MoneyError);
    });

    it("validates safe integer paise", () => {
      expect(() => assertIntegerPaise(-500)).not.toThrow();
      expect(() => assertIntegerPaise(500)).not.toThrow();
      expect(() => assertIntegerPaise(1.23)).toThrow(MoneyError);
    });
  });
});
