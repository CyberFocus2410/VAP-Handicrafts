"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight, Sparkles } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { useCartStore } from "@/lib/cart/cart-store";
import { type ValidatedCartResponse } from "@/lib/cart/types";
import { formatINR } from "@/lib/money";
import { Button } from "@/components/ui/button";
import { generateAutoAlt } from "@/lib/images/auto-alt";

export function CartDrawer() {
  const items = useCartStore((s) => s.items);
  const isDrawerOpen = useCartStore((s) => s.isDrawerOpen);
  const closeDrawer = useCartStore((s) => s.closeDrawer);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const hasHydrated = useCartStore((s) => s.hasHydrated);
  const couponCode = useCartStore((s) => s.couponCode);
  const applyCoupon = useCartStore((s) => s.applyCoupon);
  const removeCoupon = useCartStore((s) => s.removeCoupon);

  const [validatedCart, setValidatedCart] = React.useState<ValidatedCartResponse | null>(null);
  const [isValidating, setIsValidating] = React.useState(false);
  const [liveAnnouncement, setLiveAnnouncement] = React.useState("");
  const [couponInput, setCouponInput] = React.useState("");

  // Re-validate cart whenever items or couponCode change
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
      body: JSON.stringify({ items, couponCode: couponCode || undefined }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (!isCancelled && data.success) {
          setValidatedCart(data.data);
        }
      })
      .catch(() => {
        // Fallback local calculation if network error
      })
      .finally(() => {
        if (!isCancelled) setIsValidating(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [items, couponCode, hasHydrated]);

  const handleUpdateQty = (lineId: string, currentQty: number, delta: number, name: string) => {
    const newQty = currentQty + delta;
    updateQuantity(lineId, newQty);
    setLiveAnnouncement(
      newQty <= 0
        ? `Removed ${name} from cart.`
        : `Updated quantity for ${name} to ${newQty}.`
    );
  };

  const handleRemove = (lineId: string, name: string) => {
    removeItem(lineId);
    setLiveAnnouncement(`Removed ${name} from cart.`);
  };

  const lines = validatedCart?.lines || [];
  const subtotal = validatedCart?.subtotalMinor ?? 0;
  const shipping = validatedCart?.shippingMinor ?? 0;
  const discount = validatedCart?.discountMinor ?? 0;
  const total = validatedCart?.totalMinor ?? 0;
  const appliedCoupon = validatedCart?.appliedCoupon;
  const notices = validatedCart?.notices ?? [];
  const freeShippingThreshold = validatedCart?.freeShippingThresholdMinor ?? 99900;
  const neededForFreeShipping = validatedCart?.amountNeededForFreeShippingMinor ?? 99900;
  const freeShippingProgress = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    applyCoupon(couponInput.trim());
  };

  const handleRemoveCoupon = () => {
    removeCoupon();
    setCouponInput("");
  };

  return (
    <Dialog.Root open={isDrawerOpen} onOpenChange={(open) => !open && closeDrawer()}>
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {liveAnnouncement}
      </div>

      <Dialog.Portal>
        {/* Backdrop */}
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs transition-opacity duration-300" />

        {/* Slide-over Content */}
        <Dialog.Content
          aria-describedby="cart-description"
          className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-surface shadow-2xl border-l border-border transition-transform duration-300 focus:outline-none"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border p-5">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-cocoa" />
              <Dialog.Title className="font-serif text-xl font-medium text-cocoa">
                Your Shopping Bag
              </Dialog.Title>
              {items.length > 0 && (
                <span className="rounded-full bg-sand px-2 py-0.5 text-xs font-semibold text-cocoa">
                  {validatedCart?.itemCount ?? items.length}
                </span>
              )}
            </div>
            <Dialog.Close asChild>
              <button
                type="button"
                className="rounded-full p-2 text-cocoa-muted hover:bg-sand/60 hover:text-cocoa transition-colors"
                aria-label="Close cart drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </Dialog.Close>
          </div>

          <div id="cart-description" className="sr-only">
            List of items in your shopping bag and subtotal summary
          </div>

          {/* Free Shipping Banner */}
          {items.length > 0 && (
            <div className="bg-sand/40 border-b border-border/60 px-5 py-3">
              <div className="flex items-center justify-between text-xs text-cocoa mb-1.5 font-medium">
                <span>
                  {neededForFreeShipping > 0
                    ? `Add ${formatINR(neededForFreeShipping)} more for FREE shipping!`
                    : "You have unlocked FREE standard delivery! 🎉"}
                </span>
                <span className="font-semibold text-rose-deep">{freeShippingProgress}%</span>
              </div>
              <div className="w-full bg-sand rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-rose-deep h-full rounded-full transition-all duration-500"
                  style={{ width: `${freeShippingProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-16 space-y-4">
                <div className="w-16 h-16 rounded-full bg-sand flex items-center justify-center text-cocoa-muted">
                  <ShoppingBag className="w-8 h-8 stroke-[1.2]" />
                </div>
                <div className="space-y-1">
                  <p className="font-serif text-lg font-medium text-cocoa">Your cart is empty</p>
                  <p className="text-xs text-cocoa-muted max-w-xs">
                    Discover our handcrafted shell jewellery collection and personalized gifts &amp; cards.
                  </p>
                </div>
                <Button
                  onClick={closeDrawer}
                  asChild
                  variant="secondary"
                  size="sm"
                  className="rounded-full px-6 text-xs mt-2"
                >
                  <Link href="/shop">Explore Jewellery</Link>
                </Button>
              </div>
            ) : (
              lines.map((line) => (
                <div
                  key={line.lineId}
                  className="flex gap-4 p-3.5 rounded-lg border border-border/80 bg-surface/80 hover:bg-surface transition-colors"
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-[4/5] w-20 flex-shrink-0 overflow-hidden rounded-md bg-sand">
                    <Image
                      src={line.imageUrl}
                      alt={generateAutoAlt({
                        customText: line.imageAlt,
                        name: line.productName,
                        type: "product",
                      })}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Line Details */}
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          href={`/products/${line.productSlug}`}
                          onClick={closeDrawer}
                          className="font-medium text-sm text-cocoa hover:text-rose-deep transition-colors line-clamp-1"
                        >
                          {line.productName}
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleRemove(line.lineId, line.productName)}
                          className="text-cocoa-muted hover:text-error transition-colors p-1"
                          aria-label={`Remove ${line.productName} from cart`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <p className="text-xs text-cocoa-muted mt-0.5">
                        Option: {line.variantName}
                      </p>

                      {/* Customization Details Pill */}
                      {line.customization && (
                        <div className="mt-2 rounded-md bg-sand/60 p-2 text-[11px] text-cocoa space-y-0.5 border border-cocoa/5">
                          <div className="flex items-center gap-1 font-semibold text-rose-deep">
                            <Sparkles className="w-3 h-3" />
                            <span>
                              {line.customization.templateId === "relationship_licence"
                                ? "Relationship Licence Card"
                                : "Personalized Card"}
                            </span>
                          </div>
                          {line.customization.licenseHolder && (
                            <p>Holders: <strong>{line.customization.licenseHolder}</strong></p>
                          )}
                          {line.customization.validFrom && (
                            <p className="text-[10px] text-cocoa-muted">Valid From: {line.customization.validFrom}</p>
                          )}
                          {line.customization.signature && (
                            <p className="text-[10px] italic">Signature: {line.customization.signature}</p>
                          )}
                          {line.customization.recipientName && !line.customization.licenseHolder && (
                            <p>For: <strong>{line.customization.recipientName}</strong></p>
                          )}
                          {line.customization.caption && (
                            <p className="italic">&ldquo;{line.customization.caption}&rdquo;</p>
                          )}
                          {line.customization.message && (
                            <p className="line-clamp-1 italic text-cocoa-muted">&ldquo;{line.customization.message}&rdquo;</p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Price and Quantity Stepper */}
                    <div className="flex items-center justify-between pt-3 border-t border-border/40 mt-2">
                      <div className="flex items-center gap-2 border border-border rounded-full px-2 py-1 bg-surface">
                        <button
                          type="button"
                          onClick={() => handleUpdateQty(line.lineId, line.quantity, -1, line.productName)}
                          className="text-cocoa hover:text-rose-deep transition-colors"
                          aria-label={`Decrease quantity of ${line.productName}`}
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-semibold text-cocoa min-w-4 text-center">
                          {line.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleUpdateQty(line.lineId, line.quantity, 1, line.productName)}
                          className="text-cocoa hover:text-rose-deep transition-colors"
                          aria-label={`Increase quantity of ${line.productName}`}
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="text-right">
                        <span className="text-sm font-semibold text-cocoa">
                          {formatINR(line.subtotalMinor)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Summary */}
          {items.length > 0 && (
            <div className="border-t border-border p-5 space-y-3.5 bg-surface/90">
              {/* Promo Code Input or Applied Badge */}
              <div className="space-y-1.5">
                {appliedCoupon ? (
                  <div className="flex items-center justify-between rounded-lg border border-emerald-500/30 bg-emerald-50/60 dark:bg-emerald-950/20 px-3 py-2 text-xs">
                    <div className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300 font-medium">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Code <strong>{appliedCoupon.code}</strong> applied ({formatINR(appliedCoupon.discountMinor)} off)</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="text-cocoa-muted hover:text-rose-deep text-xs font-semibold ml-2 underline cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Discount code (e.g. WELCOME10)"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      className="flex-1 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs uppercase placeholder:normal-case focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <Button
                      type="submit"
                      variant="outline"
                      size="sm"
                      disabled={!couponInput.trim() || isValidating}
                      className="text-xs px-3 py-1.5 h-auto rounded-lg"
                    >
                      Apply
                    </Button>
                  </form>
                )}
                {/* Notice message if invalid coupon */}
                {couponCode && !appliedCoupon && !isValidating && (
                  <p className="text-[11px] text-rose-deep">
                    {notices.find((n) => n.message.toLowerCase().includes("coupon"))?.message || "Invalid or inapplicable coupon code"}
                  </p>
                )}
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-cocoa-muted">
                  <span>Subtotal</span>
                  <span className="font-medium text-cocoa">{formatINR(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>Discount ({appliedCoupon?.code})</span>
                    <span>-{formatINR(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-cocoa-muted">
                  <span>Estimated Shipping</span>
                  <span className="font-medium text-cocoa">
                    {shipping === 0 ? "FREE" : formatINR(shipping)}
                  </span>
                </div>
                <div className="flex justify-between text-base font-semibold text-cocoa pt-2 border-t border-border/80">
                  <span>Estimated Total</span>
                  <span className="text-rose-deep">{formatINR(total)}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Button
                  asChild
                  size="lg"
                  className="w-full justify-center gap-2 rounded-full py-5 text-sm font-semibold shadow-md"
                >
                  <Link href="/checkout" onClick={closeDrawer}>
                    <span>Proceed to Checkout</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>

                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="w-full justify-center rounded-full text-xs"
                >
                  <Link href="/cart" onClick={closeDrawer}>
                    View Full Cart Details
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
