"use client";

import React, { useState } from "react";
import { formatINR } from "@/lib/money";
import { AdminNav } from "./AdminNav";
import { CustomerProfile } from "@/server/admin/crm-cms-types";

interface AdminCustomersViewProps {
  initialCustomers: CustomerProfile[];
}

export const AdminCustomersView: React.FC<AdminCustomersViewProps> = ({
  initialCustomers,
}) => {
  const [customers, setCustomers] = useState<CustomerProfile[]>(initialCustomers);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [tagFilter, setTagFilter] = useState<string>("all");
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerProfile | null>(
    initialCustomers[0] || null
  );

  // Edit notes/tags state
  const [isEditingNotes, setIsEditingNotes] = useState<boolean>(false);
  const [currentNotes, setCurrentNotes] = useState<string>("");
  const [currentTags, setCurrentTags] = useState<string>("");
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<string>("");

  const allTags = Array.from(
    new Set(customers.flatMap((c) => c.tags))
  );

  const filteredCustomers = customers.filter((c) => {
    const matchesSearch =
      searchQuery === "" ||
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery);

    const matchesTag =
      tagFilter === "all" || c.tags.includes(tagFilter);

    return matchesSearch && matchesTag;
  });

  const handleSelectCustomer = (c: CustomerProfile) => {
    setSelectedCustomer(c);
    setCurrentNotes(c.internalNotes || "");
    setCurrentTags(c.tags.join(", "));
    setIsEditingNotes(false);
    setSaveSuccess("");
  };

  const handleSaveNotesAndTags = async () => {
    if (!selectedCustomer) return;
    setIsSaving(true);
    setSaveSuccess("");

    try {
      const parsedTags = currentTags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const res = await fetch("/api/admin/crm/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerKey: selectedCustomer.customerKey,
          tags: parsedTags,
          internalNotes: currentNotes,
        }),
      });

      const data = await res.json();
      if (data.success) {
        const updated = {
          ...selectedCustomer,
          tags: parsedTags,
          internalNotes: currentNotes,
        };
        setSelectedCustomer(updated);
        setCustomers((prev) =>
          prev.map((c) => (c.customerKey === updated.customerKey ? updated : c))
        );
        setIsEditingNotes(false);
        setSaveSuccess("Profile notes & tags updated successfully!");
        setTimeout(() => setSaveSuccess(""), 4000);
      } else {
        alert(data.error || "Failed to update profile");
      }
    } catch {
      alert("Network error updating customer");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF5EF] text-[#2D1A16] p-6 lg:p-10 font-sans">
      <div className="max-w-6xl mx-auto">
        <AdminNav currentTab="customers" />

        {/* Page Title & Search */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#2D1A16]">
                Customer 360° CRM
              </h1>
              <span className="text-xs bg-[#2D1A16]/10 text-[#2D1A16] px-2.5 py-1 rounded-full font-semibold">
                {customers.length} Profiles
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#2D1A16]/60 mt-1">
              Holistic buyer intelligence, Lifetime Value (LTV), bespoke personalization history, and direct WhatsApp links.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <input
              type="text"
              placeholder="Search by name, email, phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-4 py-2 text-xs sm:text-sm rounded-xl border border-[#2D1A16]/20 bg-white focus:outline-none focus:ring-2 focus:ring-[#A05A44] w-full sm:w-64"
            />
            <select
              value={tagFilter}
              onChange={(e) => setTagFilter(e.target.value)}
              className="px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-[#2D1A16]/20 bg-white focus:outline-none focus:ring-2 focus:ring-[#A05A44]"
            >
              <option value="all">All Tags ({allTags.length})</option>
              {allTags.map((tag) => (
                <option key={tag} value={tag}>
                  {tag}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 2-Column Split: Customer List & Customer Detail Drawer */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Customer Directory List (5 cols) */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-4 sm:p-5 border border-[#2D1A16]/10 shadow-sm h-fit max-h-[820px] overflow-y-auto">
            <h2 className="text-xs uppercase tracking-wider font-bold text-[#2D1A16]/60 mb-3 px-2">
              Customer Directory ({filteredCustomers.length})
            </h2>

            {filteredCustomers.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#2D1A16]/60">
                No customer profiles match your search criteria.
              </div>
            ) : (
              <div className="space-y-2">
                {filteredCustomers.map((c) => {
                  const isSelected = selectedCustomer?.customerKey === c.customerKey;
                  return (
                    <button
                      key={c.customerKey}
                      onClick={() => handleSelectCustomer(c)}
                      className={`w-full text-left p-3.5 rounded-2xl transition-all border ${
                        isSelected
                          ? "bg-[#2D1A16] text-[#FAF5EF] border-[#2D1A16] shadow-md"
                          : "bg-[#FAF5EF]/50 hover:bg-[#FAF5EF] border-[#2D1A16]/5 text-[#2D1A16]"
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div className="font-semibold text-sm truncate">
                          {c.name || "Anonymous Patron"}
                        </div>
                        <div
                          className={`text-xs font-bold font-mono whitespace-nowrap ${
                            isSelected ? "text-[#E5DCD3]" : "text-[#A05A44]"
                          }`}
                        >
                          {formatINR(c.totalSpendMinor)}
                        </div>
                      </div>

                      <div
                        className={`text-xs mt-1 truncate ${
                          isSelected ? "text-[#FAF5EF]/70" : "text-[#2D1A16]/60"
                        }`}
                      >
                        {c.phone || c.email}
                      </div>

                      <div className="flex items-center gap-1.5 flex-wrap mt-2">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                            isSelected
                              ? "bg-white/20 text-white"
                              : "bg-[#2D1A16]/10 text-[#2D1A16]"
                          }`}
                        >
                          {c.totalOrders} {c.totalOrders === 1 ? "order" : "orders"}
                        </span>
                        {c.tags.slice(0, 2).map((t) => (
                          <span
                            key={t}
                            className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                              isSelected
                                ? "bg-amber-300/20 text-amber-200"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Customer 360° Profile Detail (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-[#2D1A16]/10 shadow-sm">
            {!selectedCustomer ? (
              <div className="p-12 text-center text-sm text-[#2D1A16]/60">
                Select a customer profile on the left to view their 360° dossier.
              </div>
            ) : (
              <div>
                {/* Header Profile Info */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-[#2D1A16]/10">
                  <div>
                    <h2 className="font-serif text-2xl font-bold text-[#2D1A16]">
                      {selectedCustomer.name}
                    </h2>
                    <div className="text-xs text-[#2D1A16]/70 mt-1 flex flex-wrap gap-2">
                      <span>✉️ {selectedCustomer.email || "No email"}</span>
                      <span>•</span>
                      <span>📞 {selectedCustomer.phone || "No phone"}</span>
                    </div>
                  </div>

                  {selectedCustomer.phone && (
                    <a
                      href={`https://wa.me/${selectedCustomer.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                        `Hi ${selectedCustomer.name}! Reaching out from VAP Handicrafts regarding your handmade jewellery orders. Hope you are loving them!`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition shadow-sm flex items-center gap-1.5"
                    >
                      <span>Direct WhatsApp</span>
                      <span>💬</span>
                    </a>
                  )}
                </div>

                {/* Key Customer Stats */}
                <div className="grid grid-cols-3 gap-3 my-6">
                  <div className="p-3.5 rounded-2xl bg-[#FAF5EF] border border-[#2D1A16]/5">
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-[#2D1A16]/60">
                      Lifetime Spend
                    </span>
                    <div className="text-lg font-bold font-serif text-[#2D1A16] mt-1">
                      {formatINR(selectedCustomer.totalSpendMinor)}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#FAF5EF] border border-[#2D1A16]/5">
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-[#2D1A16]/60">
                      Total Orders
                    </span>
                    <div className="text-lg font-bold font-serif text-[#2D1A16] mt-1">
                      {selectedCustomer.totalOrders}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#FAF5EF] border border-[#2D1A16]/5">
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-[#2D1A16]/60">
                      First Order Date
                    </span>
                    <div className="text-xs font-semibold text-[#2D1A16] mt-2 truncate">
                      {new Date(selectedCustomer.firstOrderDate).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </div>
                  </div>
                </div>

                {/* Tags & Internal Notes Section */}
                <div className="p-5 rounded-2xl bg-amber-50/60 border border-amber-900/10 mb-6">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs uppercase font-bold text-[#A05A44] tracking-wider">
                      Internal Founder Notes &amp; Tags
                    </span>
                    {!isEditingNotes ? (
                      <button
                        onClick={() => {
                          setIsEditingNotes(true);
                          setCurrentNotes(selectedCustomer.internalNotes || "");
                          setCurrentTags(selectedCustomer.tags.join(", "));
                        }}
                        className="text-xs text-[#A05A44] font-semibold hover:underline"
                      >
                        Edit Notes &amp; Tags
                      </button>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={() => setIsEditingNotes(false)}
                          className="text-xs text-[#2D1A16]/60 hover:underline"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSaveNotesAndTags}
                          disabled={isSaving}
                          className="text-xs px-3 py-1 rounded-lg bg-[#2D1A16] text-[#FAF5EF] font-semibold hover:bg-black transition"
                        >
                          {isSaving ? "Saving..." : "Save"}
                        </button>
                      </div>
                    )}
                  </div>

                  {saveSuccess && (
                    <div className="p-2 mb-3 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-medium">
                      {saveSuccess}
                    </div>
                  )}

                  {!isEditingNotes ? (
                    <div>
                      <div className="flex flex-wrap gap-1.5 mb-2.5">
                        {selectedCustomer.tags.length === 0 ? (
                          <span className="text-xs text-[#2D1A16]/50 italic">No tags assigned.</span>
                        ) : (
                          selectedCustomer.tags.map((t) => (
                            <span
                              key={t}
                              className="text-xs px-2.5 py-0.5 rounded-full bg-amber-200/80 text-amber-900 font-semibold"
                            >
                              {t}
                            </span>
                          ))
                        )}
                      </div>
                      <p className="text-xs text-[#2D1A16]/80 leading-relaxed italic">
                        {selectedCustomer.internalNotes ||
                          "No private internal notes added yet. Click edit to record customer preferences or special packaging instructions."}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div>
                        <label className="text-[11px] font-semibold text-[#2D1A16]/70 block mb-1">
                          Tags (comma separated):
                        </label>
                        <input
                          type="text"
                          value={currentTags}
                          onChange={(e) => setCurrentTags(e.target.value)}
                          placeholder="VIP Buyer, Loves Cowrie, Corporate, Fast Delivery"
                          className="w-full px-3 py-1.5 text-xs rounded-xl border border-[#2D1A16]/20 bg-white focus:outline-none focus:ring-1 focus:ring-[#A05A44]"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-[#2D1A16]/70 block mb-1">
                          Private Workshop Notes:
                        </label>
                        <textarea
                          rows={3}
                          value={currentNotes}
                          onChange={(e) => setCurrentNotes(e.target.value)}
                          placeholder="e.g. Loves pink velvet packaging. Sent complementary polaroid keepsake card."
                          className="w-full px-3 py-2 text-xs rounded-xl border border-[#2D1A16]/20 bg-white focus:outline-none focus:ring-1 focus:ring-[#A05A44]"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Personalization History (Relationship Licences / Polaroid details) */}
                {selectedCustomer.personalizations && selectedCustomer.personalizations.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-xs uppercase font-bold text-[#2D1A16]/60 tracking-wider mb-3">
                      Bespoke Personalizations History ({selectedCustomer.personalizations.length})
                    </h3>
                    <div className="space-y-2">
                      {selectedCustomer.personalizations.map((p, idx) => (
                        <div
                          key={idx}
                          className="p-3.5 rounded-2xl bg-rose-50/70 border border-rose-900/10 text-xs"
                        >
                          <div className="flex justify-between font-semibold text-rose-950">
                            <span>Template: {p.templateType}</span>
                            <span className="font-mono text-[10px] text-rose-800">
                              Order #{p.orderReference}
                            </span>
                          </div>
                          <div className="mt-1 text-rose-900/80 space-y-0.5">
                            {p.recipientName && <div>Recipient: <strong>{p.recipientName}</strong></div>}
                            {p.licenseHolder && <div>License Holder: <strong>{p.licenseHolder}</strong></div>}
                            {p.message && <div className="italic">&ldquo;{p.message}&rdquo;</div>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Past Orders History */}
                <div>
                  <h3 className="text-xs uppercase font-bold text-[#2D1A16]/60 tracking-wider mb-3">
                    Order History ({selectedCustomer.orders.length})
                  </h3>
                  <div className="space-y-2.5">
                    {selectedCustomer.orders.map((o) => (
                      <div
                        key={o.orderReference}
                        className="p-3.5 rounded-2xl bg-[#FAF5EF]/60 border border-[#2D1A16]/5 flex items-center justify-between"
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
                                  : "bg-purple-100 text-purple-800"
                              }`}
                            >
                              {o.status}
                            </span>
                          </div>
                          <p className="text-xs text-[#2D1A16]/70 mt-1 line-clamp-1">
                            {o.itemsSummary || `${o.itemCount} items`}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-bold text-[#2D1A16]">
                            {formatINR(o.amountMinor)}
                          </div>
                          <div className="text-[10px] text-[#2D1A16]/50">
                            {new Date(o.date).toLocaleDateString("en-IN", {
                              month: "short",
                              day: "numeric",
                            })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Saved Address Book */}
                {selectedCustomer.addresses && selectedCustomer.addresses[0] && (
                  <div className="mt-6 pt-5 border-t border-[#2D1A16]/10">
                    <h3 className="text-xs uppercase font-bold text-[#2D1A16]/60 tracking-wider mb-2">
                      Shipping Address
                    </h3>
                    <div className="p-3 rounded-2xl bg-[#FAF5EF]/60 text-xs text-[#2D1A16]/80 leading-relaxed">
                      {selectedCustomer.addresses[0].fullName} • {selectedCustomer.addresses[0].streetAddress},{" "}
                      {selectedCustomer.addresses[0].city}, {selectedCustomer.addresses[0].state} -{" "}
                      {selectedCustomer.addresses[0].pincode}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
