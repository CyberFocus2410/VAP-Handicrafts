import Link from "next/link";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Heading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";

interface OrderStatusPageProps {
  params: Promise<{ orderId: string }>;
}

export async function generateMetadata({ params }: OrderStatusPageProps) {
  const { orderId } = await params;
  return {
    title: `Order Status: ${orderId}`,
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function OrderStatusPage({ params }: OrderStatusPageProps) {
  const { orderId } = await params;

  return (
    <Section surface="default" className="py-16 md:py-24">
      <Container className="max-w-2xl text-center">
        <div className="mx-auto w-16 h-16 rounded-full bg-success/15 flex items-center justify-center text-success mb-6">
          <CheckCircle2 className="w-8 h-8" aria-hidden="true" />
        </div>

        <Heading level="h1" className="mb-2">
          Order Status
        </Heading>

        <p className="text-sm font-mono text-cocoa-muted mb-6">
          Order ID: <span className="text-cocoa font-semibold">{orderId}</span>
        </p>

        <p className="text-base text-cocoa-muted mb-8 max-w-lg mx-auto leading-relaxed">
          Real-time order reconciliation, tokenized guest status verification, and tracking timeline will be active in Phase 5.
        </p>

        <Button asChild variant="primary">
          <Link href="/">
            Back to Home <ArrowRight className="w-4 h-4 ml-1" aria-hidden="true" />
          </Link>
        </Button>
      </Container>
    </Section>
  );
}
