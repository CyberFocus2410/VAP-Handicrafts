import Link from "next/link";
import { BRAND } from "@/config/brand";
import { Container } from "@/components/ui/container";
import { getSiteContentConfig } from "@/server/admin/cms-service";

export async function AnnouncementBar() {
  let isEnabled = BRAND.announcement.enabled;
  let text = BRAND.announcement.text;
  let linkHref = BRAND.announcement.linkHref;
  let linkText = BRAND.announcement.linkText;

  try {
    const config = await getSiteContentConfig();
    if (config?.announcement) {
      isEnabled = config.announcement.isEnabled;
      text = config.announcement.text;
      linkHref = config.announcement.linkUrl;
      linkText = config.announcement.linkText;
    }
  } catch {
    // Non-fatal fallback
  }

  if (!isEnabled) {
    return null;
  }

  return (
    <aside
      aria-label="Announcement"
      className="bg-blush/40 border-b border-border/60 py-2.5 text-xs sm:text-sm font-medium text-cocoa tracking-wide"
    >
      <Container className="flex items-center justify-center text-center gap-2">
        <span>{text}</span>
        {linkHref && linkText && (
          <Link
            href={linkHref}
            className="underline underline-offset-4 font-semibold text-rose-deep hover:text-rose-deeper transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 rounded-sm"
          >
            {linkText}
          </Link>
        )}
      </Container>
    </aside>
  );
}
