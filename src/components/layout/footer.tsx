import Link from "next/link";
import Image from "next/image";
import { BRAND } from "@/config/brand";
import { Container } from "@/components/ui/container";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="mt-auto border-t border-border bg-surface pt-12 pb-8 text-cocoa"
      aria-label="Footer"
    >
      <Container>
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-5 pb-12 border-b border-border/70">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative h-12 w-12 rounded-full overflow-hidden shadow-sm border border-gold-deep/20 bg-ivory shrink-0">
                <Image
                  src={BRAND.logo.src}
                  alt={BRAND.name}
                  width={48}
                  height={48}
                  className="h-full w-full object-contain"
                />
              </div>
              <div>
                <span className="font-display text-2xl font-medium tracking-tight text-cocoa block leading-none">
                  {BRAND.name}
                </span>
                <span className="text-xs text-cocoa-muted font-medium mt-1 block">
                  {BRAND.tagline}
                </span>
              </div>
            </div>

            <p className="text-sm text-cocoa-muted max-w-sm leading-relaxed">
              {BRAND.description}
            </p>

            <div className="pt-2 text-xs">
              <dl className="grid grid-cols-[max-content_1fr] items-baseline gap-x-3 gap-y-1.5 text-xs text-cocoa-muted">
                <dt className="font-medium text-cocoa">Email:</dt>
                <dd>
                  <a
                    href={`mailto:${BRAND.contact.email}`}
                    className="text-rose-deep font-medium hover:underline"
                  >
                    {BRAND.contact.email}
                  </a>
                </dd>

                <dt className="font-medium text-cocoa">Instagram:</dt>
                <dd>
                  <a
                    href={BRAND.contact.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-rose-deep font-medium hover:underline"
                  >
                    {BRAND.contact.instagram}
                  </a>
                </dd>

                {BRAND.contact.representatives.map((rep) => (
                  <div key={rep.phoneRaw} className="contents">
                    <dt className="font-medium text-cocoa">{rep.name}:</dt>
                    <dd>
                      <a
                        href={`tel:${rep.phoneRaw}`}
                        className="text-cocoa/90 hover:text-rose-deep hover:underline"
                      >
                        {rep.phone}
                      </a>
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          {/* Dynamic Link Groups */}
          {BRAND.footerSections.map((section) => (
            <div key={section.title} className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-cocoa">
                {section.title}
              </h3>
              <ul className="space-y-2.5 text-sm">
                {section.links.map((link) => (
                  <li key={`${section.title}-${link.label}`}>
                    <Link
                      href={link.href}
                      className="text-cocoa/80 hover:text-rose-deep transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 rounded-sm py-1.5 min-h-[28px] inline-flex items-center"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-cocoa-muted">
          <p>
            &copy; {currentYear} {BRAND.legalName}. All rights reserved.
          </p>
        </div>
      </Container>
    </footer>
  );
}
