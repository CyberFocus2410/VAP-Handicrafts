"use client";

import React from "react";
import Link from "next/link";
import { formatINR } from "@/lib/money";
import { AdminNav } from "./AdminNav";
import { CustomerProfile, CustomerInquiry } from "@/server/admin/crm-cms-types";

interface AdminDashboardOverviewProps {
  orders: Array<{
    id: string;
    orderReference: string;
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    status: string;
    totalMinor: number;
    createdAt: string;
    itemsSummary?: string;
  }>;
  customers: CustomerProfile[];
  inquiries: CustomerInquiry[];
  productCount: number;
}

export const AdminDashboardOverview: React.FC<AdminDashboardOverviewProps> = ({
  orders,
  customers,
  inquiries,
  productCount,
}) => {
  const paidOrders = orders.filter((o) =>
    ["paid", "shipped", "fulfilled"].includes(o.status)
  );

  const grossSalesPaise = paidOrders.reduce((sum, o) => sum + o.totalMinor, 0);
  const aovPaise = paidOrders.length > 0 ? Math.round(grossSalesPaise / paidOrders.length) : 0;
  const pendingFulfillmentCount = orders.filter((o) => o.status === "paid").length;
  const pendingVerificationCount = orders.filter(
    (o) => o.status === "payment_proof_submitted"
  ).length;
  const openInquiriesCount = inquiries.filter(
    (i) => i.status === "new" || i.status === "in_discussion"
  ).length;

  const recentOrders = orders.slice(0, 5);
  const recentInquiries = inquiries.slice(0, 4);

  return (
    <div className="min-h-screen bg-[#FAF5EF] text-[#2D1A16] p-6 lg:p-10 font-sans">
      <div className="max-w-6xl mx-auto">
        <AdminNav currentTab="overview" />

        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-[#2D1A16] via-[#3E241E] to-[#A05A44] text-[#FAF5EF] rounded-3xl p-6 sm:p-8 mb-8 shadow-md relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <span className="text-xs uppercase tracking-widest text-[#E5DCD3] font-semibold bg-white/10 px-3 py-1 rounded-full">
              Artisan Command Center
            </span>
            <h1 className="font-serif text-2xl sm:text-4xl font-bold mt-3 mb-2">
              Namaste, Pulkit &amp; Vivan
            </h1>
            <p className="text-sm sm:text-base text-[#FAF5EF]/80 leading-relaxed">
              Real-time pulse of your shell jewellery boutique, customer relationships, custom gifting inquiries, and storefront content.
            </p>
            <div className="flex flex-wrap gap-3 mt-6">
              {pendingVerificationCount > 0 && (
                <Link
                  href="/admin/orders"
                  className="px-4 py-2 rounded-xl bg-amber-400 text-stone-900 text-xs sm:text-sm font-bold hover:bg-amber-300 shadow-md transition-all flex items-center gap-1.5"
                >
                  <span>📸</span>
                  <span>Verify Payments ({pendingVerificationCount} Pending)</span>
                </Link>
              )}
              <Link
                href="/admin/orders"
                className="px-4 py-2 rounded-xl bg-[#FAF5EF] text-[#2D1A16] text-xs sm:text-sm font-semibold hover:bg-white shadow-sm transition-all"
              >
                Fulfill Orders ({pendingFulfillmentCount} Ready)
              </Link>
              <Link
                href="/admin/inquiries"
                className="px-4 py-2 rounded-xl bg-white/15 border border-white/20 text-[#FAF5EF] text-xs sm:text-sm font-medium hover:bg-white/25 transition-all"
              >
                Open Leads ({openInquiriesCount})
              </Link>
              <Link
                href="/admin/products"
                className="px-4 py-2 rounded-xl bg-white/15 border border-white/20 text-[#FAF5EF] text-xs sm:text-sm font-medium hover:bg-white/25 transition-all"
              >
                Manage Catalogue ({productCount} Items)
              </Link>
            </div>
          </div>
          <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-12 translate-y-12">
            <span className="text-[220px] font-serif">🐚</span>
          </div>
        </div>

        {/* Pending Verification Banner */}
        {pendingVerificationCount > 0 && (
          <div className="mb-8 p-5 bg-amber-50 border-2 border-amber-300 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3.5">
              <span className="text-3xl">📸</span>
              <div>
                <h3 className="text-base font-bold text-amber-950">
                  {pendingVerificationCount} Customer Payment Screenshot{pendingVerificationCount > 1 ? "s" : ""} Awaiting Verification
                </h3>
                <p className="text-xs sm:text-sm text-amber-800 mt-0.5">
                  Customers paid via UPI QR and attached payment screenshots. Confirm them in the Orders tab to trigger order confirmation emails.
                </p>
              </div>
            </div>
            <Link
              href="/admin/orders"
              className="px-4 py-2.5 rounded-xl bg-amber-600 text-white text-xs sm:text-sm font-bold hover:bg-amber-700 shadow-sm shrink-0 transition-all"
            >
              Review Proofs &rarr;
            </Link>
          </div>
        )}

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-white p-5 rounded-2xl border border-[#2D1A16]/10 shadow-sm">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-[#2D1A16]/60">
              Gross Revenue
            </span>
            <div className="text-xl sm:text-2xl font-bold font-serif text-[#2D1A16] mt-1.5">
              {formatINR(grossSalesPaise)}
            </div>
            <p className="text-[11px] text-emerald-700 font-medium mt-1">Verified Orders</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#2D1A16]/10 shadow-sm">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-[#2D1A16]/60">
              Total Orders
            </span>
            <div className="text-xl sm:text-2xl font-bold font-serif text-[#2D1A16] mt-1.5">
              {orders.length}
            </div>
            <p className="text-[11px] text-amber-700 font-medium mt-1">
              {pendingFulfillmentCount} to pack &amp; ship
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#2D1A16]/10 shadow-sm">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-[#2D1A16]/60">
              Avg Order Value
            </span>
            <div className="text-xl sm:text-2xl font-bold font-serif text-[#2D1A16] mt-1.5">
              {formatINR(aovPaise)}
            </div>
            <p className="text-[11px] text-[#2D1A16]/60 font-medium mt-1">Per paid basket</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#2D1A16]/10 shadow-sm">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-[#2D1A16]/60">
              CRM Profiles
            </span>
            <div className="text-xl sm:text-2xl font-bold font-serif text-[#2D1A16] mt-1.5">
              {customers.length}
            </div>
            <p className="text-[11px] text-purple-700 font-medium mt-1">Unique Buyers</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#2D1A16]/10 shadow-sm col-span-2 lg:col-span-1">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-[#2D1A16]/60">
              Custom Leads
            </span>
            <div className="text-xl sm:text-2xl font-bold font-serif text-[#2D1A16] mt-1.5">
              {openInquiriesCount}
            </div>
            <p className="text-[11px] text-blue-700 font-medium mt-1">Awaiting quotation</p>
          </div>
        </div>

        {/* 2-Column Dashboard Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Recent Orders Card */}
          <div className="bg-white rounded-3xl p-6 border border-[#2D1A16]/10 shadow-sm">
            <div className="flex justify-between items-center mb-5 pb-3 border-b border-[#2D1A16]/10">
              <div>
                <h2 className="font-serif text-lg font-bold text-[#2D1A16]">
                  Recent Workshop Orders
                </h2>
                <p className="text-xs text-[#2D1A16]/60">Latest storefront purchases</p>
              </div>
              <Link
                href="/admin/orders"
                className="text-xs font-semibold text-[#A05A44] hover:underline"
              >
                View All &rarr;
              </Link>
            </div>

            {recentOrders.length === 0 ? (
              <p className="text-xs text-[#2D1A16]/60 py-6 text-center">
                No orders recorded yet.
              </p>
            ) : (
              <div className="space-y-3">
                {recentOrders.map((o) => (
                  <div
                    key={o.id}
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-[#FAF5EF]/60 hover:bg-[#FAF5EF] transition border border-[#2D1A16]/5"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[#2D1A16]">
                          {o.orderReference}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            o.status === "paid"
                              ? "bg-emerald-100 text-emerald-800"
                              : o.status === "shipped"
                              ? "bg-blue-100 text-blue-800"
                              : o.status === "fulfilled"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-stone-100 text-stone-700"
                          }`}
                        >
                          {o.status}
                        </span>
                      </div>
                      <p className="text-xs text-[#2D1A16]/80 mt-1 font-medium">
                        {o.customerName} • {o.customerPhone}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-[#2D1A16]">
                        {formatINR(o.totalMinor)}
                      </div>
                      <div className="text-[10px] text-[#2D1A16]/50">
                        {new Date(o.createdAt).toLocaleDateString("en-IN", {
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Custom Gifting & Inquiries Leads */}
          <div className="bg-white rounded-3xl p-6 border border-[#2D1A16]/10 shadow-sm">
            <div className="flex justify-between items-center mb-5 pb-3 border-b border-[#2D1A16]/10">
              <div>
                <h2 className="font-serif text-lg font-bold text-[#2D1A16]">
                  Custom Gifting Inquiries
                </h2>
                <p className="text-xs text-[#2D1A16]/60">Bulk &amp; bespoke gift leads</p>
              </div>
              <Link
                href="/admin/inquiries"
                className="text-xs font-semibold text-[#A05A44] hover:underline"
              >
                Open CRM Leads &rarr;
              </Link>
            </div>

            {recentInquiries.length === 0 ? (
              <p className="text-xs text-[#2D1A16]/60 py-6 text-center">
                No active custom inquiries.
              </p>
            ) : (
              <div className="space-y-3">
                {recentInquiries.map((inq) => (
                  <div
                    key={inq.id}
                    className="p-3.5 rounded-2xl bg-[#FAF5EF]/60 hover:bg-[#FAF5EF] transition border border-[#2D1A16]/5"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[#2D1A16]">
                            {inq.name}
                          </span>
                          {inq.occasion && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-50 text-rose-800 font-medium">
                              {inq.occasion}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#2D1A16]/70 mt-1 line-clamp-1 italic">
                          &ldquo;{inq.message}&rdquo;
                        </p>
                      </div>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase flex-shrink-0 ${
                          inq.status === "new"
                            ? "bg-amber-100 text-amber-800"
                            : inq.status === "in_discussion"
                            ? "bg-blue-100 text-blue-800"
                            : inq.status === "quote_sent"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {inq.status.replace("_", " ")}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-[#2D1A16]/60 mt-2.5 pt-2 border-t border-[#2D1A16]/5">
                      <span>Assigned: <strong className="text-[#2D1A16]">{inq.assignedTo || "Unassigned"}</strong></span>
                      {inq.phone && (
                        <a
                          href={`https://wa.me/${inq.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                            `Hi ${inq.name}! This is Pulkit/Vivan from VAP Handicrafts regarding your custom inquiry.`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-700 font-medium hover:underline flex items-center gap-1"
                        >
                          <span>WhatsApp Chat</span>
                          <span>💬</span>
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Portal Jump Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <Link
            href="/admin/customers"
            className="p-5 rounded-2xl bg-white border border-[#2D1A16]/10 hover:border-[#A05A44] transition-all group shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="text-2xl mb-2">👥</div>
              <h3 className="font-serif font-bold text-base text-[#2D1A16] group-hover:text-[#A05A44] transition-colors">
                Customer 360° CRM
              </h3>
              <p className="text-xs text-[#2D1A16]/60 mt-1">
                Directory of repeat buyers, Lifetime Value, address book &amp; bespoke personalization histories.
              </p>
            </div>
            <div className="text-xs font-semibold text-[#A05A44] mt-4 flex items-center gap-1">
              <span>Explore Directory</span>
              <span>&rarr;</span>
            </div>
          </Link>

          <Link
            href="/admin/products"
            className="p-5 rounded-2xl bg-white border border-[#2D1A16]/10 hover:border-[#A05A44] transition-all group shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="text-2xl mb-2">💎</div>
              <h3 className="font-serif font-bold text-base text-[#2D1A16] group-hover:text-[#A05A44] transition-colors">
                Catalogue &amp; Stock CMS
              </h3>
              <p className="text-xs text-[#2D1A16]/60 mt-1">
                Add new shell jewellery items, update INR prices, manage stock quantities and fulfilment flags.
              </p>
            </div>
            <div className="text-xs font-semibold text-[#A05A44] mt-4 flex items-center gap-1">
              <span>Manage Products</span>
              <span>&rarr;</span>
            </div>
          </Link>

          <Link
            href="/admin/content"
            className="p-5 rounded-2xl bg-white border border-[#2D1A16]/10 hover:border-[#A05A44] transition-all group shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="text-2xl mb-2">✨</div>
              <h3 className="font-serif font-bold text-base text-[#2D1A16] group-hover:text-[#A05A44] transition-colors">
                Storefront &amp; Hero CMS
              </h3>
              <p className="text-xs text-[#2D1A16]/60 mt-1">
                Customize announcement banners, homepage headlines, founder narrative &amp; polaroid scrapbook visuals.
              </p>
            </div>
            <div className="text-xs font-semibold text-[#A05A44] mt-4 flex items-center gap-1">
              <span>Edit Storefront Content</span>
              <span>&rarr;</span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};
