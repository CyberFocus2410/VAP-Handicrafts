import Link from "next/link";
import { BRAND } from "@/config/brand";
import { Container } from "@/components/ui/container";
import { getSiteContentConfig } from "@/server/admin/cms-service";
import { getActiveFreebieScheme } from "@/server/admin/promotions-service";

export async function AnnouncementBar() {
  let isEnabled = BRAND.announcement.enabled;
  let text = BRAND.announcement.text;
  let linkHref = BRAND.announcement.linkHref;
  let linkText = BRAND.announcement.linkText;
  let isSpecialPromo = false;

  try {
    const [config, activeFreebie] = await Promise.all([
      getSiteContentConfig(),
      getActiveFreebieScheme(),
    ]);

    if (activeFreebie && activeFreebie.isActive && activeFreebie.isBannerVisible) {
      isEnabled = true;
      text = activeFreebie.bannerText;
      linkHref = "/shop";
      linkText = "Shop & Claim Free Gift →";
      isSpecialPromo = true;
    } else if (config?.announcement) {
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
      className={
        isSpecialPromo
          ? "bg-[#78362B] text-white border-b border-[#5E251B] py-2.5 text-xs sm:text-sm font-medium tracking-wide shadow-xs transition-colors"
          : "bg-[#EED5CE] border-b border-border py-2.5 text-xs sm:text-sm font-semibold text-cocoa tracking-wide"
      }
    >
      <Container className="flex items-center justify-center text-center gap-2 flex-wrap">
        {isSpecialPromo && (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-400 text-amber-950 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider shadow-xs animate-pulse">
            🎁 FREE GIFT
          </span>
        )}
        <span className={isSpecialPromo ? "font-bold text-white tracking-wide" : "font-medium"}>{text}</span>
        {linkHref && linkText && (
          <Link
            href={linkHref}
            className={
              isSpecialPromo
                ? "underline underline-offset-4 font-extrabold text-amber-200 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-1 rounded-sm ml-1"
                : "underline underline-offset-4 font-bold text-rose-deep hover:text-rose-deeper transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 rounded-sm ml-1"
            }
          >
            {linkText}
          </Link>
        )}
      </Container>
    </aside>
  );
}
