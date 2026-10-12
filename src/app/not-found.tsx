import Link from "next/link";
import Image from "next/image";
import { Compass, ArrowRight, Home, Search, Sparkles, ArrowUpRight } from "lucide-react";
import { Container } from "@/components/ui/container";
import { BRAND } from "@/config/brand";
import { generateAutoAlt } from "@/lib/images/auto-alt";

export const metadata = {
  title: "Page Not Found | VAP Handicrafts",
  description:
    "The page or keepsake you are looking for might have drifted away. Explore our handcrafted shell jewellery, personalized gifts, and custom cards.",
};

export default function NotFound() {
  const quickLinks = [
    {
      title: "Shell Jewellery",
      desc: "Cowrie necklaces, charm bracelets & earrings",
      href: "/shop/shell-jewellery",
      icon: "🐚",
    },
    {
      title: "Polaroid Keepsakes",
      desc: "Live customizable magnetic memory frames",
      href: "/shop/polaroid-keepsakes",
      icon: "📸",
    },
    {
      title: "Personalized Cards",
      desc: "Heartfelt custom cards & relationship licenses",
      href: "/shop/personalized-cards",
      icon: "💌",
    },
    {
      title: "Track an Order",
      desc: "Check live courier dispatch & fulfillment status",
      href: "/order-status",
      icon: "📦",
    },
  ];

  return (
    <div className="relative min-h-[85vh] flex items-center justify-center py-16 px-4 overflow-hidden bg-[#FAF5EF]">
      {/* Ambient background glows */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-[#A05A44]/15 via-[#D4AF37]/10 to-transparent rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-10 right-10 w-80 h-80 bg-[#A05A44]/10 rounded-full blur-2xl pointer-events-none"
        aria-hidden="true"
      />

      <Container className="relative z-10 max-w-3xl">
        <div className="bg-white/80 backdrop-blur-md border border-[#2D1A16]/10 rounded-3xl p-8 sm:p-12 shadow-xl shadow-[#2D1A16]/5 text-center">
          {/* Brand Logo & Top Badge */}
          <div className="flex flex-col items-center justify-center mb-6">
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden shadow-md border border-[#A05A44]/25 bg-[#F9F5EA] mb-4">
              <Image
                src={BRAND.logo.src}
                alt={generateAutoAlt({ context: "hero", name: `${BRAND.name} official logo` })}
                fill
                className="object-contain"
                priority
              />
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FAF5EF] border border-[#A05A44]/25 text-[#A05A44] text-xs font-semibold uppercase tracking-widest shadow-2xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>404 Fallback • Page Not Found</span>
            </div>
          </div>

          {/* Artistic 404 Headline */}
          <div className="relative mb-6">
            <span className="block font-serif text-7xl sm:text-9xl font-bold text-[#2D1A16]/10 select-none tracking-tight leading-none">
              404
            </span>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-[#2D1A16] to-[#A05A44] flex items-center justify-center text-[#FAF5EF] shadow-lg shadow-[#A05A44]/30 transform -rotate-3 hover:rotate-0 transition-transform duration-300">
                <Compass className="w-8 h-8 sm:w-10 sm:h-10 stroke-[1.5] animate-pulse" />
              </div>
            </div>
          </div>

          {/* Copy */}
          <h1 className="font-serif text-2xl sm:text-4xl font-bold text-[#2D1A16] mb-3">
            This Treasure Seems to Have Drifted Away
          </h1>
          <p className="text-sm sm:text-base text-[#2D1A16]/75 max-w-lg mx-auto leading-relaxed mb-8">
            The page or keepsake you are looking for might have been moved, renamed, or is taking a short rest in our artisan workshop.
          </p>

          {/* Primary Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-10">
            <Link
              href="/shop"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-gradient-to-r from-[#A05A44] to-[#8C4A36] text-white text-sm font-semibold hover:brightness-110 transition-all shadow-md shadow-[#A05A44]/25 hover:scale-[1.02] active:scale-[0.98]"
            >
              Explore Full Collection
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/search"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-white border border-[#2D1A16]/15 text-[#2D1A16] text-sm font-medium hover:bg-[#FAF5EF] hover:border-[#A05A44]/40 transition-colors shadow-2xs"
            >
              <Search className="w-4 h-4 text-[#A05A44]" />
              Search Store
            </Link>

            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full border border-transparent text-[#2D1A16]/80 text-sm font-medium hover:text-[#2D1A16] hover:bg-[#FAF5EF] transition-colors"
            >
              <Home className="w-4 h-4 text-[#2D1A16]/60" />
              Return Home
            </Link>
          </div>

          {/* Quick Categories Navigation */}
          <div className="border-t border-[#2D1A16]/10 pt-8 mb-8 text-left">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-[#2D1A16]/60">
                Popular Categories & Shortcuts
              </h2>
              <span className="text-[11px] text-[#A05A44] font-medium">Quick Discovery</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {quickLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group flex items-start gap-3.5 p-3.5 rounded-2xl bg-[#FAF5EF]/70 hover:bg-[#FAF5EF] border border-[#2D1A16]/5 hover:border-[#A05A44]/30 transition-all shadow-2xs"
                >
                  <span className="text-2xl select-none" role="img" aria-label={item.title}>
                    {item.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-[#2D1A16] group-hover:text-[#A05A44] transition-colors">
                        {item.title}
                      </span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-[#2D1A16]/40 group-hover:text-[#A05A44] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </div>
                    <p className="text-xs text-[#2D1A16]/60 truncate mt-0.5">{item.desc}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Help & Contact */}
          <div className="pt-6 border-t border-[#2D1A16]/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#2D1A16]/70">
            <div className="flex items-center gap-2">
              <span>Need bespoke assistance?</span>
              <Link href="/contact" className="font-semibold text-[#A05A44] hover:underline">
                Contact our artisan desk
              </Link>
            </div>

            <p className="text-[11px] text-[#2D1A16]/50">
              VAP Handicrafts Artisan Studio
            </p>
          </div>
        </div>
      </Container>
    </div>
  );
}
