"use client";

import * as React from "react";
import Link from "next/link";
import { CheckCircle2, XCircle, Clock, Sparkles, ArrowRight, ShoppingBag, Phone } from "lucide-react";
import { formatINR } from "@/lib/money";
import { BRAND } from "@/config/brand";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { useCartStore } from "@/lib/cart/cart-store";

interface OrderConfirmationViewProps {
  orderReference: string;
  initialStatus?: string;
  error?: string;
}

export function OrderConfirmationView({
  orderReference,
  initialStatus = "paid",
  error,
}: OrderConfirmationViewProps) {
  const clearCart = useCartStore((s) => s.clearCart);

  // Clear cart upon verified paid status
  React.useEffect(() => {
    if (initialStatus === "paid") {
      clearCart();
    }
  }, [initialStatus, clearCart]);

  const isPaid = initialStatus === "paid";
  const isPendingVerification =
    initialStatus === "verification_pending" ||
    initialStatus === "payment_proof_submitted";
  const isFailed = initialStatus === "failed";

  return (
    <Section className="py-16 md:py-24">
      <Container className="max-w-2xl text-center">
        {/* Status Badge Icon */}
        <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-6 shadow-md transition-transform hover:scale-105">
          {isPaid ? (
            <div className="w-full h-full rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
              <CheckCircle2 className="w-10 h-10" />
            </div>
          ) : isPendingVerification ? (
            <div className="w-full h-full rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800">
              <Clock className="w-10 h-10" />
            </div>
          ) : isFailed ? (
            <div className="w-full h-full rounded-full bg-rose-100 flex items-center justify-center text-error">
              <XCircle className="w-10 h-10" />
            </div>
          ) : (
            <div className="w-full h-full rounded-full bg-amber-100 flex items-center justify-center text-amber-700">
              <Clock className="w-10 h-10 animate-spin" />
            </div>
          )}
        </div>

        {/* Status Title */}
        <h1 className="font-serif text-3xl sm:text-4xl font-medium text-cocoa mb-2">
          {isPaid
            ? "Thank You! Order Confirmed"
            : isPendingVerification
            ? "Payment Proof Received"
            : isFailed
            ? "Payment Not Completed"
            : "Verifying Your Payment..."}
        </h1>

        <p className="font-mono text-sm text-cocoa-muted mb-6">
          Order Reference: <strong className="text-cocoa font-bold">{orderReference}</strong>
        </p>

        {isPendingVerification ? (
          <div className="space-y-6 text-left bg-surface p-6 sm:p-8 rounded-xl border border-border shadow-sm mb-8">
            <div className="border-b border-border/80 pb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-800 flex items-center gap-1.5 mb-1">
                <Clock className="w-3.5 h-3.5" />
                <span>Verification In Progress</span>
              </span>
              <p className="text-sm text-cocoa-muted leading-relaxed">
                Thank you! We have received your UPI payment screenshot. Our artisan team will verify the payment against our UPI account and send your official order confirmation email shortly.
              </p>
            </div>

            <div className="rounded-lg bg-amber-50/60 p-4 border border-amber-200/80 space-y-2 text-xs text-cocoa">
              <p className="font-semibold text-amber-900">What happens next?</p>
              <ul className="space-y-1.5 text-cocoa-muted">
                <li>&bull; Artisan team verifies payment with bank / UPI UTR</li>
                <li>&bull; Official order confirmation sent to your email with receipt</li>
                <li>&bull; Handcrafted creation &amp; custom printing begins</li>
                <li>&bull; Safe courier dispatch with live tracking number</li>
              </ul>
            </div>

            <div className="pt-2 text-xs text-cocoa-muted flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-border/60">
              <span>Have a question about your custom card or payment?</span>
              <div className="flex items-center gap-3">
                {BRAND.contact.representatives[0] && (
                  <a
                    href={`https://wa.me/919311516813?text=Hi! Regarding my order ${orderReference}, I have submitted the payment screenshot.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-medium text-rose-deep hover:underline"
                  >
                    <Phone className="w-3 h-3" />
                    <span>WhatsApp {BRAND.contact.representatives[0].name}</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        ) : isPaid ? (
          <div className="space-y-6 text-left bg-surface p-6 sm:p-8 rounded-xl border border-border shadow-sm mb-8">
            <div className="border-b border-border/80 pb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5 mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Payment Verified & Confirmed</span>
              </span>
              <p className="text-sm text-cocoa-muted">
                Your handcrafted pieces and customized cards have been scheduled for artisan assembly and quality inspection.
              </p>
            </div>

            <div className="rounded-lg bg-sand/40 p-4 border border-cocoa/10 space-y-2 text-xs text-cocoa">
              <p className="font-semibold text-cocoa">What happens next?</p>
              <ul className="space-y-1.5 text-cocoa-muted">
                <li>&bull; Handcrafted creation & printing: 2–3 business days</li>
                <li>&bull; Safe courier dispatch with parcel tracking ID</li>
                <li>&bull; Delivered nestled in gift-ready presentation</li>
              </ul>
            </div>

            <div className="pt-2 text-xs text-cocoa-muted flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-border/60">
              <span>Have a question about your custom card?</span>
              <div className="flex items-center gap-3">
                {BRAND.contact.representatives[0] && (
                  <a
                    href={`tel:${BRAND.contact.representatives[0].phoneRaw}`}
                    className="inline-flex items-center gap-1 font-medium text-rose-deep hover:underline"
                  >
                    <Phone className="w-3 h-3" />
                    <span>Call {BRAND.contact.representatives[0].name}</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        ) : isFailed ? (
          <div className="bg-surface p-6 rounded-xl border border-border shadow-sm mb-8 space-y-4 text-left">
            <p className="text-sm text-error font-medium">
              {error || "The payment could not be completed or was cancelled."}
            </p>
            <p className="text-xs text-cocoa-muted leading-relaxed">
              Any temporary hold on your account or stock reservation will be safely released. You can try checking out again using UPI or Card.
            </p>
            <div className="pt-2">
              <Button asChild size="md" className="rounded-full shadow-md">
                <Link href="/checkout">Retry Payment</Link>
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-cocoa-muted mb-8">
            Please wait while we receive the final confirmation from the payment gateway...
          </p>
        )}

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Button asChild variant="primary" size="lg" className="rounded-full shadow-md">
            <Link href="/shop" className="gap-2">
              <ShoppingBag className="w-4 h-4" />
              <span>Explore More Creations</span>
            </Link>
          </Button>

          <Button asChild variant="outline" size="lg" className="rounded-full">
            <Link href="/" className="gap-2">
              <span>Back to Storefront</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </Container>
    </Section>
  );
}
