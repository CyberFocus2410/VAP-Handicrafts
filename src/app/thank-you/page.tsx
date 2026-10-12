import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { CheckCircle2, MessageCircle, ArrowRight, Heart, Sparkles, Clock, Phone } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Heading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { BRAND } from "@/config/brand";
import { generateAutoAlt } from "@/lib/images/auto-alt";

export const metadata: Metadata = {
  title: "Thank You | VAP Handicrafts",
  description: "Thank you for reaching out to VAP Handicrafts. We have received your inquiry and will connect with you shortly.",
  robots: {
    index: false,
    follow: false,
  },
};

interface ThankYouPageProps {
  searchParams: Promise<{ name?: string; id?: string }>;
}

export default async function ThankYouPage({ searchParams }: ThankYouPageProps) {
  const { name, id } = await searchParams;
  const customerName = name?.trim() || "";
  const inquiryRef = id?.trim() || "";

  return (
    <Section surface="default" className="py-12 md:py-20">
      <Container className="max-w-3xl">
        <Breadcrumbs items={[{ label: "Thank You", href: "/thank-you" }]} className="mb-8" />

        <div className="rounded-3xl border border-border bg-surface p-8 sm:p-12 shadow-sm text-center relative overflow-hidden">
          {/* Subtle decorative background tint */}
          <div
            className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-blush/30 blur-2xl pointer-events-none"
            aria-hidden="true"
          />
          <div
            className="absolute -bottom-24 -left-24 w-48 h-48 rounded-full bg-gold-deep/10 blur-2xl pointer-events-none"
            aria-hidden="true"
          />

          {/* Brand Logo & Success Icon */}
          <div className="relative mx-auto mb-6 flex items-center justify-center">
            <div className="relative w-20 h-20 rounded-2xl overflow-hidden shadow-md border border-gold-deep/20 bg-ivory">
              <Image
                src={BRAND.logo.src}
                alt={generateAutoAlt({ context: "hero", name: `${BRAND.name} official emblem` })}
                fill
                className="object-contain"
                priority
              />
            </div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md">
              <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium mb-3">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Message Received Successfully</span>
          </div>

          <Heading level="h1" className="text-3xl sm:text-4xl mb-3">
            {customerName ? `Thank You, ${customerName}!` : "Thank You For Reaching Out!"}
          </Heading>

          <p className="text-base text-cocoa-muted max-w-xl mx-auto leading-relaxed mb-6">
            We have received your details{inquiryRef ? ` (Reference: ${inquiryRef})` : ""}. At {BRAND.name}, every gift and inquiry is handled personally by our founders to make sure your requirements receive meticulous artisan care.
          </p>

          {/* Timeline & Founders Info Card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto mb-8 text-left">
            <div className="p-4 rounded-2xl bg-bg border border-border/80 flex items-start gap-3">
              <Clock className="w-5 h-5 text-rose-deep shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-cocoa">Expected Response Time</p>
                <p className="text-xs text-cocoa-muted mt-0.5">
                  Within 2 to 4 hours on WhatsApp or Email during workshop hours (10 AM – 8 PM IST).
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-bg border border-border/80 flex items-start gap-3">
              <Heart className="w-5 h-5 text-rose-deep shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-cocoa">Founder Direct Support</p>
                <p className="text-xs text-cocoa-muted mt-0.5">
                  Pulkit Garg & Vivan Mittal review every bespoke customization idea personally.
                </p>
              </div>
            </div>
          </div>

          {/* Urgent WhatsApp Quick Connect */}
          <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 max-w-xl mx-auto mb-8 text-center">
            <p className="text-xs font-medium text-emerald-950 mb-3">
              Need urgent delivery or instant assistance with a custom card photo?
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <a
                href="https://wa.me/919311516813?text=Hi%20Pulkit,%20I%20just%20submitted%20an%20inquiry%20on%20VAP%20Handicrafts!"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold shadow-xs hover:bg-emerald-700 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Chat with Pulkit (+91 9311516813)</span>
              </a>
              <a
                href="https://wa.me/919310039258?text=Hi%20Vivan,%20I%20just%20submitted%20an%20inquiry%20on%20VAP%20Handicrafts!"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold shadow-xs hover:bg-emerald-700 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Chat with Vivan (+91 9310039258)</span>
              </a>
            </div>
          </div>

          {/* Next Steps CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button asChild variant="primary" size="lg" className="w-full sm:w-auto">
              <Link href="/shop">
                Explore Handcrafted Jewellery <ArrowRight className="w-4 h-4 ml-1.5" />
              </Link>
            </Button>
            <Button asChild variant="secondary" size="lg" className="w-full sm:w-auto">
              <Link href="/">Back to Home</Link>
            </Button>
          </div>
        </div>
      </Container>
    </Section>
  );
}
