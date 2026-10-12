"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Lock,
  Sparkles,
  ArrowRight,
  ShoppingBag,
  QrCode,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Phone,
  FileCheck,
} from "lucide-react";
import { useCartStore } from "@/lib/cart/cart-store";
import { type ValidatedCartResponse } from "@/lib/cart/types";
import { formatINR } from "@/lib/money";
import { INDIAN_STATES, INDIAN_PHONE_REGEX, INDIAN_PINCODE_REGEX } from "@/lib/checkout/validation";
import { BRAND } from "@/config/brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";

export function CheckoutPageView() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const hasHydrated = useCartStore((s) => s.hasHydrated);
  const clearCart = useCartStore((s) => s.clearCart);

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

  // Created order state for UPI payment step
  const [createdOrder, setCreatedOrder] = React.useState<{
    orderReference: string;
    totalMinor: number;
  } | null>(null);

  // Payment proof state
  const [proofFile, setProofFile] = React.useState<File | null>(null);
  const [proofPreviewUrl, setProofPreviewUrl] = React.useState<string | null>(null);
  const [proofUtr, setProofUtr] = React.useState("");
  const [isSubmittingProof, setIsSubmittingProof] = React.useState(false);
  const [proofError, setProofError] = React.useState<string | null>(null);

  // Price calculations
  const [validatedCart, setValidatedCart] = React.useState<ValidatedCartResponse | null>(null);

  const validatedData = {
    subtotalMinor: validatedCart?.subtotalMinor ?? 0,
    shippingMinor: validatedCart?.shippingMinor ?? 9900,
    totalMinor: validatedCart?.totalMinor ?? ((validatedCart?.subtotalMinor ?? 0) + 9900),
  };

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
          setValidatedCart(data);
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

      // Transition to UPI QR code payment step
      setCreatedOrder({
        orderReference: data.orderReference,
        totalMinor: data.totalMinor || validatedData.totalMinor,
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Order creation failed";
      setSubmitError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProofFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProofError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setProofError("Please select an image file (PNG, JPG, or WebP).");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setProofError("Image exceeds 10MB limit. Please select a smaller screenshot.");
      return;
    }

    setProofFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setProofPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createdOrder) return;

    if (!proofFile && !proofPreviewUrl) {
      setProofError("Please upload your payment confirmation screenshot before submitting.");
      return;
    }

    setIsSubmittingProof(true);
    setProofError(null);

    try {
      const res = await fetch("/api/checkout/submit-proof", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderReference: createdOrder.orderReference,
          paymentProofUrl: proofPreviewUrl,
          paymentUtr: proofUtr.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to submit payment proof");
      }

      // Clear cart and redirect to order status
      clearCart();
      router.push(`/order/${createdOrder.orderReference}?status=verification_pending`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error submitting payment proof";
      setProofError(msg);
    } finally {
      setIsSubmittingProof(false);
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

  // STEP 2: UPI QR CODE PAYMENT SCREEN
  if (createdOrder) {
    return (
      <Section className="py-12 md:py-16">
        <Container className="max-w-3xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full mb-3">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
              <span>Step 2 of 2: UPI QR Payment &amp; Proof Verification</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-cocoa">
              Scan QR &amp; Complete Payment
            </h1>
            <p className="text-sm text-cocoa-muted mt-2">
              Order Reference: <strong className="text-cocoa font-mono">{createdOrder.orderReference}</strong>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start bg-surface p-6 sm:p-8 rounded-2xl border border-border shadow-sm">
            {/* Left Column: QR Code & Payment Amount */}
            <div className="space-y-4 text-center border-b md:border-b-0 md:border-r border-border/80 pb-6 md:pb-0 md:pr-6">
              <div className="bg-[#FAF5EF] p-4 rounded-xl border border-border/80 inline-block shadow-inner mx-auto">
                <div className="relative w-64 h-72 mx-auto rounded-xl overflow-hidden border border-cocoa/15 bg-black p-1 shadow-md">
                  <Image
                    src="/images/brand/upi-qr.png"
                    alt="VAP Handicrafts Official UPI QR Code - Vivan Mittal"
                    width={256}
                    height={288}
                    className="w-full h-full object-contain rounded-lg"
                    priority
                  />
                </div>
                <div className="mt-3">
                  <span className="text-[11px] font-semibold text-cocoa/80 bg-white/70 px-2.5 py-0.5 rounded-full inline-block border border-border mb-1">
                    UPI Payee: <strong>Vivan Mittal</strong>
                  </span>
                  <span className="text-xs uppercase font-bold tracking-wider text-[#A05A44] block">
                    Payable Amount
                  </span>
                  <span className="text-2xl font-serif font-bold text-cocoa block mt-0.5">
                    {formatINR(createdOrder.totalMinor)}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-cocoa-muted">
                <p className="font-semibold text-cocoa">Accepted UPI Applications:</p>
                <div className="flex flex-wrap justify-center gap-1.5 text-[11px] text-cocoa font-medium">
                  <span className="px-2 py-0.5 bg-sand rounded">Google Pay</span>
                  <span className="px-2 py-0.5 bg-sand rounded">PhonePe</span>
                  <span className="px-2 py-0.5 bg-sand rounded">Paytm UPI</span>
                  <span className="px-2 py-0.5 bg-sand rounded">BHIM</span>
                  <span className="px-2 py-0.5 bg-sand rounded">Cred</span>
                </div>
              </div>
            </div>

            {/* Right Column: Instructions & Screenshot Upload */}
            <form onSubmit={handleSubmitProof} className="space-y-5 text-left">
              <div className="space-y-2">
                <h2 className="font-serif text-lg font-bold text-cocoa flex items-center gap-2">
                  <QrCode className="w-5 h-5 text-rose-deep" />
                  <span>How to Pay:</span>
                </h2>
                <ol className="text-xs text-cocoa-muted space-y-2 list-decimal list-inside leading-relaxed bg-[#FAF5EF] p-3.5 rounded-xl border border-border/60">
                  <li>Open any UPI App on your smartphone.</li>
                  <li>Scan the QR code and pay exactly <strong>{formatINR(createdOrder.totalMinor)}</strong>.</li>
                  <li>Capture a screenshot of the successful payment.</li>
                  <li>Upload the screenshot below to verify your order.</li>
                </ol>
              </div>

              {/* Screenshot Upload Field */}
              <div className="space-y-2">
                <Label htmlFor="proof-upload" className="text-xs font-semibold text-cocoa block">
                  Upload Payment Screenshot *
                </Label>
                
                {proofPreviewUrl ? (
                  <div className="relative rounded-xl border-2 border-emerald-500/40 bg-emerald-50/20 p-3 flex items-center gap-3">
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-border shrink-0 bg-white">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={proofPreviewUrl}
                        alt="Uploaded payment proof preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-emerald-900 truncate">
                        {proofFile?.name || "Payment_Screenshot.png"}
                      </p>
                      <p className="text-[11px] text-emerald-700">Screenshot ready to submit</p>
                      <label
                        htmlFor="proof-upload"
                        className="text-[11px] text-rose-deep font-semibold hover:underline cursor-pointer inline-block mt-0.5"
                      >
                        Change screenshot
                      </label>
                    </div>
                  </div>
                ) : (
                  <label
                    htmlFor="proof-upload"
                    className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-[#D5C7BC] hover:border-rose-deep/60 rounded-xl bg-[#FAF5EF]/60 hover:bg-[#FAF5EF] cursor-pointer transition text-center"
                  >
                    <UploadCloud className="w-8 h-8 text-rose-deep/70 mb-2" />
                    <span className="text-xs font-semibold text-cocoa">
                      Click to upload payment screenshot
                    </span>
                    <span className="text-[11px] text-cocoa-muted mt-0.5">
                      Supports PNG, JPG, or WebP (max 10MB)
                    </span>
                  </label>
                )}

                <input
                  id="proof-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleProofFileChange}
                  className="sr-only"
                />
              </div>

              {/* UTR / Reference ID Field */}
              <div className="space-y-1.5">
                <Label htmlFor="proofUtr" className="text-xs font-semibold text-cocoa block">
                  12-Digit UPI Reference / UTR No. (Optional)
                </Label>
                <Input
                  id="proofUtr"
                  type="text"
                  placeholder="e.g. 428901234567"
                  value={proofUtr}
                  onChange={(e) => setProofUtr(e.target.value)}
                  className="text-xs"
                />
                <p className="text-[10px] text-cocoa-muted">
                  Found on your GPay/PhonePe payment receipt as &ldquo;UPI Ref No&rdquo; or &ldquo;UTR&rdquo;.
                </p>
              </div>

              {proofError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-error text-xs rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{proofError}</span>
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={isSubmittingProof}
                className="w-full rounded-full shadow-md text-sm font-semibold py-3 gap-2"
              >
                {isSubmittingProof ? (
                  <span>Submitting Verification...</span>
                ) : (
                  <>
                    <FileCheck className="w-4 h-4" />
                    <span>Submit Payment Proof &amp; Confirm Order</span>
                  </>
                )}
              </Button>

              <div className="pt-2 border-t border-border/60 text-center text-xs text-cocoa-muted">
                <span>Facing any issue?</span>{" "}
                <a
                  href={`https://wa.me/919311516813?text=Hi! I am placing order ${createdOrder.orderReference} and need assistance with UPI payment.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-rose-deep font-semibold hover:underline inline-flex items-center gap-1"
                >
                  <Phone className="w-3 h-3" />
                  <span>Chat on WhatsApp (+91 9311516813)</span>
                </a>
              </div>
            </form>
          </div>
        </Container>
      </Section>
    );
  }

  // EMPTY CART SCREEN
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

  // STEP 1: DELIVERY & CONTACT FORM
  return (
    <Section className="py-12 md:py-16">
      <Container>
        <div className="mb-10 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-rose-deep mb-2">
            <Lock className="w-3.5 h-3.5" />
            <span>Step 1 of 2: Delivery &amp; Contact Details</span>
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
                1. Delivery &amp; Contact Details
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
                  Email Address *
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  placeholder="e.g. priya@example.com"
                  onChange={(e) => setEmail(e.target.value)}
                />
                <p className="text-[11px] text-cocoa-muted">
                  Order confirmation and courier tracking will be sent here.
                </p>
                {errors.email && <p className="text-[11px] text-error">{errors.email}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="streetAddress" className="text-xs font-medium text-cocoa">
                  Street Address &amp; House / Flat No. *
                </Label>
                <Input
                  id="streetAddress"
                  value={streetAddress}
                  placeholder="e.g. Flat 402, Sunshine Heights, MG Road"
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
                  placeholder="e.g. Near City Mall"
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
                    className="flex h-11 w-full rounded-sm border border-cocoa/20 bg-surface px-3 py-2 text-sm text-cocoa focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {INDIAN_STATES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="pincode" className="text-xs font-medium text-cocoa">
                    PIN Code (6-Digit) *
                  </Label>
                  <Input
                    id="pincode"
                    value={pincode}
                    maxLength={6}
                    placeholder="e.g. 110001"
                    onChange={(e) => setPincode(e.target.value)}
                  />
                  {errors.pincode && <p className="text-[11px] text-error">{errors.pincode}</p>}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="notes" className="text-xs font-medium text-cocoa">
                  Special Delivery Instructions / Dedication Note (Optional)
                </Label>
                <Input
                  id="notes"
                  value={notes}
                  placeholder="e.g. Leave with security or ring doorbell"
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>

            {submitError && (
              <div className="p-4 bg-rose-50 border border-rose-200 text-error text-xs rounded-md">
                {submitError}
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={isSubmitting}
              className="w-full rounded-full shadow-md text-sm font-semibold py-3 gap-2"
            >
              {isSubmitting ? (
                <span>Generating Order...</span>
              ) : (
                <>
                  <QrCode className="w-4 h-4" />
                  <span>Proceed to UPI QR Payment ({formatINR(validatedData.totalMinor)})</span>
                </>
              )}
            </Button>
          </div>

          {/* Right Column: Order Summary (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-surface p-6 sm:p-8 rounded-xl border border-border shadow-sm space-y-6">
              <div className="border-b border-border/80 pb-4">
                <h2 className="font-display font-medium text-xl text-cocoa">
                  Order Summary
                </h2>
                <p className="text-xs text-cocoa-muted mt-0.5">
                  {items.reduce((acc, i) => acc + i.quantity, 0)} handcrafted item(s)
                </p>
              </div>

              {/* Items List */}
              <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
                {(validatedCart?.lines && validatedCart.lines.length > 0
                  ? validatedCart.lines.map((vl) => ({
                      lineId: vl.lineId,
                      title: vl.productName,
                      imageUrl: vl.imageUrl,
                      quantity: vl.quantity,
                      priceMinor: vl.priceMinor,
                      customization: vl.customization,
                    }))
                  : items.map((i) => ({
                      lineId: i.lineId,
                      title: i.productSlug.replace(/-/g, " "),
                      imageUrl: "/images/brand/logo.webp",
                      quantity: i.quantity,
                      priceMinor: 0,
                      customization: i.customization,
                    }))
                ).map((line) => (
                  <div key={line.lineId} className="flex gap-3 text-xs border-b border-border/40 pb-3 last:border-b-0 last:pb-0">
                    <div className="relative w-12 h-12 rounded-md overflow-hidden bg-sand shrink-0 border border-border">
                      <Image
                        src={line.imageUrl || "/images/brand/logo.webp"}
                        alt={line.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-cocoa truncate capitalize">{line.title}</p>
                      <p className="text-cocoa-muted text-[11px]">
                        Qty: {line.quantity} {line.priceMinor > 0 ? `× ${formatINR(line.priceMinor)}` : ""}
                      </p>

                      {line.customization && (
                        <div className="rounded-md bg-sand/60 p-2 text-[10px] space-y-0.5 text-cocoa-muted mt-1">
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
