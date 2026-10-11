import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BRAND } from "@/config/brand";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Heading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Our Story",
  description: "Learn about VAP Handicrafts and our passion for handcrafted shell jewellery and personalized gifts.",
};

export default function AboutPage() {
  return (
    <Section surface="default" className="py-16 md:py-24">
      <Container className="max-w-3xl">
        <div className="text-center mb-12">
          <Heading level="eyebrow" className="mb-2">
            The Journey
          </Heading>
          <Heading level="h1" className="mb-4">
            Our Story & Craft
          </Heading>
          <p className="text-base sm:text-lg text-cocoa-muted leading-relaxed max-w-xl mx-auto">
            {BRAND.tagline}
          </p>
        </div>

        <div className="prose prose-cocoa max-w-none space-y-6 text-cocoa/90 leading-relaxed text-base">
          <p>
            At {BRAND.name}, every creation begins with a passion for turning natural beauty and cherished memories into tangible creations. From delicate sea shell beads inspired by ocean shores to customized Polaroid-style frames and personalized message cards, our collections are designed to celebrate moments that matter.
          </p>
          <p>
            We believe gifts should evoke feeling, not just function. Whether it is a matching charm bracelet for your best friend or a customized relationship card for an anniversary, we take time to ensure every piece is packed with love and warmth.
          </p>
          <div className="p-6 rounded-md bg-surface border border-border my-8">
            <h3 className="font-display text-xl font-medium text-cocoa mb-2">
              Our Craft Philosophy
            </h3>
            <p className="text-sm text-cocoa-muted leading-relaxed">
              We uphold strict honesty in our craft: genuine materials, transparent descriptions, and an obsessive focus on tactile quality. No mass-market generic templates—just thoughtful handcrafted gifts you will treasure.
            </p>
          </div>
        </div>

        <div className="mt-12 text-center">
          <Button asChild variant="primary" size="lg">
            <Link href="/shop">
              Explore Our Collections <ArrowRight className="w-4 h-4 ml-1" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </Container>
    </Section>
  );
}
