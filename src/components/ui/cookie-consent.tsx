"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Cookie, ShieldCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const CONSENT_STORAGE_KEY = "vap_cookie_consent_v1";

export function CookieConsentBanner() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem(CONSENT_STORAGE_KEY);
      if (!consent) {
        // Small delay so it appears smoothly after page load
        const timer = setTimeout(() => setIsOpen(true), 1200);
        return () => clearTimeout(timer);
      }
    } catch {
      // Ignore localStorage errors (e.g. private mode)
    }
  }, []);

  const handleConsent = (choice: "all" | "essential") => {
    try {
      localStorage.setItem(
        CONSENT_STORAGE_KEY,
        JSON.stringify({
          choice,
          timestamp: new Date().toISOString(),
        })
      );
    } catch {
      // Ignore
    }
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div
      role="region"
      aria-label="Cookie consent banner"
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 z-50 max-w-md w-full animate-in fade-in slide-in-from-bottom-5 duration-300"
    >
      <div className="rounded-2xl border border-[#2D1A16]/15 bg-[#FFFDF9]/95 backdrop-blur-md p-5 sm:p-6 shadow-2xl shadow-[#2D1A16]/10 text-cocoa">
        <div className="flex items-start gap-3.5 mb-3">
          <div className="w-9 h-9 rounded-full bg-[#FAF5EF] border border-[#A05A44]/25 flex items-center justify-center shrink-0 text-[#A05A44]">
            <Cookie className="w-5 h-5" aria-hidden="true" />
          </div>
          <div className="flex-1 pr-4">
            <h3 className="font-serif text-base font-semibold text-[#2D1A16] leading-tight">
              Privacy &amp; Cookie Choices
            </h3>
            <p className="text-xs text-cocoa-muted mt-1 leading-relaxed">
              We use essential cookies to maintain your shopping bag and secure payments, and anonymous analytics to polish your experience.
            </p>
          </div>
          <button
            onClick={() => handleConsent("essential")}
            aria-label="Dismiss cookie notice"
            className="text-cocoa-muted hover:text-cocoa transition-colors p-1 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2 pt-2 border-t border-border/60">
          <Link
            href="/privacy"
            className="text-[11px] text-[#A05A44] font-medium hover:underline mr-auto"
          >
            Read Privacy Policy
          </Link>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleConsent("essential")}
            className="text-xs py-1.5 px-3 h-auto"
          >
            Essential Only
          </Button>

          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => handleConsent("all")}
            className="text-xs py-1.5 px-4 h-auto shadow-xs"
          >
            Accept All
          </Button>
        </div>
      </div>
    </div>
  );
}
