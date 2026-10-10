import * as React from "react";
import { Sparkles, Gift, Truck, MessageCircleHeart } from "lucide-react";

const HIGHLIGHTS = [
  {
    icon: Sparkles,
    title: "Natural Ocean Shells",
    description: "Authentic conch, scallop, and cowrie shells paired with glass beads.",
  },
  {
    icon: Gift,
    title: "Gift-Ready Presentation",
    description: "Every item arrives nestled in thoughtful keepsake packaging.",
  },
  {
    icon: Truck,
    title: "Pan-India Courier",
    description: "Delivered safely across all Indian pin codes with parcel tracking.",
  },
  {
    icon: MessageCircleHeart,
    title: "Artisan Direct Care",
    description: "Direct assistance via WhatsApp and email for custom requests.",
  },
];

export function TrustHighlights() {
  return (
    <section
      aria-label="Trust and Service Highlights"
      className="border-y border-border/60 bg-surface/80 py-10"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {HIGHLIGHTS.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="flex items-start gap-3.5 rounded-sm p-2 transition-colors hover:bg-bg/40"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blush/30 text-rose-deep">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-cocoa">{item.title}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-cocoa-muted">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
