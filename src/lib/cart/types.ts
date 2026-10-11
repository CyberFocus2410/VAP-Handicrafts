import { z } from "zod";

export const CustomizationValuesSchema = z.object({
  recipientName: z.string().max(50).optional(),
  senderName: z.string().max(50).optional(),
  occasion: z.string().max(50).optional(),
  message: z.string().max(300).optional(),
  date: z.string().max(30).optional(),
  caption: z.string().max(100).optional(),
  templateId: z.string().max(50).optional(),
  photoUploadId: z.string().uuid().optional(),
  photoPreviewUrl: z.string().optional(),
  specialInstructions: z.string().max(200).optional(),
  licenseHolder: z.string().max(100).optional(),
  validFrom: z.string().max(50).optional(),
  signature: z.string().max(50).optional(),
  relationStatus: z.string().max(50).optional(),
  licenseType: z.string().max(50).optional(),
  validUntil: z.string().max(50).optional(),
  emergencyContact: z.string().max(50).optional(),
  relationshipId: z.string().max(50).optional(),
}).passthrough();

export type CustomizationValues = z.infer<typeof CustomizationValuesSchema>;

export const CartLineIntentSchema = z.object({
  lineId: z.string().min(1),
  productId: z.string().min(1),
  productSlug: z.string().min(1),
  variantId: z.string().min(1),
  quantity: z.number().int().positive().max(50),
  customization: CustomizationValuesSchema.optional(),
});

export type CartLineIntent = z.infer<typeof CartLineIntentSchema>;

/**
 * Checks whether two customization sets are semantically identical.
 * If customizations differ (e.g. different recipient or photo), they must be separate lines (PRD §9.4).
 */
export function areCustomizationsEqual(
  a?: CustomizationValues,
  b?: CustomizationValues
): boolean {
  if (!a && !b) return true;
  if (!a || !b) return false;

  const normalize = (obj: CustomizationValues) => {
    const cleaned: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj)) {
      if (k === "photoPreviewUrl") continue; // client preview URL does not dictate item uniqueness
      if (v !== undefined && v !== null && v !== "") {
        cleaned[k] = v;
      }
    }
    return cleaned;
  };

  const normA = normalize(a);
  const normB = normalize(b);

  const keysA = Object.keys(normA).sort();
  const keysB = Object.keys(normB).sort();

  if (keysA.length !== keysB.length) return false;
  return keysA.every((key) => normA[key] === normB[key]);
}

/**
 * Server-authoritative line response.
 */
export interface ValidatedCartLine {
  lineId: string;
  productId: string;
  productSlug: string;
  productName: string;
  variantId: string;
  variantName: string;
  sku: string;
  imageUrl: string;
  imageAlt: string;
  priceMinor: number;
  compareAtPriceMinor: number | null;
  quantity: number;
  subtotalMinor: number;
  isDevPrice: boolean;
  inStock: boolean;
  availableStock: number;
  customization?: CustomizationValues;
}

export interface CartNotice {
  lineId?: string;
  type: "PRICE_CHANGED" | "STOCK_ADJUSTED" | "OUT_OF_STOCK" | "INFO";
  message: string;
}

export interface ValidatedCartResponse {
  valid: boolean;
  lines: ValidatedCartLine[];
  itemCount: number;
  subtotalMinor: number;
  shippingMinor: number;
  discountMinor: number;
  totalMinor: number;
  freeShippingThresholdMinor: number;
  amountNeededForFreeShippingMinor: number;
  notices: CartNotice[];
}
