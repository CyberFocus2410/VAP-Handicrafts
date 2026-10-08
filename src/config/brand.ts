export interface NavItem {
  readonly label: string;
  readonly href: string;
}

export interface FooterSection {
  readonly title: string;
  readonly links: readonly NavItem[];
}

export interface BrandConfig {
  readonly name: string;
  readonly legalName: string;
  readonly tagline: string;
  readonly description: string;
  readonly currency: {
    readonly code: string;
    readonly symbol: string;
    readonly minorUnit: string;
  };
  readonly announcement: {
    readonly enabled: boolean;
    readonly text: string;
    readonly linkText?: string;
    readonly linkHref?: string;
  };
  readonly navigation: readonly NavItem[];
  readonly footerSections: readonly FooterSection[];
  readonly contact: {
    readonly email: string;
    readonly phone: string;
    readonly location: string;
    readonly instagram?: string;
  };
}

export const BRAND: BrandConfig = {
  name: "VAP Handicrafts",
  legalName: "VAP Handicrafts Private Limited",
  tagline: "Handcrafted shell jewellery, heartfelt keepsakes & personalized gifts",
  description:
    "Cherish every memory with bespoke shell jewellery, custom keepsake frames, and heartfelt personalized gifts crafted with timeless warmth.",
  currency: {
    code: "INR",
    symbol: "₹",
    minorUnit: "paise",
  },
  announcement: {
    enabled: true,
    text: "Handcrafted with love across India • Every piece tells a story",
    linkText: "Explore Collection",
    linkHref: "/shop",
  },
  navigation: [
    { label: "Shop All", href: "/shop" },
    { label: "Jewellery", href: "/shop/jewellery" },
    { label: "Keepsakes", href: "/shop/keepsakes" },
    { label: "Gift Sets", href: "/shop/gift-sets" },
    { label: "Our Story", href: "/about" },
    { label: "Contact", href: "/contact" },
  ],
  footerSections: [
    {
      title: "Explore",
      links: [
        { label: "All Collections", href: "/shop" },
        { label: "Shell Jewellery", href: "/shop/jewellery" },
        { label: "Keepsakes", href: "/shop/keepsakes" },
        { label: "Gift Sets", href: "/shop/gift-sets" },
      ],
    },
    {
      title: "About",
      links: [
        { label: "Our Story", href: "/about" },
        { label: "Contact Us", href: "/contact" },
      ],
    },
    {
      title: "Customer Support",
      links: [
        { label: "Shipping Policy", href: "/shipping-policy" },
        { label: "Returns & Refunds", href: "/refund-policy" },
        { label: "Privacy Policy", href: "/privacy" },
        { label: "Terms of Service", href: "/terms" },
      ],
    },
  ],
  contact: {
    email: "care@vaphandicrafts.com",
    phone: "+91 98765 43210",
    location: "India",
  },
} as const;
