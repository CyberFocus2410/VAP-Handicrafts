export interface NavItem {
  readonly label: string;
  readonly href: string;
}

export interface FooterSection {
  readonly title: string;
  readonly links: readonly NavItem[];
}

export interface BrandContactPerson {
  readonly name: string;
  readonly phone: string;
  readonly phoneRaw: string;
}

export interface BrandConfig {
  readonly name: string;
  readonly legalName: string;
  readonly tagline: string;
  readonly secondaryTagline: string;
  readonly motto: string;
  readonly description: string;
  readonly logo: {
    readonly src: string;
    readonly pngSrc: string;
    readonly alt: string;
  };
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
    readonly phoneDisplay: string;
    readonly location: string;
    readonly instagram: string;
    readonly instagramUrl: string;
    readonly representatives: readonly BrandContactPerson[];
  };
}

export const BRAND: BrandConfig = {
  name: "VAP Handicrafts",
  legalName: "VAP Handicrafts",
  tagline: "Small Details ✨ Big Emotions",
  secondaryTagline: "Crafted with Heart",
  motto: "Your Happiness Our Craft ♡",
  description:
    "From authentic shell jewellery to custom relationship cards, we bring your emotions to life.",
  logo: {
    src: "/images/brand/logo.webp",
    pngSrc: "/images/brand/logo.png",
    alt: "VAP Handicrafts — Crafted with Heart",
  },
  currency: {
    code: "INR",
    symbol: "₹",
    minorUnit: "paise",
  },
  announcement: {
    enabled: true,
    text: "Small Details ✨ Big Emotions • Free delivery on orders over ₹999",
    linkText: "Explore Collection",
    linkHref: "/shop",
  },
  navigation: [
    { label: "Shop All", href: "/shop" },
    { label: "Shell Jewellery", href: "/shop/jewellery" },
    { label: "Personalized Cards", href: "/shop/personalized-cards" },
    { label: "Our Story", href: "/about" },
    { label: "Contact Us", href: "/contact" },
  ],
  footerSections: [
    {
      title: "Explore",
      links: [
        { label: "All Collections", href: "/shop" },
        { label: "Shell Jewellery", href: "/shop/jewellery" },
        { label: "Personalized Cards", href: "/shop/personalized-cards" },
        { label: "Polaroid Keepsakes", href: "/shop/personalized-cards/polaroid-keepsake-card" },
      ],
    },
    {
      title: "About",
      links: [
        { label: "Our Story", href: "/about" },
        { label: "Contact Us", href: "/contact" },
        { label: "Custom Inquiries", href: "/contact" },
        { label: "Artisan Workshop", href: "/about" },
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
    email: "vaphandicrafts@gmail.com",
    phone: "+91 9311516813",
    phoneDisplay: "+91 9311516813 / +91 9310039258",
    location: "Delhi NCR, India",
    instagram: "@vaphandicraft",
    instagramUrl: "https://www.instagram.com/vaphandicraft",
    representatives: [
      {
        name: "Pulkit Garg",
        phone: "+91 9311516813",
        phoneRaw: "+919311516813",
      },
      {
        name: "Vivan Mittal",
        phone: "+91 9310039258",
        phoneRaw: "+919310039258",
      },
    ],
  },
} as const;
