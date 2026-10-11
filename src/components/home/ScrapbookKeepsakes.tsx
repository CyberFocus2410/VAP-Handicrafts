import * as React from "react";
import Link from "next/link";
import { PolaroidFrame } from "@/components/ui/polaroid-frame";
import { Heart } from "lucide-react";
import { SiteScrapbookItem } from "@/server/admin/crm-cms-types";

interface ScrapbookKeepsakesProps {
  items?: SiteScrapbookItem[];
}

const DEFAULT_SCRAPBOOK_ITEMS = [
  {
    href: "/shop/shell-jewellery/spiral-conch-pink-crackle-bracelet",
    src: "/images/products/shell-cone-pink-crackle-bracelet.webp",
    alt: "Handcrafted circular bracelet with natural striped cone sea shells alternating with pink crackle glass beads on ivory stone pedestal",
    caption: "Spiral Cone Bracelet",
    subcaption: "Natural shells & rose crackle",
    rotation: "left" as const,
  },
  {
    href: "/shop/shell-jewellery/scallop-cowrie-earring-bracelet-set",
    src: "/images/products/scallop-cowrie-earring-bracelet-set.webp",
    alt: "Handcrafted jewellery set with scallop shell and pink crackle bead bracelet paired with matching gold-tone cowrie drop earrings",
    caption: "Scallop & Cowrie Set",
    subcaption: "Earrings & bracelet combo",
    rotation: "right" as const,
  },
  {
    href: "/shop/shell-jewellery/lavender-floral-beaded-pearl-set",
    src: "/images/products/purple-floral-beaded-pearl-set.webp",
    alt: "Handcrafted purple floral beaded bracelet with gold center beads and matching drop earrings featuring purple crystals and baroque pearls",
    caption: "Floral Blossom & Pearl",
    subcaption: "Glass florets & baroque pearls",
    rotation: "left" as const,
  },
  {
    href: "/shop/shell-jewellery/golden-link-cowrie-conch-charm-bracelet",
    src: "/images/products/golden-link-cowrie-charm-bracelet.webp",
    alt: "Handcrafted gold-tone link charm bracelet with dangling polished white cowrie and brown striped spiral shell charms on beach sand",
    caption: "Golden Ocean Charms",
    subcaption: "Cowrie charms & brass link",
    rotation: "right" as const,
  },
];

export function ScrapbookKeepsakes({ items }: ScrapbookKeepsakesProps) {
  const polaroids =
    items && items.length > 0
      ? items.map((it, idx) => ({
          href: "/shop",
          src: it.imageUrl || "/images/products/shell-cone-pink-crackle-bracelet.webp",
          alt: it.title,
          caption: it.title,
          subcaption: it.subtitle,
          rotation: idx % 2 === 0 ? ("left" as const) : ("right" as const),
        }))
      : DEFAULT_SCRAPBOOK_ITEMS;

  return (
    <section
      aria-labelledby="scrapbook-heading"
      className="relative overflow-hidden bg-surface py-16 md:py-24"
    >
      {/* Decorative Warm Ambient Grain Overlay */}
      <div
        className="pointer-events-none absolute inset-0 bg-radial-vignette opacity-40"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-rose-deep">
            <Heart className="h-3.5 w-3.5 text-rose-deep fill-rose-deep/20" aria-hidden="true" />
            <span>The Scrapbook Collection</span>
          </div>
          <h2
            id="scrapbook-heading"
            className="mt-2 font-serif text-h2 font-medium text-cocoa"
          >
            Snapshots of Seaside Craft
          </h2>
          <p className="mt-3 text-body text-cocoa-muted">
            Each creation is assembled by hand using authentic ocean shells, delicate
            pastel glass, and heartfelt details. Made to celebrate your most
            cherished moments.
          </p>
        </div>

        {/* Layered Polaroid Keepsake Gallery */}
        <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {polaroids.map((p, i) => (
            <Link
              key={i}
              href={p.href}
              className="flex justify-center outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
            >
              <PolaroidFrame
                src={p.src}
                alt={p.alt}
                caption={p.caption}
                subcaption={p.subcaption}
                rotation={p.rotation}
                className="w-full max-w-[280px]"
              />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
