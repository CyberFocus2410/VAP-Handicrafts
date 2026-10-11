"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Plus, Minus, Trash2, ShoppingBag, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import { useCartStore } from "@/lib/cart/cart-store";
import { type ValidatedCartResponse } from "@/lib/cart/types";
import { formatINR } from "@/lib/money";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";

export function CartPageView() {
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const hasHydrated = useCartStore((s) => s.hasHydrated);

  const [validatedCart, setValidatedCart] = React.useState<ValidatedCartResponse | null>(null);
  const [isValidating, setIsValidating] = React.useState(false);

  React.useEffect(() => {
    if (!hasHydrated) return;

    if (items.length === 0) {
      setValidatedCart({
        valid: true,
        lines: [],
        itemCount: 0,
        subtotalMinor: 0,
        shippingMinor: 0,
        discountMinor: 0,
        totalMinor: 0,
        freeShippingThresholdMinor: 99900,
        amountNeededForFreeShippingMinor: 99900,
        notices: [],
      });
      return;
    }

    let isCancelled = false;
    setIsValidating(true);

    fetch("/api/cart/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (!isCancelled && data.success) {
          setValidatedCart(data.data);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!isCancelled) setIsValidating(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [items, hasHydrated]);

  if (!hasHydrated) {
    return (
      <div className="py-24 text-center">
        <p className="text-sm text-cocoa-muted">Loading your cart...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-20 max-w-lg mx-auto space-y-5">
        <div className="w-20 h-20 rounded-full bg-sand flex items-center justify-center mx-auto text-cocoa-muted">
          <ShoppingBag className="w-10 h-10 stroke-[1.2]" />
        </div>
        <div className="space-y-2">
          <Heading level="h1" className="text-3xl font-serif">
            Your Cart is Empty
          </Heading>
          <p className="text-sm text-cocoa-muted leading-relaxed">
            Discover handcrafted shell jewellery, keepsake sets, and personalized gifts made with authentic ocean shells.
          </p>
        </div>
        <Button asChild size="lg" className="rounded-full px-8 shadow-sm">
          <Link href="/shop">
            <span>Explore Collections</span>
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Link>
        </Button>
      </div>
    );
  }

  const lines = validatedCart?.lines || [];
  const subtotal = validatedCart?.subtotalMinor ?? 0;
  const shipping = validatedCart?.shippingMinor ?? 0;
  const total = validatedCart?.totalMinor ?? 0;
  const neededForFreeShipping = validatedCart?.amountNeededForFreeShippingMinor ?? 99900;
  const freeShippingThreshold = validatedCart?.freeShippingThresholdMinor ?? 99900;
  const progressPercent = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  return (
    <div className="space-y-10">
      <div>
        <Heading level="h1" className="text-3xl sm:text-4xl">
          Shopping Cart ({validatedCart?.itemCount ?? items.length})
        </Heading>
        <p className="mt-2 text-sm text-cocoa-muted">
          Review your selected pieces and personalized gifts before checkout.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column: Line Items (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Free Shipping Alert Banner */}
          <div className="rounded-lg bg-sand/40 border border-border p-4">
            <div className="flex items-center justify-between text-xs text-cocoa font-medium mb-2">
              <span>
                {neededForFreeShipping > 0
                  ? `Add ${formatINR(neededForFreeShipping)} more for FREE delivery across India!`
                  : "You qualify for FREE standard shipping! 🎉"}
              </span>
              <span className="font-semibold text-rose-deep">{progressPercent}%</span>
            </div>
            <div className="w-full bg-sand rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-rose-deep h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Lines */}
          <div className="space-y-4">
            {lines.map((line) => (
              <div
                key={line.lineId}
                className="flex flex-col sm:flex-row gap-5 p-5 rounded-lg border border-border bg-surface shadow-xs"
              >
                {/* Image */}
                <div className="relative aspect-[4/5] w-28 sm:w-32 flex-shrink-0 overflow-hidden rounded-md bg-sand">
                  <Image
                    src={line.imageUrl}
                    alt={line.imageAlt}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Details */}
                <div className="flex flex-1 flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <Link
                          href={`/products/${line.productSlug}`}
                          className="font-serif text-lg font-medium text-cocoa hover:text-rose-deep transition-colors"
                        >
                          {line.productName}
                        </Link>
                        <p className="text-xs text-cocoa-muted mt-0.5">
                          Option: <span className="font-medium text-cocoa">{line.variantName}</span> • SKU: {line.sku}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeItem(line.lineId)}
                        className="text-cocoa-muted hover:text-error transition-colors p-1"
                        aria-label={`Remove ${line.productName} from cart`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Customization Details */}
                    {line.customization && (
                      <div className="mt-3 rounded-md bg-sand/60 p-3 text-xs text-cocoa space-y-1 border border-cocoa/5">
                        <div className="flex items-center gap-1.5 font-semibold text-rose-deep">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>
                            {line.customization.templateId === "relationship_licence"
                              ? "Relationship Licence Card"
                              : "Personalized Card Details"}
                          </span>
                        </div>
                        {line.customization.licenseHolder && (
                          <p>Holders: <strong>{line.customization.licenseHolder}</strong></p>
                        )}
                        {line.customization.validFrom && (
                          <p className="text-[11px] text-cocoa-muted">Valid From: {line.customization.validFrom}</p>
                        )}
                        {line.customization.signature && (
                          <p className="text-[11px] italic">Signature: {line.customization.signature}</p>
                        )}
                        {line.customization.recipientName && !line.customization.licenseHolder && (
                          <p>Recipient: <strong>{line.customization.recipientName}</strong></p>
                        )}
                        {line.customization.caption && (
                          <p className="italic">Caption: &ldquo;{line.customization.caption}&rdquo;</p>
                        )}
                        {line.customization.message && (
                          <p className="italic text-cocoa-muted">Note: &ldquo;{line.customization.message}&rdquo;</p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Quantity and Price */}
                  <div className="flex items-center justify-between pt-4 border-t border-border/60 mt-4">
                    <div className="flex items-center gap-3 border border-border rounded-full px-3 py-1 bg-surface">
                      <button
                        type="button"
                        onClick={() => updateQuantity(line.lineId, line.quantity - 1)}
                        className="text-cocoa hover:text-rose-deep transition-colors p-0.5"
                        aria-label={`Decrease quantity of ${line.productName}`}
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-xs font-semibold text-cocoa min-w-5 text-center">
                        {line.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(line.lineId, line.quantity + 1)}
                        className="text-cocoa hover:text-rose-deep transition-colors p-0.5"
                        aria-label={`Increase quantity of ${line.productName}`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="text-right">
                      <span className="text-base font-semibold text-cocoa">
                        {formatINR(line.subtotalMinor)}
                      </span>
                      {line.quantity > 1 && (
                        <p className="text-[11px] text-cocoa-muted">
                          {formatINR(line.priceMinor)} each
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Order Summary (4 cols) */}
        <div className="lg:col-span-4 sticky top-28 space-y-6">
          <div className="rounded-lg border border-border bg-surface p-6 shadow-sm space-y-5">
            <h2 className="font-serif text-xl font-medium text-cocoa">
              Order Summary
            </h2>

            <div className="space-y-3 text-xs border-b border-border/80 pb-4">
              <div className="flex justify-between text-cocoa-muted">
                <span>Items Subtotal</span>
                <span className="font-medium text-cocoa">{formatINR(subtotal)}</span>
              </div>
              <div className="flex justify-between text-cocoa-muted">
                <span>Standard Delivery (India)</span>
                <span className="font-medium text-cocoa">
                  {shipping === 0 ? (
                    <span className="text-success font-semibold">FREE</span>
                  ) : (
                    formatINR(shipping)
                  )}
                </span>
              </div>
            </div>

            <div className="flex justify-between items-baseline text-base font-semibold text-cocoa">
              <span>Grand Total</span>
              <span className="text-xl text-rose-deep">{formatINR(total)}</span>
            </div>

            <div className="space-y-3 pt-2">
              <Button
                asChild
                size="lg"
                className="w-full justify-center gap-2 rounded-full py-6 text-sm font-semibold shadow-md"
              >
                <Link href="/checkout">
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-cocoa-muted text-center pt-2">
                <ShieldCheck className="w-4 h-4 text-cocoa-muted" />
                <span>Secure payment via Paytm UPI, cards, and net banking.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
