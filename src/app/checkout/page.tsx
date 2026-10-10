import Link from "next/link";
import { Lock, ArrowLeft } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Heading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Secure Checkout",
  description: "Complete your order with secure UPI and card payments.",
};

export default function CheckoutPage() {
  return (
    <Section surface="surface" className="py-16 md:py-24">
      <Container className="max-w-2xl text-center">
        <div className="mx-auto w-12 h-12 rounded-full bg-surface border border-border flex items-center justify-center text-cocoa mb-6 shadow-sm">
          <Lock className="w-5 h-5 text-rose-deep" aria-hidden="true" />
        </div>

        <Heading level="h1" className="mb-4">
          Secure Guest Checkout
        </Heading>

        <p className="text-base text-cocoa-muted mb-8 max-w-lg mx-auto leading-relaxed">
          Order creation, shipping address collection, and Paytm UPI payment integration will be activated in Phase 5.
        </p>

        <Button asChild variant="outline">
          <Link href="/shop">
            <ArrowLeft className="w-4 h-4 mr-2" aria-hidden="true" /> Return to Shop
          </Link>
        </Button>
      </Container>
    </Section>
  );
}
