import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SiteBrandStoryContent } from "@/server/admin/crm-cms-types";

interface BrandStoryProps {
  brandStory?: SiteBrandStoryContent;
}

export function BrandStory({ brandStory }: BrandStoryProps) {
  const eyebrow = brandStory?.eyebrow || "Our Story";
  const heading =
    brandStory?.heading ||
    "Born from the rhythm of the tides and the joy of gifting.";
  const p1 =
    brandStory?.narrativeParagraph1 ||
    "At VAP Handicrafts, every piece begins with natural treasures gathered and polished to reveal their organic glow. We believe jewellery and gifts should carry emotional warmth—not mass-produced repetition.";
  const p2 =
    brandStory?.narrativeParagraph2 ||
    "From alternating spiral conch shells threaded with pink crackle glass to scallop shells paired with cowrie drop earrings, our designs unite coastal elegance with modern artisanal styling.";
  const badgeTitle = brandStory?.badgeTitle || "Curated by Hand";
  const badgeSubtitle = brandStory?.badgeSubtitle || "Natural sea shells · India";
  return (
    <section
      aria-labelledby="brand-story-heading"
      className="py-16 md:py-24 lg:py-32"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Visual Showcase (Left) */}
          <div className="relative order-2 lg:order-1 lg:col-span-5">
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-md border border-border bg-surface p-3 shadow-card">
              <div className="relative h-full w-full overflow-hidden rounded-sm bg-beige/30">
                <Image
                  src="/images/products/scallop-cowrie-earring-bracelet-set.webp"
                  alt="Artisan jewellery set with scallop shells, cowries, and pink crackle beads"
                  fill
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover object-center"
                />
              </div>
            </div>

            {/* Floating Editorial Badge */}
            <div className="absolute -bottom-4 -right-4 rounded-sm border border-border bg-surface px-4 py-3 shadow-card sm:-bottom-6 sm:-right-6">
              <p className="font-serif text-sm font-semibold text-cocoa">
                {badgeTitle}
              </p>
              <p className="text-[11px] text-cocoa-muted">{badgeSubtitle}</p>
            </div>
          </div>

          {/* Narrative Content (Right) */}
          <div className="order-1 lg:order-2 lg:col-span-7">
            <div className="flex items-center gap-2">
              <p className="text-xs font-semibold uppercase tracking-widest text-rose-deep">
                {eyebrow}
              </p>
            </div>

            <h2
              id="brand-story-heading"
              className="mt-3 font-serif text-h2 font-medium leading-tight text-cocoa"
            >
              {heading}
            </h2>

            <div className="mt-6 space-y-4 text-body text-cocoa-muted">
              <p>{p1}</p>
              <p>{p2}</p>
            </div>

            <div className="mt-8 flex items-center gap-4">
              <Button asChild variant="secondary">
                <Link href="/about">Read Our Story</Link>
              </Button>
              <Button asChild variant="ghost" className="text-rose-deep hover:bg-blush/20">
                <Link href="/contact">Get in Touch</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
