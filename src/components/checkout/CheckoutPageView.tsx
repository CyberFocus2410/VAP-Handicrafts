"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ShieldCheck, Lock, Sparkles, ArrowRight, AlertCircle, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/lib/cart/cart-store";
import { formatINR } from "@/lib/money";
import { INDIAN_STATES, INDIAN_PHONE_REGEX, INDIAN_PINCODE_REGEX } from "@/lib/checkout/validation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";

export function CheckoutPageView() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const hasHydrated = useCartStore((s) => s.hasHydrated);

  // Address form state
  const [fullName, setFullName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [streetAddress, setStreetAddress] = React.useState("");
  const [apartment, setApartment] = React.useState("");
  const [city, setCity] = React.useState("");
  const [state, setState] = React.useState("Delhi");
  const [pincode, setPincode] = React.useState("");
  const [notes, setNotes] = React.useState("");

  // Validation errors
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  // Price calculations
  const [validatedData, setValidatedData] = React.useState<{
    subtotalMinor: number;
    shippingMinor: number;
    totalMinor: number;
  }>({
    subtotalMinor: 0,
    shippingMinor: 9900,
    totalMinor: 9900,
  });

  // Re-fetch authoritative price calculation
  React.useEffect(() => {
    if (!hasHydrated || items.length === 0) return;

    fetch("/api/cart/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items }),
    })
      .then((res) => res.json())
      .then((json) => {
        const data = json.data || json;
        if (data.subtotalMinor !== undefined) {
          setValidatedData({
            subtotalMinor: data.subtotalMinor,
            shippingMinor: data.shippingMinor,
            totalMinor: data.totalMinor,
          });
        }
      })
      .catch((err) => console.error("Validation error:", err));
  }, [items, hasHydrated]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (fullName.trim().length < 2) {
      newErrors.fullName = "Please enter your full name (minimum 2 characters)";
    }

    if (!email.includes("@") || !email.includes(".")) {
      newErrors.email = "Please enter a valid email address for order updates";
    }

    if (!INDIAN_PHONE_REGEX.test(phone.trim())) {
      newErrors.phone = "Please enter a valid 10-digit Indian mobile number";
    }

    if (streetAddress.trim().length < 5) {
      newErrors.streetAddress = "Please enter your complete street / house address";
    }

    if (city.trim().length < 2) {
      newErrors.city = "Please enter your city";
    }

    if (!INDIAN_PINCODE_REGEX.test(pincode.trim())) {
      newErrors.pincode = "Please enter a valid 6-digit Indian PIN code";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!validateForm()) return;
    if (items.length === 0) {
      setSubmitError("Your cart is empty.");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        items,
        address: {
          fullName: fullName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          streetAddress: streetAddress.trim(),
          apartment: apartment.trim() || undefined,
          city: city.trim(),
          state,
          pincode: pincode.trim(),
          country: "India",
          notes: notes.trim() || undefined,
        },
      };

      const res = await fetch("/api/checkout/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Order creation failed");
      }

      // If simulator or redirect URL provided
      if (data.payment?.redirectUrl) {
        window.location.href = data.payment.redirectUrl;
        return;
      }

      // If Paytm form post
      if (data.payment?.formAction && data.payment?.formFields) {
        const form = document.createElement("form");
        form.method = "POST";
        form.action = data.payment.formAction;

        for (const [key, value] of Object.entries(data.payment.formFields)) {
          const input = document.createElement("input");
          input.type = "hidden";
          input.name = key;
          input.value = String(value);
          form.appendChild(input);
        }

        document.body.appendChild(form);
        form.submit();
        return;
      }

      // Default fallback to order page
      router.push(`/order/${data.orderReference}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Payment initialization failed";
      setSubmitError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!hasHydrated) {
    return (
      <Section className="py-20 text-center">
        <Container>
          <p className="text-cocoa-muted text-sm">Loading checkout...</p>
        </Container>
      </Section>
    );
  }

  if (items.length === 0) {
    return (
      <Section className="py-20 text-center">
        <Container className="max-w-md space-y-4">
          <div className="w-16 h-16 rounded-full bg-sand flex items-center justify-center mx-auto text-cocoa-muted">
            <ShoppingBag className="w-8 h-8 stroke-[1.2]" />
          </div>
          <h1 className="font-serif text-2xl font-medium text-cocoa">Your shopping bag is empty</h1>
          <p className="text-sm text-cocoa-muted">
            Explore our handcrafted shell jewellery pieces and custom relationship cards.
          </p>
          <Button asChild size="lg" className="rounded-full shadow-md">
            <Link href="/shop">Start Shopping</Link>
          </Button>
        </Container>
      </Section>
    );
  }

  return (
    <Section className="py-12 md:py-16">
      <Container>
        <div className="mb-10 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-rose-deep mb-2">
            <Lock className="w-3.5 h-3.5" />
            <span>Secure 256-Bit SSL Checkout</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-medium text-cocoa">
            Complete Your Order
          </h1>
        </div>

        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Delivery Details Form (7 cols) */}
          <div className="lg:col-span-7 space-y-8 bg-surface p-6 sm:p-8 rounded-xl border border-border shadow-sm">
            <div className="border-b border-border/80 pb-4">
              <h2 className="font-display font-medium text-xl text-cocoa">
                1. Delivery & Contact Details
              </h2>
              <p className="text-xs text-cocoa-muted mt-0.5">
                Orders are hand-packed with care and shipped across all Indian PIN codes.
              </p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="fullName" className="text-xs font-medium text-cocoa">
                    Full Name *
                  </Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    placeholder="e.g. Priya Sharma"
                    onChange={(e) => setFullName(e.target.value)}
                  />
                  {errors.fullName && <p className="text-[11px] text-error">{errors.fullName}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="text-xs font-medium text-cocoa">
                    Mobile Phone (10-Digit) *
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    placeholder="e.g. 9876543210"
                    onChange={(e) => setPhone(e.target.value)}
                  />
                  {errors.phone && <p className="text-[11px] text-error">{errors.phone}</p>}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-medium text-cocoa">
                  Email Address (For Order Tracking) *
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  placeholder="e.g. priya@example.com"
                  onChange={(e) => setEmail(e.target.value)}
                />
                {errors.email && <p className="text-[11px] text-error">{errors.email}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="streetAddress" className="text-xs font-medium text-cocoa">
                  Street Address & Flat / House No. *
                </Label>
                <Input
                  id="streetAddress"
                  value={streetAddress}
                  placeholder="e.g. Flat 402, Lotus Court, MG Road"
                  onChange={(e) => setStreetAddress(e.target.value)}
                />
                {errors.streetAddress && <p className="text-[11px] text-error">{errors.streetAddress}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="apartment" className="text-xs font-medium text-cocoa">
                  Apartment, Suite, Landmark (Optional)
                </Label>
                <Input
                  id="apartment"
                  value={apartment}
                  placeholder="e.g. Near City Garden"
                  onChange={(e) => setApartment(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="city" className="text-xs font-medium text-cocoa">
                    City *
                  </Label>
                  <Input
                    id="city"
                    value={city}
                    placeholder="e.g. New Delhi"
                    onChange={(e) => setCity(e.target.value)}
                  />
                  {errors.city && <p className="text-[11px] text-error">{errors.city}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="state" className="text-xs font-medium text-cocoa">
                    State *
                  </Label>
                  <select
                    id="state"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full h-10 rounded-sm border border-border bg-surface px-3 py-1 text-xs text-cocoa outline-none focus:border-rose-deep focus:ring-2 focus:ring-ring"
                  >
                    {INDIAN_STATES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="pincode" className="text-xs font-medium text-cocoa">
                    PIN Code *
                  </Label>
                  <Input
                    id="pincode"
                    value={pincode}
                    maxLength={6}
                    placeholder="110001"
                    onChange={(e) => setPincode(e.target.value)}
                  />
                  {errors.pincode && <p className="text-[11px] text-error">{errors.pincode}</p>}
                </div>
              </div>

              <div className="space-y-1.5 pt-2">
                <Label htmlFor="notes" className="text-xs font-medium text-cocoa">
                  Delivery Instructions / Notes (Optional)
                </Label>
                <Input
                  id="notes"
                  value={notes}
                  placeholder="e.g. Please ring doorbell twice"
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>

            {submitError && (
              <div className="flex items-center gap-2 p-3 rounded-md bg-rose-50 border border-error/30 text-xs text-error">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            <div className="pt-4 border-t border-border">
              <Button
                type="submit"
                size="lg"
                disabled={isSubmitting}
                className="w-full justify-center gap-2 py-6 text-sm font-semibold rounded-full bg-rose-deep hover:bg-rose-deeper text-white shadow-md"
              >
                <span>Proceed to Payment ({formatINR(validatedData.totalMinor)})</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
              <div className="mt-3 flex items-center justify-center gap-2 text-xs text-cocoa-muted">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span>UPI, Paytm, Credit/Debit Cards, NetBanking</span>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-surface p-6 rounded-xl border border-border shadow-sm space-y-5">
              <h2 className="font-display font-medium text-lg text-cocoa pb-3 border-b border-border/70">
                Order Summary ({items.reduce((s, i) => s + i.quantity, 0)} Items)
              </h2>

              <div className="space-y-3.5 max-h-[360px] overflow-y-auto pr-1">
                {items.map((line) => (
                  <div key={line.lineId} className="flex gap-3 text-xs border-b border-border/40 pb-3">
                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between items-start font-medium text-cocoa">
                        <span>{line.productSlug.replace(/-/g, " ")}</span>
                        <span>x {line.quantity}</span>
                      </div>

                      {/* Customization Details */}
                      {line.customization && (
                        <div className="rounded-md bg-sand/60 p-2 text-[10px] space-y-0.5 text-cocoa-muted">
                          <span className="font-semibold text-rose-deep flex items-center gap-1">
                            <Sparkles className="w-2.5 h-2.5" />
                            {line.customization.templateId === "relationship_licence"
                              ? "Relationship Licence Card"
                              : "Personalized Card"}
                          </span>
                          {line.customization.licenseHolder && (
                            <p>Holders: <strong>{line.customization.licenseHolder}</strong></p>
                          )}
                          {line.customization.validFrom && (
                            <p>Anniversary: {line.customization.validFrom}</p>
                          )}
                          {line.customization.recipientName && !line.customization.licenseHolder && (
                            <p>For: {line.customization.recipientName}</p>
                          )}
                          {line.customization.caption && (
                            <p className="italic">&ldquo;{line.customization.caption}&rdquo;</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-2 pt-2 border-t border-border/70 text-xs">
                <div className="flex justify-between text-cocoa-muted">
                  <span>Subtotal</span>
                  <span className="font-medium text-cocoa">{formatINR(validatedData.subtotalMinor)}</span>
                </div>
                <div className="flex justify-between text-cocoa-muted">
                  <span>Shipping</span>
                  <span className="font-medium text-cocoa">
                    {validatedData.shippingMinor === 0 ? "FREE" : formatINR(validatedData.shippingMinor)}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-border/70 text-base font-bold text-cocoa">
                  <span>Total Amount</span>
                  <span className="text-rose-deep">{formatINR(validatedData.totalMinor)}</span>
                </div>
              </div>
            </div>

            {/* Micro Trust Highlighting */}
            <div className="rounded-lg bg-sand/40 p-4 border border-cocoa/10 space-y-2 text-xs text-cocoa-muted">
              <div className="flex items-center gap-2 font-medium text-cocoa">
                <Sparkles className="w-3.5 h-3.5 text-rose-deep" />
                <span>VAP Handicrafts Guarantee</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Every piece is assembled by hand using genuine ocean shells and premium card stationery. Hand-packed with love.
              </p>
            </div>
          </div>
        </form>
      </Container>
    </Section>
  );
}
