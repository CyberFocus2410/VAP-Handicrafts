"use client";

import * as React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ShieldCheck, CheckCircle2, XCircle, ArrowLeft, Smartphone, CreditCard } from "lucide-react";
import { formatINR } from "@/lib/money";
import { Button } from "@/components/ui/button";

function PaymentSimulatorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderRef = searchParams.get("orderRef") || "VAP-DEMO-001";
  const amountMinorStr = searchParams.get("amountMinor") || "0";
  const amountMinor = parseInt(amountMinorStr, 10);
  const token = searchParams.get("token") || "SIM_DEMO";

  const [isProcessing, setIsProcessing] = React.useState(false);
  const [selectedMethod, setSelectedMethod] = React.useState<"upi" | "card">("upi");

  const handleSimulatePayment = async (status: "success" | "failed") => {
    setIsProcessing(true);

    try {
      const res = await fetch("/api/paytm/callback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderRef,
          amountMinor: amountMinor.toString(),
          status,
          txnId: `SIM_${Date.now()}`,
          token,
        }),
      });

      const data = await res.json().catch(() => null);
      if (data?.redirectUrl) {
        router.push(data.redirectUrl);
      } else {
        router.push(`/order/${orderRef}?status=${status === "success" ? "paid" : "failed"}`);
      }
    } catch {
      router.push(`/order/${orderRef}?status=failed`);
    }
  };

  return (
    <div className="min-h-screen bg-sand/30 py-12 px-4 sm:px-6 flex items-center justify-center">
      <div className="max-w-md w-full bg-surface rounded-xl border border-border shadow-lg p-6 sm:p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Development Payment Simulator</span>
          </div>
          <h1 className="font-serif text-2xl font-medium text-cocoa">
            Simulate Paytm / UPI Gateway
          </h1>
          <p className="text-xs text-cocoa-muted">
            This simulator tests the checkout state machine without live merchant credentials.
          </p>
        </div>

        {/* Order Summary Pill */}
        <div className="rounded-lg bg-sand/50 p-4 border border-cocoa/10 space-y-2 text-xs">
          <div className="flex justify-between items-center text-cocoa-muted">
            <span>Order Reference</span>
            <span className="font-mono font-bold text-cocoa">{orderRef}</span>
          </div>
          <div className="flex justify-between items-center text-cocoa-muted">
            <span>Simulated Amount</span>
            <span className="text-base font-bold text-rose-deep font-sans">
              {formatINR(amountMinor)}
            </span>
          </div>
        </div>

        {/* Simulated Payment Methods */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-cocoa">Choose Simulated Method:</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setSelectedMethod("upi")}
              className={`p-3 rounded-lg border text-left flex items-center gap-2.5 transition-all ${
                selectedMethod === "upi"
                  ? "border-rose-deep bg-blush/20 ring-1 ring-rose-deep text-rose-deep"
                  : "border-border text-cocoa hover:bg-sand/30"
              }`}
            >
              <Smartphone className="w-4 h-4 shrink-0" />
              <span className="text-xs font-medium">UPI / QR</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedMethod("card")}
              className={`p-3 rounded-lg border text-left flex items-center gap-2.5 transition-all ${
                selectedMethod === "card"
                  ? "border-rose-deep bg-blush/20 ring-1 ring-rose-deep text-rose-deep"
                  : "border-border text-cocoa hover:bg-sand/30"
              }`}
            >
              <CreditCard className="w-4 h-4 shrink-0" />
              <span className="text-xs font-medium">Cards / NetBank</span>
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-2">
          <Button
            type="button"
            size="lg"
            disabled={isProcessing}
            onClick={() => handleSimulatePayment("success")}
            className="w-full justify-center gap-2 py-6 text-sm font-semibold rounded-full bg-emerald-700 hover:bg-emerald-800 text-white shadow-md"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Simulate Successful Payment ({formatINR(amountMinor)})</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="lg"
            disabled={isProcessing}
            onClick={() => handleSimulatePayment("failed")}
            className="w-full justify-center gap-2 py-5 text-xs text-error border-error/30 hover:bg-rose-50 rounded-full"
          >
            <XCircle className="w-4 h-4" />
            <span>Simulate Payment Failure / Cancellation</span>
          </Button>
        </div>

        <div className="text-center pt-2">
          <button
            type="button"
            onClick={() => router.push("/checkout")}
            className="inline-flex items-center gap-1.5 text-xs text-cocoa-muted hover:text-cocoa transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Checkout</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSimulatorPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-sand/30 py-12 px-4 flex items-center justify-center">
          <p className="text-xs text-cocoa-muted">Loading payment simulator...</p>
        </div>
      }
    >
      <PaymentSimulatorContent />
    </React.Suspense>
  );
}
