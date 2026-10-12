import { getSupabaseAdminClient, getSupabaseAnonClient } from "@/server/db/supabase";
import { env } from "@/lib/env";
import { assertValidPaise } from "@/lib/money";

export interface ShippingConfig {
  standardShippingPaise: number;
  freeShippingThresholdPaise: number;
  freeShippingEnabled: boolean;
}

export interface DiscountCoupon {
  id: string;
  code: string;
  type: "percentage" | "flat";
  value: number; // percentage (e.g. 10) or rupees (e.g. 50)
  minOrderMinor?: number; // minimum subtotal in paise required
  isActive: boolean;
  usageCount: number;
  createdAt: string;
  description?: string;
}

export const DEFAULT_SHIPPING_CONFIG: ShippingConfig = {
  standardShippingPaise: 9900, // ₹99
  freeShippingThresholdPaise: 99900, // ₹999
  freeShippingEnabled: true,
};

export const DEFAULT_COUPONS: DiscountCoupon[] = [
  {
    id: "coupon-welcome10",
    code: "WELCOME10",
    type: "percentage",
    value: 10,
    minOrderMinor: 0,
    isActive: true,
    usageCount: 0,
    createdAt: new Date().toISOString(),
    description: "10% off welcome discount for all new customers",
  },
  {
    id: "coupon-vap50",
    code: "VAP50",
    type: "flat",
    value: 50,
    minOrderMinor: 49900, // min ₹499
    isActive: true,
    usageCount: 0,
    createdAt: new Date().toISOString(),
    description: "Flat ₹50 off on orders above ₹499",
  },
];

// In-memory cache
const globalWithPromos = globalThis as typeof globalThis & {
  __vapShippingConfig?: ShippingConfig;
  __vapDiscountCoupons?: Map<string, DiscountCoupon>;
};

let memoryShipping: ShippingConfig =
  globalWithPromos.__vapShippingConfig ?? (globalWithPromos.__vapShippingConfig = { ...DEFAULT_SHIPPING_CONFIG });

const couponsStore: Map<string, DiscountCoupon> =
  globalWithPromos.__vapDiscountCoupons ??
  (globalWithPromos.__vapDiscountCoupons = new Map(DEFAULT_COUPONS.map((c) => [c.id, c])));

/* -------------------------------------------------------------------------- */
/*                            Shipping Management                             */
/* -------------------------------------------------------------------------- */

export async function getShippingConfig(): Promise<ShippingConfig> {
  try {
    const supabase = env.server.SUPABASE_SERVICE_ROLE_KEY
      ? getSupabaseAdminClient()
      : getSupabaseAnonClient();

    const { data: row } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "shipping_config")
      .maybeSingle();

    if (row?.value && typeof row.value === "object") {
      const val = row.value as any;
      memoryShipping = {
        standardShippingPaise:
          typeof val.standardShippingPaise === "number"
            ? val.standardShippingPaise
            : DEFAULT_SHIPPING_CONFIG.standardShippingPaise,
        freeShippingThresholdPaise:
          typeof val.freeShippingThresholdPaise === "number"
            ? val.freeShippingThresholdPaise
            : DEFAULT_SHIPPING_CONFIG.freeShippingThresholdPaise,
        freeShippingEnabled:
          typeof val.freeShippingEnabled === "boolean"
            ? val.freeShippingEnabled
            : DEFAULT_SHIPPING_CONFIG.freeShippingEnabled,
      };
      globalWithPromos.__vapShippingConfig = memoryShipping;
    }
  } catch {
    // Non-fatal fallback
  }

  return memoryShipping;
}

export async function updateShippingConfig(
  patch: Partial<ShippingConfig>
): Promise<ShippingConfig> {
  const current = await getShippingConfig();
  const updated: ShippingConfig = {
    standardShippingPaise:
      patch.standardShippingPaise !== undefined
        ? patch.standardShippingPaise
        : current.standardShippingPaise,
    freeShippingThresholdPaise:
      patch.freeShippingThresholdPaise !== undefined
        ? patch.freeShippingThresholdPaise
        : current.freeShippingThresholdPaise,
    freeShippingEnabled:
      patch.freeShippingEnabled !== undefined
        ? patch.freeShippingEnabled
        : current.freeShippingEnabled,
  };

  memoryShipping = updated;
  globalWithPromos.__vapShippingConfig = updated;

  if (env.server.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const supabase = getSupabaseAdminClient();
      await supabase.from("site_settings").upsert(
        {
          key: "shipping_config",
          value: updated,
          is_public: true,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "key" }
      );
    } catch (err) {
      console.error("[Promotions] Failed to persist shipping_config to Supabase:", err);
    }
  }

  return updated;
}

/* -------------------------------------------------------------------------- */
/*                            Discount Coupons                                */
/* -------------------------------------------------------------------------- */

