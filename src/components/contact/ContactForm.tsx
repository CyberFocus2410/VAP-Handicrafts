"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Send, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ContactForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [occasion, setOccasion] = useState("");
  const [message, setMessage] = useState("");
  const [honeypot, setHoneypot] = useState(""); // Anti-spam trap
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      setErrorMsg("Please fill in your name, email, and message.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim() || undefined,
          occasion: occasion.trim() || undefined,
          message: message.trim(),
          website: honeypot, // Spam honeypot
        }),
      });

      const data = await res.json();
      if (data.success) {
        const submittedName = name.trim();
        const inquiryId = data.inquiryId || "";
        setName("");
        setEmail("");
        setPhone("");
        setOccasion("");
        setMessage("");

        // Smooth redirect to dedicated Thank You confirmation page
        router.push(
          `/thank-you?name=${encodeURIComponent(submittedName)}${inquiryId ? `&id=${encodeURIComponent(inquiryId)}` : ""}`
        );
      } else {
        setErrorMsg(data.error || "Failed to submit inquiry. Please try again.");
      }
    } catch {
      setErrorMsg("Network error. Please try reaching out directly on WhatsApp.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" aria-label="Contact inquiry form">
      {successMsg ? (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold">Message Received!</div>
            <p className="mt-1 text-xs text-emerald-800 leading-relaxed">{successMsg}</p>
          </div>
        </div>
      ) : null}

      {errorMsg ? (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      ) : null}

      {/* Anti-spam honeypot (invisible to humans, traps automated spam bots) */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="contact-website">Website URL (leave blank)</label>
        <input
          id="contact-website"
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="contact-name" className="text-xs font-semibold text-cocoa block mb-1">
          Your Full Name <span className="text-rose-600">*</span>
        </label>
        <input
          id="contact-name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Priya Sharma"
          className="flex w-full rounded-xl border border-border bg-white px-3.5 py-2 text-sm text-cocoa transition-colors placeholder:text-cocoa-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A05A44]"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label htmlFor="contact-email" className="text-xs font-semibold text-cocoa block mb-1">
            Email Address <span className="text-rose-600">*</span>
          </label>
          <input
            id="contact-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="priya@example.com"
            className="flex w-full rounded-xl border border-border bg-white px-3.5 py-2 text-sm text-cocoa transition-colors placeholder:text-cocoa-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A05A44]"
          />
        </div>

        <div>
          <label htmlFor="contact-phone" className="text-xs font-semibold text-cocoa block mb-1">
            Phone / WhatsApp Number
          </label>
          <input
            id="contact-phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+91 98765 43210"
            className="flex w-full rounded-xl border border-border bg-white px-3.5 py-2 text-sm text-cocoa transition-colors placeholder:text-cocoa-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A05A44]"
          />
        </div>
      </div>

      <div>
        <label htmlFor="contact-occasion" className="text-xs font-semibold text-cocoa block mb-1">
          Occasion / Custom Requirement
        </label>
        <input
          id="contact-occasion"
          type="text"
          value={occasion}
          onChange={(e) => setOccasion(e.target.value)}
          placeholder="e.g. Wedding favours, Anniversary gift, Bulk card order"
          className="flex w-full rounded-xl border border-border bg-white px-3.5 py-2 text-sm text-cocoa transition-colors placeholder:text-cocoa-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A05A44]"
        />
      </div>

      <div>
        <label htmlFor="contact-message" className="text-xs font-semibold text-cocoa block mb-1">
          Your Message <span className="text-rose-600">*</span>
        </label>
        <textarea
          id="contact-message"
          rows={4}
          required
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Tell us about the pieces you love, customization requirements, or deadline..."
          className="flex w-full rounded-xl border border-border bg-white px-3.5 py-2 text-sm text-cocoa transition-colors placeholder:text-cocoa-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A05A44]"
        />
      </div>

      <Button
        type="submit"
        variant="primary"
        size="md"
        disabled={isSubmitting}
        className="w-full mt-2 font-semibold shadow-sm"
      >
        <Send className="w-4 h-4 mr-1.5" aria-hidden="true" />
        {isSubmitting ? "Sending to Founders..." : "Send Message to Founders"}
      </Button>
    </form>
  );
}
