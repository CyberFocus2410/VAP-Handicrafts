export interface CustomerProfile {
  id: string;
  customerKey: string; // unique identifier (email or phone)
  name: string;
  email: string;
  phone: string;
  tags: string[];
  internalNotes: string;
  totalOrders: number;
  totalSpendMinor: number;
  firstOrderDate: string;
  lastOrderDate: string;
  orders: Array<{
    orderReference: string;
    date: string;
    status: string;
    amountMinor: number;
    itemCount: number;
    itemsSummary: string;
  }>;
  addresses: Array<{
    fullName: string;
    streetAddress: string;
    city: string;
    state: string;
    pincode: string;
  }>;
  personalizations: Array<{
    orderReference: string;
    templateType: string;
    recipientName?: string;
    licenseHolder?: string;
    message?: string;
    date?: string;
  }>;
}

export type InquiryStatus = "new" | "in_discussion" | "quote_sent" | "converted" | "closed";

export interface CustomerInquiry {
  id: string;
  name: string;
  email: string;
  phone?: string;
  occasion?: string;
  message: string;
  status: InquiryStatus;
  assignedTo?: string; // e.g. "Pulkit Garg" | "Vivan Mittal"
  quoteMinor?: number;
  internalNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SiteAnnouncementContent {
  text: string;
  linkUrl: string;
  linkText: string;
  isEnabled: boolean;
}

export interface SiteHeroContent {
  eyebrow: string;
  title: string;
  italicTitlePart: string;
  description: string;
  primaryCtaText: string;
  primaryCtaLink: string;
  secondaryCtaText: string;
  secondaryCtaLink: string;
}

export interface SiteBrandStoryContent {
  eyebrow: string;
  heading: string;
  highlightPhrase: string;
  narrativeParagraph1: string;
  narrativeParagraph2: string;
  badgeTitle: string;
  badgeSubtitle: string;
}

export interface SiteScrapbookItem {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
}

export interface SiteContentConfig {
  announcement: SiteAnnouncementContent;
  hero: SiteHeroContent;
  brandStory: SiteBrandStoryContent;
  scrapbook: SiteScrapbookItem[];
}
