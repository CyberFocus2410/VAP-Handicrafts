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
  isVisibleOnStorefront: boolean; // true = displayed on storefront for all users, false = secret / VIP code
  usageCount: number;
  createdAt: string;
  description?: string;
}

export interface FreebieScheme {
  id: string;
  title: string;
  minOrderMinor: number; // e.g. 29900 (₹299)
  freebieProductId: string;
  freebieProductSlug: string;
  freebieProductName: string;
  freebieVariantId: string;
  freebieVariantName: string;
  freebiePriceMinor: number; // original value in paise, e.g. 14900 (₹149)
  freebieImageUrl: string;
  maxCustomersLimit: number; // e.g. 11 customers
  claimedCount: number;
  isActive: boolean;
  isBannerVisible: boolean;
  bannerText: string;
  createdAt: string;
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
    isVisibleOnStorefront: true,
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
    isVisibleOnStorefront: true,
    usageCount: 0,
    createdAt: new Date().toISOString(),
    description: "Flat ₹50 off on orders above ₹499",
  },
];

export const DEFAULT_FREEBIE_SCHEMES: FreebieScheme[] = [
  {
    id: "scheme-freebie-149",
    title: "First 11 Customers Special: Free Gift worth ₹149 on orders above ₹299",
    minOrderMinor: 29900, // ₹299
    freebieProductId: "00000000-0000-4000-8000-000000000001",
    freebieProductSlug: "spiral-conch-pink-crackle-bracelet",
    freebieProductName: "Handcrafted Seaside Shell Charm Keepsake",
    freebieVariantId: "var-freebie-001",
    freebieVariantName: "Complimentary Freebie Gift (Worth ₹149)",
    freebiePriceMinor: 14900, // ₹149 worth
    freebieImageUrl: "/images/products/shell-cone-pink-crackle-bracelet.webp",
    maxCustomersLimit: 11,
    claimedCount: 0,
    isActive: true,
    isBannerVisible: true,
    bannerText: "A freebie worth rupees 149 will be gifted free on minimum order of 299 for the first 11 customers.",
    createdAt: new Date().toISOString(),
  },
];

// In-memory cache
const globalWithPromos = globalThis as typeof globalThis & {
  __vapShippingConfig?: ShippingConfig;
  __vapDiscountCoupons?: Map<string, DiscountCoupon>;
  __vapFreebieSchemes?: Map<string, FreebieScheme>;
};

let memoryShipping: ShippingConfig =
  globalWithPromos.__vapShippingConfig ?? (globalWithPromos.__vapShippingConfig = { ...DEFAULT_SHIPPING_CONFIG });

const couponsStore: Map<string, DiscountCoupon> =
  globalWithPromos.__vapDiscountCoupons ??
  (globalWithPromos.__vapDiscountCoupons = new Map(DEFAULT_COUPONS.map((c) => [c.id, c])));