export async function listDiscountCoupons(): Promise<DiscountCoupon[]> {
  try {
    const supabase = env.server.SUPABASE_SERVICE_ROLE_KEY
      ? getSupabaseAdminClient()
      : getSupabaseAnonClient();

    const { data: row } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "discount_coupons")
      .maybeSingle();

    if (row?.value && Array.isArray(row.value)) {
      couponsStore.clear();
      for (const item of row.value as DiscountCoupon[]) {
        couponsStore.set(item.id, item);
      }
    }
  } catch {
    // Non-fatal fallback
  }

  return Array.from(couponsStore.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

async function persistCoupons(): Promise<void> {
  if (env.server.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const supabase = getSupabaseAdminClient();
      const list = Array.from(couponsStore.values());
      await supabase.from("site_settings").upsert(
        {
          key: "discount_coupons",
          value: list,
          is_public: false,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "key" }
      );
    } catch (err) {
      console.error("[Promotions] Failed to persist discount_coupons to Supabase:", err);
    }
  }
}

export async function createDiscountCoupon(input: {
  code: string;
  type: "percentage" | "flat";
  value: number;
  minOrderMinor?: number;
  isActive?: boolean;
  description?: string;
}): Promise<DiscountCoupon> {
  await listDiscountCoupons(); // Ensure sync

  const normalizedCode = input.code.trim().toUpperCase();
  if (!normalizedCode) {
    throw new Error("Coupon code is required");
  }

  // Check unique
  for (const c of couponsStore.values()) {
    if (c.code === normalizedCode) {
      throw new Error(`Coupon with code "${normalizedCode}" already exists.`);
    }
  }

  const id = `coupon-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const newCoupon: DiscountCoupon = {
    id,
    code: normalizedCode,
    type: input.type,
    value: Math.max(0, input.value),
    minOrderMinor: input.minOrderMinor ? Math.max(0, input.minOrderMinor) : 0,
    isActive: input.isActive ?? true,
    usageCount: 0,
    createdAt: new Date().toISOString(),
    description: input.description?.trim() || undefined,
  };

  couponsStore.set(id, newCoupon);
  await persistCoupons();
  return newCoupon;
}

export async function updateDiscountCoupon(
  id: string,
  patch: Partial<Omit<DiscountCoupon, "id" | "createdAt">>
): Promise<DiscountCoupon> {
  await listDiscountCoupons();
  const existing = couponsStore.get(id);
  if (!existing) {
    throw new Error(`Coupon "${id}" not found.`);
  }

  const updated: DiscountCoupon = {
    ...existing,
    ...patch,
    code: patch.code ? patch.code.trim().toUpperCase() : existing.code,
  };

  couponsStore.set(id, updated);
  await persistCoupons();
  return updated;
}

export async function deleteDiscountCoupon(id: string): Promise<boolean> {
  await listDiscountCoupons();
  const deleted = couponsStore.delete(id);
  if (deleted) {
    await persistCoupons();
  }
  return deleted;
}

export async function incrementCouponUsage(code: string): Promise<void> {
  try {
    await listDiscountCoupons();
    const upper = code.trim().toUpperCase();
    for (const [id, coupon] of couponsStore.entries()) {
      if (coupon.code === upper) {
        coupon.usageCount = (coupon.usageCount || 0) + 1;
        couponsStore.set(id, coupon);
        await persistCoupons();
        break;
      }
    }
  } catch {
    // Non-fatal
  }
}

/* -------------------------------------------------------------------------- */
/*                            Authoritative Validator                         */
/* -------------------------------------------------------------------------- */

export interface CouponValidationResult {
  valid: boolean;
  code: string;
  discountMinor: number;
  message?: string;
  error?: string;
  description?: string;
}

export async function validateCoupon(
  code: string | undefined | null,
  subtotalMinor: number
): Promise<CouponValidationResult> {
  if (!code || !code.trim()) {
    return { valid: false, code: "", discountMinor: 0 };
  }

  await listDiscountCoupons();
  const normalized = code.trim().toUpperCase();

  const coupon = Array.from(couponsStore.values()).find(
    (c) => c.code.toUpperCase() === normalized
  );

  if (!coupon) {
    return {
      valid: false,
      code: normalized,
      discountMinor: 0,
      error: `Invalid coupon code "${normalized}". Please check for typos.`,
    };
  }

  if (!coupon.isActive) {
    return {
      valid: false,
      code: normalized,
      discountMinor: 0,
      error: `Coupon "${normalized}" is currently inactive or expired.`,
    };
  }

  const minOrder = coupon.minOrderMinor ?? 0;
  if (minOrder > 0 && subtotalMinor < minOrder) {
    const minRupees = Math.round(minOrder / 100);
    return {
      valid: false,
      code: normalized,
      discountMinor: 0,
      error: `Coupon "${normalized}" requires a minimum order of ₹${minRupees}. Add more items to qualify!`,
    };
  }

  // Calculate discount
  let discountMinor = 0;
  if (coupon.type === "percentage") {
    discountMinor = Math.round((subtotalMinor * coupon.value) / 100);
  } else {
    // Flat rupee discount
    discountMinor = Math.min(subtotalMinor, Math.round(coupon.value * 100));
  }

  assertValidPaise(discountMinor, "coupon.discountMinor");

  const discountRupees = Math.round(discountMinor / 100);
  return {
    valid: true,
    code: normalized,
    discountMinor,
    message: `Coupon "${normalized}" applied! Saved ₹${discountRupees}.`,
    description: coupon.description,
  };
}
