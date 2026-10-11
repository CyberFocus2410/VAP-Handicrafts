import * as React from "react";
import Link from "next/link";
import { Sparkles, Calendar, Camera, FileHeart } from "lucide-react";
import { Button } from "@/components/ui/button";

const FEATURES = [
  {
    icon: Camera,
    title: "Polaroid Photo Prints",
    description: "Upload high-res photos to print in classic glossy white frames.",
  },
  {
    icon: Calendar,
    title: "Custom Anniversary Dates",
    description: "Engrave or print memorable dates, milestones, and roman numerals.",
  },
  {
    icon: FileHeart,
    title: "Handwritten Message Cards",
    description: "Include a heartfelt personal message printed on warm linen stationery.",
  },
];

export function PersonalizedGiftFeature() {
  return (
    <section
      aria-labelledby="personalized-heading"
      className="border-y border-border/60 bg-gradient-to-br from-bg via-surface to-blush/20 py-16 md:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-lg border border-border/80 bg-surface/90 p-8 shadow-card md:p-12 lg:p-16">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 rounded-full border border-rose-deep/20 bg-blush/20 px-3.5 py-1 text-xs font-semibold uppercase tracking-widest text-rose-deep">
                <Sparkles className="h-3.5 w-3.5 text-rose-deep" aria-hidden="true" />
                <span>Personalized Cards & Gifts</span>
              </div>

              <h2
                id="personalized-heading"
                className="mt-4 font-serif text-h2 font-medium leading-tight text-cocoa"
              >
                Create a gift as unique as <br className="hidden sm:inline" />
                <span className="italic text-rose-deep">your favourite memory.</span>
              </h2>

              <p className="mt-4 max-w-xl text-body text-cocoa-muted">
                From couple relationship licences and custom Polaroid cards to heartfelt
                personal dedication notes, make every gift feel deeply personal and impossible
                to forget.
              </p>

              <div className="mt-8">
                <Button asChild size="lg" className="shadow-soft">
                  <Link href="/shop/personalized-cards">
                    Explore Personalized Cards
                  </Link>
                </Button>
              </div>
            </div>

            <div className="space-y-4 lg:col-span-5">
              {FEATURES.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    className="flex items-start gap-4 rounded-md border border-border/60 bg-bg/50 p-4 transition-colors hover:border-rose-deep/30 hover:bg-bg"
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
        </div>
      </div>
    </section>
  );
}
