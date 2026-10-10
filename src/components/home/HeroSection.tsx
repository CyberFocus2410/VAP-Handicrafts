"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeroSceneWrapper } from "@/components/home/HeroSceneWrapper";
import { PolaroidFrame } from "@/components/ui/polaroid-frame";

export function HeroSection() {
  return (
    <section
      aria-labelledby="hero-heading"
      className="relative overflow-hidden bg-gradient-to-b from-bg via-surface to-bg py-12 md:py-20 lg:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-8">
          {/* Editorial Headline Column (Left) */}
          <div className="z-10 lg:col-span-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-rose-deep/20 bg-blush/20 px-3.5 py-1 text-xs font-semibold uppercase tracking-widest text-rose-deep">
              <Sparkles className="h-3.5 w-3.5 text-rose-deep" aria-hidden="true" />
              <span>Gifts That Feel Like You</span>
            </div>

            <h1
              id="hero-heading"
              className="mt-5 font-serif text-display font-medium leading-[1.05] tracking-tight text-cocoa"
            >
              Little treasures, <br />
              <span className="italic text-rose-deep">made to be loved.</span>
            </h1>

            <p className="mt-6 max-w-xl text-body-lg text-cocoa-muted">
              Handcrafted shell jewellery and thoughtful keepsakes for your favourite
              people. Natural ocean shells, delicate pastel beads, and keepsake gift boxes
              curated in India.
            </p>

            {/* CTA Group: Real <a> links that work instantly before or without JS/animations */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Button asChild size="lg" className="gap-2 shadow-soft">
                <Link href="/shop" data-testid="hero-primary-cta">
                  <span>Explore the Collection</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>

              <Button asChild variant="secondary" size="lg">
                <Link href="/shop/personalized-gifts">Bespoke Keepsakes</Link>
              </Button>
            </div>

            {/* Supporting Micro-Trust Note */}
            <div className="mt-10 flex items-center gap-6 border-t border-border/60 pt-6 text-xs text-cocoa-muted">
              <div>
                <span className="font-semibold text-cocoa">100% Real Sea Shells</span>
                <p className="text-[11px]">Ethically sourced & polished</p>
              </div>
              <div className="h-6 w-px bg-border/80" aria-hidden="true" />
              <div>
                <span className="font-semibold text-cocoa">Pan-India Delivery</span>
                <p className="text-[11px]">Tracked insured courier</p>
              </div>
            </div>
          </div>

          {/* Interactive 3D & Polaroid Visual Composition (Right) */}
          <div className="relative flex items-center justify-center lg:col-span-5">
            {/* Subtle Warm Background Glow */}
            <div
              className="absolute -inset-4 rounded-full bg-blush/30 blur-3xl"
              aria-hidden="true"
            />

            {/* 3D Scene Container (with static poster fallback for SSR/Reduced Motion/No-WebGL) */}
            <div className="relative z-10 w-full max-w-[460px]">
              <HeroSceneWrapper />
            </div>

            {/* Layered Accent Polaroid (Visible on medium/large screens) */}
            <div className="absolute -bottom-6 -left-6 z-20 hidden sm:block md:-bottom-8 md:-left-8">
              <PolaroidFrame
                src="/images/products/shell-cone-pink-crackle-bracelet.webp"
                alt="Cone shell bracelet with pink crackle beads"
                caption="Natural Cone Shells"
                subcaption="Handmade in India"
                rotation="left"
                className="w-36 md:w-44 shadow-card-hover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
