import { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { CartPageView } from "@/components/cart/CartPageView";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";

export const metadata: Metadata = {
  title: "Your Shopping Bag | VAP Handicrafts",
  description:
    "Review and manage your selected handcrafted shell jewellery, customized cards, and gifts with secure UPI and card checkout.",
  alternates: {
    canonical: "/cart",
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function CartPage() {
  return (
    <Section surface="default" className="py-12 md:py-20">
      <Container>
        <Breadcrumbs items={[{ label: "Shopping Bag", href: "/cart" }]} className="mb-8" />
        <CartPageView />
      </Container>
    </Section>
  );
}
