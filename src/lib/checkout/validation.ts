import { z } from "zod";

// Indian Phone Number Regex: optional +91 or 0, followed by 10 digits starting with 6, 7, 8, or 9
export const INDIAN_PHONE_REGEX = /^(?:(?:\+|0{0,2})91[\s-]?|[0]?)?[6789]\d{9}$/;

// Indian Postal PIN Code Regex: exactly 6 digits, starting with 1-9
export const INDIAN_PINCODE_REGEX = /^[1-9][0-9]{5}$/;

export const INDIAN_STATES = [
  "Andaman and Nicobar Islands",
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chandigarh",
  "Chhattisgarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jammu and Kashmir",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Ladakh",
  "Lakshadweep",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Puducherry",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
] as const;

export const CheckoutAddressSchema = z.object({
  fullName: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .max(60, "Full name must not exceed 60 characters"),
  email: z
    .string()
    .email("Please provide a valid email address for order confirmation"),
  phone: z
    .string()
    .regex(INDIAN_PHONE_REGEX, "Please provide a valid 10-digit Indian mobile number"),
  streetAddress: z
    .string()
    .min(5, "Please enter your flat/house no., building, and street name")
    .max(120, "Street address must not exceed 120 characters"),
  apartment: z.string().max(60).optional(),
  city: z
    .string()
    .min(2, "City must be at least 2 characters")
    .max(50, "City must not exceed 50 characters"),
  state: z
    .string()
    .min(2, "Please select your state"),
  pincode: z
    .string()
    .regex(INDIAN_PINCODE_REGEX, "PIN code must be a valid 6-digit Indian postal code"),
  country: z.literal("India").default("India"),
  notes: z.string().max(200).optional(),
});

export type CheckoutAddress = z.infer<typeof CheckoutAddressSchema>;

/**
 * Normalizes an Indian phone number to standard 10 digits without spaces or dashes.
 */
export function normalizeIndianPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) {
    return digits.slice(2);
  }
  if (digits.length === 11 && digits.startsWith("0")) {
    return digits.slice(1);
  }
  return digits;
}
