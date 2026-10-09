import Link from "next/link";
import { BRAND } from "@/config/brand";
import { Container } from "@/components/ui/container";

export function AnnouncementBar() {
  if (!BRAND.announcement.enabled) {
    return null;
  }

  return (
    <aside
      aria-label="Announcement"
      className="bg-blush/40 border-b border-border/60 py-2.5 text-xs sm:text-sm font-medium text-cocoa tracking-wide"
    >
      <Container className="flex items-center justify-center text-center gap-2">
        <span>{BRAND.announcement.text}</span>
        {BRAND.announcement.linkHref && BRAND.announcement.linkText && (
          <Link
            href={BRAND.announcement.linkHref}
            className="underline underline-offset-4 font-semibold text-rose-deep hover:text-rose-deeper transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 rounded-sm"
          >
            {BRAND.announcement.linkText}
          </Link>
        )}
      </Container>
    </aside>
  );
}
