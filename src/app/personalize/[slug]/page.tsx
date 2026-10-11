import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getProductBySlug } from "@/server/catalogue/queries";
import { PersonalizationBuilder } from "@/components/personalization/PersonalizationBuilder";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";

interface PersonalizePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PersonalizePageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      title: "Personalize Gift | VAP Handicrafts",
    };
  }

  return {
    title: `Personalize ${product.name} | VAP Handicrafts`,
    description: `Create a custom polaroid card or personalized gift note for ${product.name}.`,
  };
}

export default async function PersonalizeProductPage({ params }: PersonalizePageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return (
    <Section surface="default" className="py-10 md:py-16">
      <Container>
        <PersonalizationBuilder product={product} />
      </Container>
    </Section>
  );
}
