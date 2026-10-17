"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Sparkles, Gift, ArrowRight, ChevronUp, ChevronDown, CheckCircle2 } from "lucide-react";
import { useCartStore } from "@/lib/cart/cart-store";
import { type ValidatedCartResponse } from "@/lib/cart/types";
import { formatINR } from "@/lib/money";
import { Button } from "@/components/ui/button";

export function FreebieUnlockSlidingBar() {
  const items = useCartStore((s) => s.items);
  const hasHydrated = useCartStore((s) => s.hasHydrated);
  const openDrawer = useCartStore((s) => s.openDrawer);

  const [validatedCart, setValidatedCart] = useState<ValidatedCartResponse | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch cart validation & freebie scheme whenever items change
  useEffect(() => {
    if (!hasHydrated) return;

    let isCancelled = false;
    setLoading(true);

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
      .catch((err) => {
        console.warn("[FreebieBar] Validation error:", err);
      })
      .finally(() => {
        if (!isCancelled) setLoading(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [items, hasHydrated]);

  // If no active freebie scheme or not hydrated, don't show bar
  const freebie = validatedCart?.freebie;
  if (!hasHydrated || !freebie) {
    return null;
  }

  const {
    isUnlocked,
    amountNeededMinor,
    percentage,
    freebieWorthMinor,
    minOrderMinor,
    currentSubtotalMinor,
    freebieName,
    freebieImageUrl,
    remainingSpots,
  } = freebie;

  const worthRupees = Math.round(freebieWorthMinor / 100);
  const neededRupees = Math.round(amountNeededMinor / 100);
  const minOrderRupees = Math.round(minOrderMinor / 100);

  return (
    <aside
      aria-label="Free gift promotion progress"
      className={`fixed bottom-0 left-0 right-0 z-40 transition-transform duration-300 ease-in-out ${
        isMinimized ? "translate-y-[calc(100%-2.25rem)]" : "translate-y-0"
      }`}
    >
      {/* Minimized Pill Toggle Bar */}
      <div className="flex justify-center -mb-px">
        <button
          type="button"
          onClick={() => setIsMinimized((prev) => !prev)}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#78362B] text-white font-bold text-xs rounded-t-lg shadow-lg border-t border-x border-[#5E251B] hover:bg-[#662C22] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#78362B]"
          aria-expanded={!isMinimized}
        >
          <Gift className="w-3.5 h-3.5 text-amber-300 animate-bounce" />
          <span>
            {isUnlocked
              ? "🎉 FREE GIFT UNLOCKED (₹0)"
              : `🎁 Add ₹${neededRupees} for FREE GIFT (Worth ₹${worthRupees})`}
          </span>
          {isMinimized ? <ChevronUp className="w-3.5 h-3.5 text-amber-300" /> : <ChevronDown className="w-3.5 h-3.5 text-amber-300" />}
        </button>
      </div>

      {/* Main Sliding Bar Container */}
      <div className="bg-white/98 backdrop-blur-md border-t-2 border-[#78362B]/30 shadow-[0_-8px_30px_rgba(0,0,0,0.12)] px-4 py-3 sm:py-3.5 text-cocoa">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">
          {/* Left Info with Thumbnail */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-lg overflow-hidden border-2 border-amber-600/50 bg-[#EAE0D5] shrink-0 shadow-xs">
              <Image
                src={freebieImageUrl || "/images/products/shell-cone-pink-crackle-bracelet.webp"}
                alt={freebieName}
                fill
                className="object-cover"
              />
              {isUnlocked && (
                <div className="absolute inset-0 bg-emerald-600/40 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-white drop-shadow-md" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-100 text-amber-950 border border-amber-300 shadow-xs">
                  <Sparkles className="w-2.5 h-2.5 text-amber-700" />
                  {isUnlocked ? "Unlocked at ₹0" : `Worth ₹${worthRupees} FREE`}
                </span>
                <span className="text-[11px] text-cocoa font-bold bg-beige/60 px-2 py-0.5 rounded-full border border-border">
                  {remainingSpots > 0 ? `🔥 Only ${remainingSpots} spots left` : "Special Offer"}
                </span>
              </div>

              <p className="text-xs sm:text-sm font-bold text-cocoa truncate mt-0.5">
                {isUnlocked ? (
                  <span className="text-emerald-800 font-extrabold flex items-center gap-1.5">
                    <span>🎉 Freebie auto-added to your bag!</span>
                    <span className="line-through text-cocoa-muted text-xs font-normal">
                      ₹{worthRupees}
                    </span>
                    <span className="text-emerald-800 font-extrabold text-xs">₹0</span>
                  </span>
                ) : (
                  <span>
                    Add <strong className="text-rose-deep font-black text-sm">₹{neededRupees}</strong> more to get{" "}
                    <span className="underline decoration-amber-600/60 font-extrabold">{freebieName}</span> for FREE!
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Center Sliding Progress Bar */}
          <div className="w-full md:flex-1 max-w-md space-y-1">
            <div className="flex justify-between items-center text-[11px] font-bold text-cocoa">
              <span>Cart: {formatINR(currentSubtotalMinor)}</span>
              <span className="font-extrabold text-amber-900 bg-amber-50 px-2 py-0.2 rounded border border-amber-200">
                {percentage}% towards Freebie
              </span>
              <span>Target: ₹{minOrderRupees}</span>
            </div>

            <div
              className="relative w-full bg-[#EADECE] rounded-full h-3 overflow-hidden border border-border/80 shadow-inner"
              role="progressbar"
              aria-valuenow={percentage}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Progress towards unlocking free gift"
            >
              <div
                className={`h-full rounded-full transition-all duration-700 ease-out ${
                  isUnlocked
                    ? "bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 animate-pulse"
                    : "bg-gradient-to-r from-amber-500 via-[#96483E] to-rose-deep"
                }`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>

          {/* Right Action Button */}
          <div className="w-full md:w-auto flex items-center justify-end gap-2 shrink-0">
            {isUnlocked ? (
              <Button
                onClick={openDrawer}
                size="sm"
                className="w-full md:w-auto rounded-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-4 py-2 text-xs shadow-md gap-1.5"
              >
                <span>View Bag &amp; Freebie</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            ) : currentSubtotalMinor > 0 ? (
              <Button
                onClick={openDrawer}
                variant="outline"
                size="sm"
                className="w-full md:w-auto rounded-full border-2 border-cocoa/30 hover:bg-beige/40 text-cocoa font-bold px-4 py-2 text-xs gap-1.5 shadow-xs"
              >
                <span>Check Bag</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            ) : (
              <Button
                asChild
                size="sm"
                className="w-full md:w-auto rounded-full bg-rose-deep hover:bg-rose-deeper text-white font-bold px-4 py-2 text-xs shadow-md gap-1.5"
              >
                <Link href="/shop">
                  <span>Explore Shop</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
