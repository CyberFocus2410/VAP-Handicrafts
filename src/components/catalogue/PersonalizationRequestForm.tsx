"use client";

import React, { useState } from "react";
import { Send, CheckCircle2, Heart, Sparkles, MessageCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function PersonalizationRequestForm() {
  const [cardType, setCardType] = useState("Relationship Licence Card");
  const [partnerNames, setPartnerNames] = useState("");
  const [anniversaryDate, setAnniversaryDate] = useState("");
  const [customMessage, setCustomMessage] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerEmail.trim()) {
      setErrorMsg("Please provide your name and email.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    const fullMessage = `[Custom Card Request: ${cardType}]\nCouple/Recipient: ${partnerNames || "N/A"}\nSpecial Date: ${anniversaryDate || "N/A"}\nDedication/Vows: ${customMessage || "N/A"}`;

    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: customerName.trim(),
          email: customerEmail.trim(),
          phone: customerPhone.trim() || undefined,
          occasion: `Custom ${cardType}`,
          message: fullMessage,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSuccess(true);
      } else {
        setErrorMsg(data.error || "Failed to submit request. Please try again.");
      }
    } catch {
      setErrorMsg("Network error. Please WhatsApp us directly.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-16 rounded-3xl border border-[#2D1A16]/10 bg-white/90 p-8 sm:p-10 shadow-sm backdrop-blur-md">
      <div className="max-w-2xl mx-auto text-center mb-8">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#A05A44]/10 text-[#A05A44] mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          Handmade With Heart • Custom Crafted
        </span>
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#2D1A16]">
          Request a Custom Card or Bulk Order
        </h2>
        <p className="text-xs sm:text-sm text-[#2D1A16]/70 mt-2 leading-relaxed">
          Need custom names, personalized anniversary dates, or custom quotes for your special milestone?
          Fill in your details below and our founders will connect with high-res proofs on WhatsApp.
        </p>
      </div>

      {success ? (
        <div className="max-w-lg mx-auto p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center">
          <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-3" />
          <h3 className="font-serif text-lg font-bold text-emerald-950 mb-1">
            Personalization Request Logged!
          </h3>
          <p className="text-xs text-emerald-800 leading-relaxed mb-4">
            Thank you, {customerName}! Your custom card details have been routed directly to Pulkit Garg &amp; Vivan Mittal.
            We will review your requested text and message you shortly with proofs.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/personalize/relationship-licence-card"
              className="px-4 py-2 rounded-xl bg-[#2D1A16] text-[#FAF5EF] text-xs font-semibold hover:bg-black transition shadow-sm"
            >
              Open Live 3D Card Builder &rarr;
            </Link>
            <a
              href="https://wa.me/919311516813"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition flex items-center gap-1.5"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              WhatsApp Founders
            </a>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="max-w-xl mx-auto space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-[#2D1A16] block mb-1">
              Select Card Template
            </label>
            <select
              value={cardType}
              onChange={(e) => setCardType(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-[#2D1A16]/20 bg-[#FAF5EF]/50 focus:outline-none focus:ring-1 focus:ring-[#A05A44]"
            >
              <option value="Relationship Licence Card">Relationship Licence Card (Couple Keepsake)</option>
              <option value="Polaroid Keepsake Photo Card">Polaroid Keepsake Photo Card (With Handwritten Note)</option>
              <option value="Love Letter & Shell Charm Card">Love Letter &amp; Shell Charm Keepsake Card</option>
              <option value="Custom Bulk Wedding / Event Cards">Custom Bulk Wedding / Event Cards</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-[#2D1A16] block mb-1">
                Couple / Recipient Names
              </label>
              <input
                type="text"
                value={partnerNames}
                onChange={(e) => setPartnerNames(e.target.value)}
                placeholder="e.g. Rohan & Ananya"
                className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-[#2D1A16]/20 bg-[#FAF5EF]/50 focus:outline-none focus:ring-1 focus:ring-[#A05A44]"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#2D1A16] block mb-1">
                Milestone / Anniversary Date
              </label>
              <input
                type="text"
                value={anniversaryDate}
                onChange={(e) => setAnniversaryDate(e.target.value)}
                placeholder="e.g. 14 February 2026"
                className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-[#2D1A16]/20 bg-[#FAF5EF]/50 focus:outline-none focus:ring-1 focus:ring-[#A05A44]"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#2D1A16] block mb-1">
              Custom Dedication / Message
            </label>
            <textarea
              rows={3}
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="Write your sweet message or vows to be printed on the card..."
              className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-[#2D1A16]/20 bg-[#FAF5EF]/50 focus:outline-none focus:ring-1 focus:ring-[#A05A44]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-[#2D1A16]/10">
            <div>
              <label className="text-xs font-semibold text-[#2D1A16] block mb-1">
                Your Full Name *
              </label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Priya Sharma"
                className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-[#2D1A16]/20 bg-white focus:outline-none focus:ring-1 focus:ring-[#A05A44]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#2D1A16] block mb-1">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="priya@example.com"
                className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-[#2D1A16]/20 bg-white focus:outline-none focus:ring-1 focus:ring-[#A05A44]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#2D1A16] block mb-1">
                WhatsApp Phone
              </label>
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-[#2D1A16]/20 bg-white focus:outline-none focus:ring-1 focus:ring-[#A05A44]"
              />
            </div>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={isSubmitting}
              className="w-full font-semibold shadow-sm text-xs sm:text-sm py-2.5"
            >
              <Send className="w-4 h-4 mr-1.5" />
              {isSubmitting ? "Sending to Workshop..." : "Submit Custom Card Request"}
            </Button>
          </div>

          <div className="text-center pt-2">
            <span className="text-[11px] text-[#2D1A16]/60">
              Want to customize live with photo upload right now?{" "}
              <Link
                href="/personalize/relationship-licence-card"
                className="text-[#A05A44] font-semibold hover:underline inline-flex items-center gap-0.5"
              >
                <span>Launch Interactive Card Builder</span>
                <span>&rarr;</span>
              </Link>
            </span>
          </div>
        </form>
      )}
    </div>
  );
}
