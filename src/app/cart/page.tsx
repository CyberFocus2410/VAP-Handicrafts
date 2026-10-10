import Link from "next/link";
import { ShoppingBag, ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Heading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Your Shopping Cart",
  description: "View and manage your selected handcrafted gifts and jewellery.",
};

export default function CartPage() {
  return (
    <Section surface="default" className="py-16 md:py-24">
      <Container className="max-w-3xl text-center">
        <div className="mx-auto w-16 h-16 rounded-full bg-blush/30 flex items-center justify-center text-rose-deep mb-6">
          <ShoppingBag className="w-8 h-8" aria-hidden="true" />
        </div>

        <Heading level="h1" className="mb-4">
          Your Cart is Currently Empty
        </Heading>

        <p className="text-base text-cocoa-muted mb-8 max-w-md mx-auto leading-relaxed">
          Looks like you haven&apos;t added any keepsakes yet. Client-side persistent cart and server-validated pricing will be active in Phase 4.
        </p>

        <div className="flex justify-center gap-4">
          <Button asChild variant="primary" size="lg">
            <Link href="/shop">
              Start Shopping <ArrowRight className="w-4 h-4 ml-1" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </Container>
    </Section>
  );
}
