"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, ShoppingBag } from "lucide-react";
import { BRAND } from "@/config/brand";
import { Container } from "@/components/ui/container";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/lib/cart/cart-store";

export function Header() {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const pathname = usePathname();
  const openDrawer = useCartStore((s) => s.openDrawer);
  const items = useCartStore((s) => s.items);
  const hasHydrated = useCartStore((s) => s.hasHydrated);

  const itemCount = hasHydrated
    ? items.reduce((total, item) => total + item.quantity, 0)
    : 0;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-surface/95 backdrop-blur-md transition-colors">
      <Container className="flex h-16 sm:h-20 items-center justify-between">
        {/* Left: Mobile Menu Trigger */}
        <div className="flex items-center lg:hidden">
          <Drawer open={mobileOpen} onOpenChange={setMobileOpen}>
            <DrawerTrigger asChild>
              <button
                type="button"
                className="inline-flex h-11 w-11 items-center justify-center rounded-sm text-cocoa hover:bg-beige/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                aria-label="Open navigation menu"
              >
                <Menu className="h-6 w-6" aria-hidden="true" />
              </button>
            </DrawerTrigger>
            <DrawerContent side="left" className="w-[85vw] max-w-sm flex flex-col justify-between">
              <div>
                <DrawerHeader className="pb-6 border-b border-border/60 text-left">
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
                      <DrawerTitle className="font-display text-2xl font-medium tracking-tight text-cocoa">
                        {BRAND.name}
                      </DrawerTitle>
                      <p className="text-xs text-cocoa-muted mt-0.5">
                        {BRAND.tagline}
                      </p>
                    </div>
                  </div>
                </DrawerHeader>

                <nav className="mt-6 flex flex-col space-y-1" aria-label="Mobile Navigation">
                  {BRAND.navigation.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={cn(
                          "flex min-h-[44px] items-center rounded-sm px-4 py-2.5 text-base font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                          isActive
                            ? "bg-blush/30 font-semibold text-rose-deep"
                            : "text-cocoa hover:bg-beige/30"
                        )}
                        aria-current={isActive ? "page" : undefined}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </nav>
              </div>

              <div className="pt-6 border-t border-border/60 text-xs text-cocoa-muted space-y-2">
                <p>
                  <span className="font-medium text-cocoa">Email:</span>{" "}
                  <a href={`mailto:${BRAND.contact.email}`} className="text-rose-deep font-medium hover:underline">
                    {BRAND.contact.email}
                  </a>
                </p>
                <div className="space-y-1">
                  {BRAND.contact.representatives.map((rep) => (
                    <p key={rep.phoneRaw}>
                      <span className="font-medium text-cocoa">{rep.name}:</span>{" "}
                      <a href={`tel:${rep.phoneRaw}`} className="text-cocoa/90 hover:underline">
                        {rep.phone}
                      </a>
                    </p>
                  ))}
                </div>
                <p className="pt-1 text-[11px] text-cocoa-muted/80">{BRAND.motto}</p>
              </div>
            </DrawerContent>
          </Drawer>
        </div>

        {/* Brand Logo */}
        <div className="flex items-center">
          <Link
            href="/"
            className="flex items-center gap-2.5 sm:gap-3 group rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <div className="relative h-10 w-10 sm:h-12 sm:w-12 rounded-full overflow-hidden shadow-sm border border-gold-deep/20 bg-ivory shrink-0 transition-transform group-hover:scale-105">
              <Image
                src={BRAND.logo.src}
                alt={BRAND.name}
                width={48}
                height={48}
                className="h-full w-full object-contain"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className="font-display text-xl sm:text-2xl font-medium tracking-tight text-cocoa transition-colors group-hover:text-rose-deep leading-none">
                {BRAND.name}
              </span>
              <span className="hidden sm:inline-block text-[10px] tracking-widest uppercase text-cocoa-muted font-medium mt-1">
                {BRAND.tagline}
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Desktop Navigation */}
        <nav
          className="hidden lg:flex items-center space-x-1"
          aria-label="Primary Navigation"
        >
          {BRAND.navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "inline-flex min-h-[44px] items-center px-4 py-2 text-sm font-medium transition-colors rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  isActive
                    ? "text-rose-deep font-semibold"
                    : "text-cocoa/80 hover:text-cocoa hover:bg-beige/25"
                )}
                aria-current={isActive ? "page" : undefined}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Actions: Cart */}
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={openDrawer}
            className="relative inline-flex h-11 w-11 items-center justify-center rounded-sm text-cocoa transition-colors hover:bg-beige/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-label={`View shopping cart with ${itemCount} items`}
          >
            <ShoppingBag className="h-5 w-5" aria-hidden="true" />
            <span
              className="absolute top-2 right-2 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-deep px-1 text-[10px] font-semibold text-surface"
              aria-hidden="true"
            >
              {itemCount}
            </span>
          </button>
        </div>
      </Container>
    </header>
  );
}
