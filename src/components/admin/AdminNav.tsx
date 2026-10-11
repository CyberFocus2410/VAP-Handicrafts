"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { BRAND } from "@/config/brand";

interface AdminNavProps {
  currentTab?: "overview" | "orders" | "customers" | "inquiries" | "products" | "categories" | "content";
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
    <header className="mb-8 bg-white/80 backdrop-blur-md rounded-2xl p-4 sm:p-6 border border-[#2D1A16]/10 shadow-sm">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#2D1A16]/10 pb-5">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-full overflow-hidden border border-[#A05A44]/30 shadow-sm bg-[#FAF5EF] flex-shrink-0">
            <Image
              src={BRAND.logo.src}
              alt={BRAND.name}
              fill
              className="object-contain p-1"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-[#2D1A16]">
                {BRAND.name}
              </span>
              <span className="px-2 py-0.5 text-[11px] font-semibold bg-[#A05A44]/10 text-[#A05A44] rounded-full uppercase tracking-wider">
                Admin CRM & CMS
              </span>
            </div>
            <p className="text-xs text-[#2D1A16]/60">
              Artisan Jewellery • Personalized Cards • Live Store Management
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-medium px-3.5 py-2 rounded-xl border border-[#2D1A16]/20 hover:border-[#A05A44] hover:bg-[#FAF5EF] text-[#2D1A16] transition-colors flex items-center gap-1.5"
          >
            <span>Live Store</span>
            <span className="text-[10px]">↗</span>
          </a>
          <button
            onClick={handleLogout}
            className="text-xs font-medium px-3.5 py-2 rounded-xl bg-[#2D1A16]/5 hover:bg-rose-50 hover:text-rose-700 text-[#2D1A16]/80 transition-colors"
          >
            Log Out
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pt-4 no-scrollbar">
        {navItems.map((item) => {
          const isActive =
            currentTab === item.id ||
            (item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href));

          return (
            <Link
              key={item.id}
              href={item.href}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap flex items-center gap-1.5 ${
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
  );
};
