/**
 * Money utilities adhering to RULES.md Rule A1 & PRD §18.3:
 * - All monetary values represent integer minor units (paise).
 * - No floating point math for currency accumulation or calculations.
 * - Single audited conversion boundary for external providers (Paytm).
 */

export class MoneyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MoneyError";
  }
}

/**
 * Validates that a value is a valid non-negative integer paise representation.
 */
export function assertValidPaise(paise: unknown, name = "amount"): asserts paise is number {
  if (typeof paise !== "number" || !Number.isSafeInteger(paise)) {
    throw new MoneyError(`${name} must be a safe integer representing paise. Received: ${String(paise)}`);
  }
  if (paise < 0) {
    throw new MoneyError(`${name} cannot be negative. Received: ${paise}`);
  }
}

/**
 * Validates any integer paise (including negative, for adjustments/refunds).
 */
export function assertIntegerPaise(paise: unknown, name = "amount"): asserts paise is number {
  if (typeof paise !== "number" || !Number.isSafeInteger(paise)) {
    throw new MoneyError(`${name} must be a safe integer representing paise. Received: ${String(paise)}`);
  }
}

/**
 * Convert rupee decimal amount (e.g. from user input or provider) to integer paise.
 * Uses string parsing to prevent IEEE-754 floating point distortion.
 */
export function toPaise(rupees: number | string): number {
  if (typeof rupees === "number") {
    if (!Number.isFinite(rupees)) {
      throw new MoneyError(`Cannot convert non-finite rupee amount to paise: ${rupees}`);
    }
    // Round to 2 decimals first to avoid float representations like 12.990000000000002
    return toPaise(rupees.toFixed(2));
  }

  const cleaned = rupees.trim();
  if (!cleaned) {
    throw new MoneyError("Cannot convert empty string to paise");
  }

  const match = /^-?\d+(\.\d{1,2})?$/.exec(cleaned);
  if (!match) {
    throw new MoneyError(`Invalid rupee format: "${rupees}". Expected up to 2 decimal places.`);
  }

  const isNegative = cleaned.startsWith("-");
  const abs = isNegative ? cleaned.slice(1) : cleaned;
  const parts = abs.split(".");
  const wholePart = parts[0] ?? "0";
  const fractionPart = (parts[1] ?? "").padEnd(2, "0").slice(0, 2);

  const whole = parseInt(wholePart, 10);
  const frac = parseInt(fractionPart, 10);

  if (!Number.isSafeInteger(whole)) {
    throw new MoneyError(`Rupee whole amount exceeds safe integer range: "${rupees}"`);
  }

  const total = whole * 100 + frac;
  return isNegative ? -total : total;
}

/**
 * Convert integer paise to decimal string with exactly two decimal places.
 * Used for external payment gateway payload requirements (e.g. Paytm).
 */
export function toRupeesDecimal(paise: number): string {
  assertIntegerPaise(paise, "paise");
  const isNegative = paise < 0;
  const abs = Math.abs(paise);
  const whole = Math.floor(abs / 100);
  const remainder = abs % 100;
  const formatted = `${whole}.${remainder.toString().padStart(2, "0")}`;
  return isNegative ? `-${formatted}` : formatted;
}

/**
 * Format integer paise into standard Indian Rupee notation (e.g. ₹1,299 or ₹1,299.50).
 * By default, drops .00 paise for cleaner luxury storefront presentation.
 */
export function formatINR(
  paise: number,
  options: { readonly showZeroPaise?: boolean } = {}
): string {
  assertIntegerPaise(paise, "paise");

  const isNegative = paise < 0;
  const abs = Math.abs(paise);
  const rupees = Math.floor(abs / 100);
  const remainder = abs % 100;

  // Format integer part using Indian grouping: last 3 digits, then pairs of 2
  const rupeesStr = rupees.toString();
  let formattedRupees: string;
  if (rupeesStr.length <= 3) {
    formattedRupees = rupeesStr;
  } else {
    const lastThree = rupeesStr.slice(-3);
    const remaining = rupeesStr.slice(0, -3);
    const withCommas = remaining.replace(/\B(?=(\d{2})+(?!\d))/g, ",");
    formattedRupees = `${withCommas},${lastThree}`;
  }

  const prefix = isNegative ? "-₹" : "₹";

  if (remainder === 0 && !options.showZeroPaise) {
    return `${prefix}${formattedRupees}`;
  }

  const fracStr = remainder.toString().padStart(2, "0");
  return `${prefix}${formattedRupees}.${fracStr}`;
}

/**
 * Add two integer paise amounts safely.
 */
export function addPaise(a: number, b: number): number {
  assertIntegerPaise(a, "first amount");
  assertIntegerPaise(b, "second amount");
  const result = a + b;
  assertIntegerPaise(result, "sum");
  return result;
}

/**
 * Subtract b from a (integer paise).
 */
export function subtractPaise(a: number, b: number): number {
  assertIntegerPaise(a, "first amount");
  assertIntegerPaise(b, "second amount");
  const result = a - b;
  assertIntegerPaise(result, "difference");
  return result;
}

/**
 * Multiply paise amount by an integer quantity.
 */
export function multiplyPaise(paise: number, quantity: number): number {
  assertIntegerPaise(paise, "unit price in paise");
  if (!Number.isSafeInteger(quantity) || quantity < 0) {
    throw new MoneyError(`Quantity must be a non-negative integer. Received: ${quantity}`);
  }
  const result = paise * quantity;
  assertIntegerPaise(result, "total price in paise");
  return result;
}
