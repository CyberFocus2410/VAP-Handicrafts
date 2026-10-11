import { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { CartPageView } from "@/components/cart/CartPageView";

export const metadata: Metadata = {
  title: "Shopping Cart | VAP Handicrafts",
  description: "Review and manage your selected handcrafted shell jewellery and personalized gifts.",
};

export default function CartPage() {
  return (
    <Section surface="default" className="py-12 md:py-20">
      <Container>
        <CartPageView />
      </Container>
    </Section>
  );
}
