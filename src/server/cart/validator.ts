import "server-only";
import { getProductBySlug, listProducts } from "@/server/catalogue/queries";
import {
  type CartLineIntent,
  type ValidatedCartLine,
  type ValidatedCartResponse,
  type CartNotice,
} from "@/lib/cart/types";
import { assertValidPaise } from "@/lib/money";
import {
  getShippingConfig,
  validateCoupon,
  listPublicStorefrontCoupons,
} from "@/server/admin/promotions-service";

export const FREE_SHIPPING_THRESHOLD_PAISE = 99900; // ₹999 in paise (default fallback)
export const STANDARD_SHIPPING_PAISE = 9900; // ₹99 in paise (default fallback)

/**
 * Validates and re-prices client cart line intents against authoritative database catalogue data.
 * Prevents price tampering, enforces stock limits, and computes dynamic shipping & coupon rules.
 */
export async function validateAndPriceCart(
  intents: CartLineIntent[],
  couponCode?: string
): Promise<ValidatedCartResponse> {
  const validatedLines: ValidatedCartLine[] = [];
  const notices: CartNotice[] = [];

  // Fetch all active products for fallback/resolution
  const catalogueResult = await listProducts({ limit: 50 });
  const allProducts = catalogueResult.products;

  for (const intent of intents) {
    // 1. Resolve product by slug or id
    let product = await getProductBySlug(intent.productSlug);
    if (!product) {
      product = allProducts.find((p) => p.id === intent.productId) ?? null;
    }

    if (!product || product.status !== "active") {
      notices.push({
        lineId: intent.lineId,
        type: "OUT_OF_STOCK",
        message: `An item in your cart is currently no longer available and was omitted.`,
      });
      continue;
    }

    // 2. Resolve variant
    const variant = product.variants.find((v) => v.id === intent.variantId) ?? product.variants[0];
    if (!variant) {
      notices.push({
        lineId: intent.lineId,
        type: "OUT_OF_STOCK",
        message: `Selected variant for "${product.name}" is unavailable.`,
      });
      continue;
    }

    // 3. Stock validation
    const maxAvailable = typeof variant.stockQuantity === "number" ? variant.stockQuantity : 10;
    const isAvailable = variant.inStock && maxAvailable > 0;

    if (!isAvailable) {
      notices.push({
        lineId: intent.lineId,
        type: "OUT_OF_STOCK",
        message: `"${product.name} (${variant.name})" is currently sold out.`,
      });
      continue;
    }

    let resolvedQty = Math.max(1, intent.quantity);
    if (resolvedQty > maxAvailable) {
      resolvedQty = maxAvailable;
      notices.push({
        lineId: intent.lineId,
        type: "STOCK_ADJUSTED",
        message: `Quantity for "${product.name} (${variant.name})" was adjusted to available stock (${maxAvailable}).`,
      });
    }

    // 4. Authoritative Pricing
    const priceMinor = variant.priceMinor;
    assertValidPaise(priceMinor, "variant.priceMinor");
    const subtotalMinor = priceMinor * resolvedQty;
    assertValidPaise(subtotalMinor, "line.subtotalMinor");

    const primaryImg = product.images.find((img) => img.isPrimary) ?? product.images[0];

    validatedLines.push({
      lineId: intent.lineId,
      productId: product.id,
      productSlug: product.slug,
      productName: product.name,
      variantId: variant.id,
      variantName: variant.name,
      sku: variant.sku,
      imageUrl: primaryImg?.url ?? "/images/products/shell-cone-pink-crackle-bracelet.webp",
      imageAlt: primaryImg?.alt ?? product.name,
      priceMinor,
      compareAtPriceMinor: variant.compareAtPriceMinor ?? product.compareAtPriceMinor ?? null,
      quantity: resolvedQty,
      subtotalMinor,
      isDevPrice: variant.isDevPrice,
      inStock: isAvailable,
      availableStock: maxAvailable,
      customization: intent.customization,
    });
  }

  // 5. Cart-level Totals
  const subtotalMinor = validatedLines.reduce((acc, line) => acc + line.subtotalMinor, 0);
  assertValidPaise(subtotalMinor, "cart.subtotalMinor");

  const itemCount = validatedLines.reduce((acc, line) => acc + line.quantity, 0);

  // Dynamic Shipping calculation from promotions service
  let shippingConfig = {
    standardShippingPaise: STANDARD_SHIPPING_PAISE,
    freeShippingThresholdPaise: FREE_SHIPPING_THRESHOLD_PAISE,
    freeShippingEnabled: true,
  };

  try {
    shippingConfig = await getShippingConfig();
  } catch {
    // Non-fatal fallback
  }

  const qualifiesForFreeShipping =
    shippingConfig.freeShippingEnabled &&
    (subtotalMinor >= shippingConfig.freeShippingThresholdPaise || subtotalMinor === 0);

  const shippingMinor = qualifiesForFreeShipping ? 0 : shippingConfig.standardShippingPaise;

  // Coupon evaluation
  let discountMinor = 0;
  let appliedCoupon: ValidatedCartResponse["appliedCoupon"] = undefined;

  if (couponCode && couponCode.trim()) {
    try {
      const couponResult = await validateCoupon(couponCode, subtotalMinor);
      if (couponResult.valid) {
        discountMinor = couponResult.discountMinor;
        appliedCoupon = {
          code: couponResult.code,
          discountMinor: couponResult.discountMinor,
          message: couponResult.message,
        };
      } else if (couponResult.error) {
        notices.push({
          type: "INFO",
          message: couponResult.error,
        });
      }
    } catch {
      // Non-fatal
    }
  }

  const totalMinor = Math.max(0, subtotalMinor + shippingMinor - discountMinor);
  assertValidPaise(totalMinor, "cart.totalMinor");

  const amountNeededForFreeShippingMinor = Math.max(
    0,
    shippingConfig.freeShippingThresholdPaise - subtotalMinor
  );

  let availableOffers: ValidatedCartResponse["availableOffers"] = undefined;
  try {
    const publicCoupons = await listPublicStorefrontCoupons();
    if (publicCoupons.length > 0) {
      availableOffers = publicCoupons.map((c) => ({
        code: c.code,
        type: c.type,
        value: c.value,
        discountDisplay: c.type === "percentage" ? `${c.value}% OFF` : `₹${c.value} OFF`,
        minOrderMinor: c.minOrderMinor,
        description: c.description,
      }));
    }
  } catch {
    // Non-fatal
  }

  return {
    valid: validatedLines.length > 0 || intents.length === 0,
    lines: validatedLines,
    itemCount,
    subtotalMinor,
    shippingMinor,
    discountMinor,
    totalMinor,
    freeShippingThresholdMinor: shippingConfig.freeShippingThresholdPaise,
    amountNeededForFreeShippingMinor,
    notices,
    appliedCoupon,
    availableOffers,
  };
}
