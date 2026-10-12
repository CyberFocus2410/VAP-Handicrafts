import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { generateAutoAlt } from "@/lib/images/auto-alt";

interface CollectionItem {
  title: string;
  category: string;
  href: string;
  image: string;
  description: string;
}

const COLLECTIONS: CollectionItem[] = [
  {
    title: "Shell Jewellery",
    category: "Jewellery",
    href: "/shop/shell-jewellery",
    image: "/images/products/shell-cone-pink-crackle-bracelet.webp",
    description: "Natural conch & cowrie beaded bracelets crafted for effortless seaside styling.",
  },
  {
    title: "Personalized Cards",
    category: "Personalized",
    href: "/shop/personalized-cards",
    image: "/images/templates/relationship-licence-template.webp",
    description: "Custom couple partnership licences, Polaroid photo cards, and heartfelt dedication notes.",
  },
];

interface FeaturedCollectionsProps {
  categories?: Array<{
    id: string;
    slug: string;
    name: string;
    description?: string | null;
    imageUrl?: string | null;
  }>;
}

export function FeaturedCollections({ categories }: FeaturedCollectionsProps) {
  const displayItems: CollectionItem[] =
    categories && categories.length > 0
      ? categories.map((c) => ({
          title: c.name,
          category: c.name,
          href: `/shop/${c.slug}`,
          image: c.imageUrl || "/images/products/shell-cone-pink-crackle-bracelet.webp",
          description: c.description || "Handcrafted artisan collection.",
        }))
      : COLLECTIONS;

  const isTwoCols = displayItems.length <= 2;

  return (
    <section
      aria-labelledby="collections-heading"
      className="py-16 md:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-rose-deep">
              Curated Categories
            </p>
            <h2
              id="collections-heading"
              className="mt-2 font-serif text-h2 font-medium text-cocoa"
            >
              Explore Our Collections
            </h2>
          </div>
          <Link
            href="/shop"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-rose-deep transition-colors hover:text-rose-deeper hover:underline"
          >
            <span>View all categories</span>
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        <div
          className={`mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 ${
            isTwoCols ? "lg:grid-cols-2 max-w-4xl mx-auto" : "lg:grid-cols-4"
          }`}
        >
          {displayItems.map((col) => (
            <Link
              key={col.title}
              href={col.href}
              className="group relative flex flex-col overflow-hidden rounded-md border border-border bg-surface p-3 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_16px_32px_-8px_rgba(45,26,22,0.18)] hover:border-gold-deep/40 motion-reduce:hover:translate-y-0"
            >
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-sm bg-bg">
                <Image
                  src={col.image}
                  alt={generateAutoAlt({
                    title: col.title,
                    category: col.category,
                    type: "collection",
                  })}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover object-center transition-transform duration-500 group-hover:scale-105 motion-reduce:group-hover:scale-100"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-cocoa/60 via-transparent to-transparent opacity-60 transition-opacity group-hover:opacity-75" />
                <div className="absolute bottom-3 left-3 right-3 text-ivory">
                  <span className="text-[11px] font-semibold uppercase tracking-widest text-blush">
                    {col.category}
                  </span>
                  <h3 className="mt-1 font-serif text-lg font-medium leading-snug">
                    {col.title}
                  </h3>
                </div>
              </div>
              <div className="mt-3 flex flex-1 items-center justify-between">
                <p className="line-clamp-2 text-xs leading-relaxed text-cocoa-muted">
                  {col.description}
                </p>
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-bg text-cocoa transition-colors group-hover:bg-rose-deep group-hover:text-ivory">
                  <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
