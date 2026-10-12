"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { BRAND } from "@/config/brand";
import { generateAutoAlt } from "@/lib/images/auto-alt";

interface AdminNavProps {
  currentTab?: "overview" | "orders" | "customers" | "inquiries" | "products" | "categories" | "content" | "promotions";
}

export const AdminNav: React.FC<AdminNavProps> = ({ currentTab }) => {
  const pathname = usePathname();

  const navItems = [
    { id: "overview", label: "Command Hub", href: "/admin", icon: "📊" },
    { id: "orders", label: "Orders", href: "/admin/orders", icon: "📦" },
    { id: "customers", label: "Customers (CRM)", href: "/admin/customers", icon: "👥" },
    { id: "inquiries", label: "Custom & Inquiries", href: "/admin/inquiries", icon: "💬" },
    { id: "products", label: "Products (CMS)", href: "/admin/products", icon: "💎" },
    { id: "categories", label: "Categories (CMS)", href: "/admin/categories", icon: "🏷️" },
    { id: "content", label: "Site Content (CMS)", href: "/admin/content", icon: "✨" },
    { id: "promotions", label: "Shipping & Coupons", href: "/admin/promotions", icon: "🎟️" },
  ];

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
      window.location.href = "/admin/login";
    } catch {
      window.location.href = "/admin/login";
    }
  };

  return (
    <>
      <header className="mb-6 md:mb-8 bg-white/90 backdrop-blur-md rounded-2xl p-4 sm:p-6 border border-[#2D1A16]/10 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 border-b border-[#2D1A16]/10 pb-4 sm:pb-5">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-full overflow-hidden border border-[#A05A44]/30 shadow-sm bg-[#FAF5EF] flex-shrink-0">
              <Image
                src={BRAND.logo.src}
                alt={generateAutoAlt({ context: "hero", name: `${BRAND.name} official emblem` })}
                fill
                className="object-contain p-1"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif text-lg sm:text-2xl font-bold tracking-tight text-[#2D1A16]">
                  {BRAND.name}
                </span>
                <span className="px-2 py-0.5 text-[10px] sm:text-[11px] font-semibold bg-[#A05A44]/10 text-[#A05A44] rounded-full uppercase tracking-wider">
                  Admin CRM
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-[#2D1A16]/60">
                Artisan Jewellery • Cards • Live Store
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl border border-[#2D1A16]/20 hover:border-[#A05A44] hover:bg-[#FAF5EF] text-[#2D1A16] transition-colors flex items-center gap-1.5"
            >
              <span>Live Store</span>
              <span className="text-[10px]">↗</span>
            </a>
            <button
              onClick={handleLogout}
              className="text-xs font-semibold px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-[#2D1A16]/5 hover:bg-rose-50 hover:text-rose-700 text-[#2D1A16]/80 transition-colors"
            >
              Log Out
            </button>
          </div>
        </div>

        {/* Navigation Tabs (Desktop / Tablet Scroll) */}
        <nav className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pt-3 sm:pt-4 no-scrollbar">
          {navItems.map((item) => {
            const isActive =
              currentTab === item.id ||
              (item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href));

            return (
              <Link
                key={item.id}
                href={item.href}
                className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  isActive
                    ? "bg-[#2D1A16] text-[#FAF5EF] shadow-sm font-semibold"
                    : "text-[#2D1A16]/70 hover:text-[#2D1A16] hover:bg-[#FAF5EF]"
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </header>

      {/* Mobile Bottom Thumb Navigation Bar (App Experience on Phone) */}
      <nav
        aria-label="Mobile Admin Navigation"
        className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t border-[#2D1A16]/10 px-1 py-1.5 flex md:hidden items-center justify-around shadow-xl"
      >
        {navItems.map((item) => {
          const isActive =
            currentTab === item.id ||
            (item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href));

          // Short label for mobile bottom bar
          const shortLabels: Record<string, string> = {
            overview: "Hub",
            orders: "Orders",
            customers: "CRM",
            inquiries: "Leads",
            products: "Products",
            categories: "Categories",
            content: "CMS",
          };

          return (
            <Link
              key={item.id}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-1.5 rounded-xl transition-all min-w-[48px] ${
                isActive
                  ? "text-[#2D1A16] font-bold"
                  : "text-[#2D1A16]/50 hover:text-[#2D1A16]"
              }`}
            >
              <span className={`text-base leading-none ${isActive ? "scale-110 transform" : ""}`}>
                {item.icon}
              </span>
              <span className={`text-[10px] mt-0.5 tracking-tight ${isActive ? "font-bold text-[#A05A44]" : "font-normal"}`}>
                {shortLabels[item.id] || item.label}
              </span>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#A05A44] mt-0.5" />
              )}
            </Link>
          );
        })}
      </nav>
    </>
  );
};