const freebieStore: Map<string, FreebieScheme> =
  globalWithPromos.__vapFreebieSchemes ??
  (globalWithPromos.__vapFreebieSchemes = new Map(DEFAULT_FREEBIE_SCHEMES.map((f) => [f.id, f])));

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
        const couponWithDefaults: DiscountCoupon = {
          ...item,
          isVisibleOnStorefront:
            item.isVisibleOnStorefront !== undefined
              ? Boolean(item.isVisibleOnStorefront)
              : true,
        };
        couponsStore.set(item.id, couponWithDefaults);
      }
    }
  } catch {
    // Non-fatal fallback
  }

  return Array.from(couponsStore.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

/**
 * Returns only coupons marked for public storefront display that are currently active.
 * Secret / VIP coupons (isVisibleOnStorefront: false) are strictly excluded from public display.
 */
export async function listPublicStorefrontCoupons(): Promise<DiscountCoupon[]> {
  const all = await listDiscountCoupons();
  return all.filter((c) => c.isActive && c.isVisibleOnStorefront === true);
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
  isVisibleOnStorefront?: boolean;
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
    isVisibleOnStorefront: input.isVisibleOnStorefront ?? false,
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

/* -------------------------------------------------------------------------- */
/*                            Freebie Gift Schemes                            */
/* -------------------------------------------------------------------------- */

export async function listFreebieSchemes(): Promise<FreebieScheme[]> {
  try {
    const supabase = env.server.SUPABASE_SERVICE_ROLE_KEY
      ? getSupabaseAdminClient()
      : getSupabaseAnonClient();

    const { data: row } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "freebie_schemes")
      .maybeSingle();

    if (row?.value && Array.isArray(row.value) && row.value.length > 0) {
      freebieStore.clear();
      for (const item of row.value as FreebieScheme[]) {
        freebieStore.set(item.id, item);
      }
    }
  } catch {
    // Non-fatal fallback
  }

  return Array.from(freebieStore.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function getActiveFreebieScheme(): Promise<FreebieScheme | null> {
  const schemes = await listFreebieSchemes();
  return (
    schemes.find(
      (s) => s.isActive && (s.maxCustomersLimit <= 0 || s.claimedCount < s.maxCustomersLimit)
    ) || null
  );
}

async function persistFreebieSchemes(): Promise<void> {
  if (env.server.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const supabase = getSupabaseAdminClient();
      const list = Array.from(freebieStore.values());
      await supabase.from("site_settings").upsert(
        {
          key: "freebie_schemes",
          value: list,
          is_public: true,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "key" }
      );
    } catch (err) {
      console.error("[Promotions] Failed to persist freebie_schemes to Supabase:", err);
    }
  }
}

export async function createFreebieScheme(input: {
  title: string;
  minOrderMinor: number;
  freebieProductId?: string;
  freebieProductSlug?: string;
  freebieProductName: string;
  freebieVariantId?: string;
  freebieVariantName?: string;
  freebiePriceMinor: number;
  freebieImageUrl?: string;
  maxCustomersLimit?: number;
  isActive?: boolean;
  isBannerVisible?: boolean;
  bannerText?: string;
}): Promise<FreebieScheme> {
  await listFreebieSchemes();

  const id = `scheme-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const minOrderRupees = Math.round(input.minOrderMinor / 100);
  const freebieWorthRupees = Math.round(input.freebiePriceMinor / 100);
  const maxLimit = input.maxCustomersLimit !== undefined ? Math.max(0, input.maxCustomersLimit) : 11;

  const newScheme: FreebieScheme = {
    id,
    title: input.title.trim(),
    minOrderMinor: Math.max(0, input.minOrderMinor),
    freebieProductId: input.freebieProductId || "00000000-0000-4000-8000-000000000001",
    freebieProductSlug: input.freebieProductSlug || "spiral-conch-pink-crackle-bracelet",
    freebieProductName: input.freebieProductName.trim() || "Handcrafted Seaside Shell Charm Keepsake",
    freebieVariantId: input.freebieVariantId || `var-${id}`,
    freebieVariantName: input.freebieVariantName || "Complimentary Freebie Gift",
    freebiePriceMinor: Math.max(0, input.freebiePriceMinor),
    freebieImageUrl: input.freebieImageUrl || "/images/products/shell-cone-pink-crackle-bracelet.webp",
    maxCustomersLimit: maxLimit,
    claimedCount: 0,
    isActive: input.isActive ?? true,
    isBannerVisible: input.isBannerVisible ?? true,
    bannerText:
      input.bannerText?.trim() ||
      `A freebie worth rupees ${freebieWorthRupees} will be gifted free on minimum order of ${minOrderRupees} for the first ${maxLimit} customers.`,
    createdAt: new Date().toISOString(),
  };

  freebieStore.set(id, newScheme);
  await persistFreebieSchemes();
  return newScheme;
}

export async function updateFreebieScheme(
  id: string,
  patch: Partial<Omit<FreebieScheme, "id" | "createdAt">>
): Promise<FreebieScheme> {
  await listFreebieSchemes();
  const existing = freebieStore.get(id);
  if (!existing) {
    throw new Error(`Freebie scheme "${id}" not found.`);
  }

  const updated: FreebieScheme = {
    ...existing,
    ...patch,
  };

  freebieStore.set(id, updated);
  await persistFreebieSchemes();
  return updated;
}

export async function deleteFreebieScheme(id: string): Promise<boolean> {
  await listFreebieSchemes();
  const deleted = freebieStore.delete(id);
  if (deleted) {
    await persistFreebieSchemes();
  }
  return deleted;
}

export async function incrementFreebieClaim(schemeId: string): Promise<void> {
  try {
    await listFreebieSchemes();
    const scheme = freebieStore.get(schemeId);
    if (scheme) {
      scheme.claimedCount = (scheme.claimedCount || 0) + 1;
      freebieStore.set(schemeId, scheme);
      await persistFreebieSchemes();
    }
  } catch {
    // Non-fatal
  }
}

