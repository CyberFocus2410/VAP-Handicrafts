"use client";

import React, { useState } from "react";
import { formatINR } from "@/lib/money";
import { AdminNav } from "./AdminNav";
import { CustomerInquiry, InquiryStatus } from "@/server/admin/crm-cms-types";

interface AdminInquiriesViewProps {
  initialInquiries: CustomerInquiry[];
}

export const AdminInquiriesView: React.FC<AdminInquiriesViewProps> = ({
  initialInquiries,
}) => {
  const [inquiries, setInquiries] = useState<CustomerInquiry[]>(initialInquiries);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedInquiry, setSelectedInquiry] = useState<CustomerInquiry | null>(
    initialInquiries[0] || null
  );
  const [mobileTab, setMobileTab] = useState<"leads" | "detail">("leads");

  // Edit / Update lead states
  const [editStatus, setEditStatus] = useState<InquiryStatus>("new");
  const [editAssignedTo, setEditAssignedTo] = useState<string>("Pulkit Garg");
  const [editQuoteRupees, setEditQuoteRupees] = useState<string>("");
  const [editNotes, setEditNotes] = useState<string>("");
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [notification, setNotification] = useState<string>("");

  // Create new lead modal
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [newName, setNewName] = useState<string>("");
  const [newEmail, setNewEmail] = useState<string>("");
  const [newPhone, setNewPhone] = useState<string>("");
  const [newOccasion, setNewOccasion] = useState<string>("");
  const [newMessage, setNewMessage] = useState<string>("");
  const [isCreating, setIsCreating] = useState<boolean>(false);

  const filtered = inquiries.filter((inq) => {
    const matchesStatus = statusFilter === "all" || inq.status === statusFilter;
    const matchesSearch =
      searchQuery === "" ||
      inq.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inq.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (inq.phone && inq.phone.includes(searchQuery)) ||
      (inq.occasion && inq.occasion.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesStatus && matchesSearch;
  });

  const handleSelectInquiry = (inq: CustomerInquiry) => {
    setSelectedInquiry(inq);
    setEditStatus(inq.status);
    setEditAssignedTo(inq.assignedTo || "Pulkit Garg");
    setEditQuoteRupees(inq.quoteMinor ? String(inq.quoteMinor / 100) : "");
    setEditNotes(inq.internalNotes || "");
    setNotification("");
    setMobileTab("detail");
  };

  const handleUpdateInquiry = async () => {
    if (!selectedInquiry) return;
    setIsUpdating(true);
    setNotification("");

    try {
      const quotePaise = editQuoteRupees.trim() ? Math.round(Number(editQuoteRupees) * 100) : undefined;
      const patch = {
        status: editStatus,
        assignedTo: editAssignedTo,
        quoteMinor: quotePaise,
        internalNotes: editNotes,
      };

      const res = await fetch("/api/admin/crm/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update",
          id: selectedInquiry.id,
          patch,
        }),
      });

      const data = await res.json();
      if (data.success && data.inquiry) {
        setSelectedInquiry(data.inquiry);
        setInquiries((prev) =>
          prev.map((i) => (i.id === data.inquiry.id ? data.inquiry : i))
        );
        setNotification("Lead successfully updated!");
        setTimeout(() => setNotification(""), 4000);
      } else {
        alert(data.error || "Failed to update inquiry");
      }
    } catch {
      alert("Network error updating inquiry");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteInquiry = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete inquiry from "${name}"?`)) return;
    try {
      const res = await fetch("/api/admin/crm/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", id }),
      });
      const data = await res.json();
      if (data.success) {
        setInquiries((prev) => prev.filter((i) => i.id !== id));
        if (selectedInquiry?.id === id) {
          setSelectedInquiry(null);
          setMobileTab("leads");
        }
      } else {
        alert(data.error || "Failed to delete inquiry");
      }
    } catch {
      alert("Network error deleting inquiry");
    }
  };

  const handleCreateInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim() || !newMessage.trim()) {
      alert("Name, email and message are required.");
      return;
    }

    setIsCreating(true);
    try {
      const res = await fetch("/api/admin/crm/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          newInquiry: {
            name: newName.trim(),
            email: newEmail.trim(),
            phone: newPhone.trim() || undefined,
            occasion: newOccasion.trim() || undefined,
            message: newMessage.trim(),
          },
        }),
      });

      const data = await res.json();
      if (data.success && data.inquiry) {
        setInquiries((prev) => [data.inquiry, ...prev]);
        setSelectedInquiry(data.inquiry);
        setShowCreateModal(false);
        setNewName("");
        setNewEmail("");
        setNewPhone("");
        setNewOccasion("");
        setNewMessage("");
        setNotification("New custom inquiry lead added to pipeline!");
        setTimeout(() => setNotification(""), 4000);
      } else {
        alert(data.error || "Failed to create inquiry");
      }
    } catch {
      alert("Network error creating inquiry");
    } finally {
      setIsCreating(false);
    }
  };

  const getStatusBadge = (status: InquiryStatus) => {
    switch (status) {
      case "new":
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">New Lead</span>;
      case "in_discussion":
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">In Discussion</span>;
      case "quote_sent":
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">Quote Sent</span>;
      case "converted":
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">Converted</span>;
      case "closed":
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-stone-100 text-stone-700">Closed</span>;
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF5EF] text-[#2D1A16] p-4 sm:p-6 lg:p-10 font-sans pb-24 md:pb-12">
      <div className="max-w-6xl mx-auto">
        <AdminNav currentTab="inquiries" />

        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#2D1A16]">
                Custom Gifting &amp; Inquiries Pipeline
              </h1>
              <span className="text-xs bg-[#2D1A16]/10 text-[#2D1A16] px-2.5 py-1 rounded-full font-semibold">
                {inquiries.length} Leads
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#2D1A16]/60 mt-1">
              Manage custom bulk wedding favours, anniversary surprises, quotes, and founder follow-ups.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={() => setShowCreateModal(true)}
              className="w-full sm:w-auto px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-[#2D1A16] text-[#FAF5EF] hover:bg-black transition shadow-sm text-center"
            >
              + Log New Lead
            </button>
          </div>
        </div>

        {/* Mobile View Switcher */}
        <div className="flex lg:hidden bg-white p-1 rounded-2xl border border-[#2D1A16]/10 mb-5 shadow-sm">
          <button
            onClick={() => setMobileTab("leads")}
            className={`flex-1 py-2 text-xs font-semibold rounded-xl transition ${
              mobileTab === "leads"
                ? "bg-[#2D1A16] text-[#FAF5EF] shadow-sm"
                : "text-[#2D1A16]/70 hover:bg-[#FAF5EF]"
            }`}
          >
            📋 Leads ({filtered.length})
          </button>
          <button
            onClick={() => setMobileTab("detail")}
            className={`flex-1 py-2 text-xs font-semibold rounded-xl transition ${
              mobileTab === "detail"
                ? "bg-[#2D1A16] text-[#FAF5EF] shadow-sm"
                : "text-[#2D1A16]/70 hover:bg-[#FAF5EF]"
            }`}
          >
            📝 Lead Details
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-6 bg-white p-3.5 rounded-2xl border border-[#2D1A16]/10">
          <input
            type="text"
            placeholder="Search leads by name, email, occasion..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-3.5 py-1.5 text-xs sm:text-sm rounded-xl border border-[#2D1A16]/20 bg-[#FAF5EF]/50 focus:outline-none focus:ring-1 focus:ring-[#A05A44] flex-1 min-w-[200px]"
          />

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {(["all", "new", "in_discussion", "quote_sent", "converted", "closed"] as const).map(
              (st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition whitespace-nowrap ${
                    statusFilter === st
                      ? "bg-[#2D1A16] text-[#FAF5EF]"
                      : "bg-[#FAF5EF] text-[#2D1A16]/70 hover:text-[#2D1A16]"
                  }`}
                >
                  {st === "all" ? "All" : st.replace("_", " ")}
                </button>
              )
            )}
          </div>
        </div>

        {notification && (
          <div className="mb-6 p-3 rounded-2xl bg-emerald-100 text-emerald-800 text-xs font-semibold">
            {notification}
          </div>
        )}

        {/* 2-Column Split: Pipeline List & Lead Detail Editor */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Leads List (5 cols) */}
          <div
            className={`lg:col-span-5 bg-white rounded-3xl p-4 sm:p-5 border border-[#2D1A16]/10 shadow-sm max-h-[820px] overflow-y-auto ${
              mobileTab === "leads" ? "block" : "hidden lg:block"
            }`}
          >
            <h2 className="text-xs uppercase tracking-wider font-bold text-[#2D1A16]/60 mb-3 px-2">
              Inquiries Pipeline ({filtered.length})
            </h2>

            {filtered.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#2D1A16]/60">
                No inquiries matching filter.
              </div>
            ) : (
              <div className="space-y-2.5">
                {filtered.map((inq) => {
                  const isSelected = selectedInquiry?.id === inq.id;
                  return (
                    <button
                      key={inq.id}
                      onClick={() => handleSelectInquiry(inq)}
                      className={`w-full text-left p-3.5 rounded-2xl transition-all border ${
                        isSelected
                          ? "bg-[#2D1A16] text-[#FAF5EF] border-[#2D1A16] shadow-md"
                          : "bg-[#FAF5EF]/50 hover:bg-[#FAF5EF] border-[#2D1A16]/5 text-[#2D1A16]"
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div className="font-semibold text-sm truncate">{inq.name}</div>
                        <div className="flex-shrink-0">
                          {isSelected ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/20 text-white uppercase">
                              {inq.status.replace("_", " ")}
                            </span>
                          ) : (
                            getStatusBadge(inq.status)
                          )}
                        </div>
                      </div>

                      {inq.occasion && (
                        <div
                          className={`text-xs mt-1 font-medium truncate ${
                            isSelected ? "text-amber-200" : "text-[#A05A44]"
                          }`}
                        >
                          🎉 {inq.occasion}
                        </div>
                      )}

                      <p
                        className={`text-xs mt-1.5 line-clamp-2 italic ${
                          isSelected ? "text-[#FAF5EF]/80" : "text-[#2D1A16]/70"
                        }`}
                      >
                        &ldquo;{inq.message}&rdquo;
                      </p>

                      <div className="flex items-center justify-between text-[11px] mt-2.5 pt-2 border-t border-white/10">
                        <span className={isSelected ? "text-white/60" : "text-[#2D1A16]/50"}>
                          Assigned: {inq.assignedTo || "None"}
                        </span>
                        {inq.quoteMinor && (
                          <span
                            className={`font-mono font-bold ${
                              isSelected ? "text-emerald-300" : "text-emerald-800"
                            }`}
                          >
                            {formatINR(inq.quoteMinor)}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Lead Detail & Founder Actions (7 cols) */}
          <div
            className={`lg:col-span-7 bg-white rounded-3xl p-5 sm:p-8 border border-[#2D1A16]/10 shadow-sm ${
              mobileTab === "detail" ? "block" : "hidden lg:block"
            }`}
          >
            {/* Mobile Back Button */}
            <button
              onClick={() => setMobileTab("leads")}
              className="lg:hidden mb-4 text-xs font-semibold text-[#A05A44] hover:underline flex items-center gap-1.5"
            >
              ← Back to Pipeline Leads
            </button>

            {!selectedInquiry ? (
              <div className="p-12 text-center text-sm text-[#2D1A16]/60">
                Select an inquiry from the list to view lead details and assign actions.
              </div>
            ) : (
              <div>
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-5 border-b border-[#2D1A16]/10">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#2D1A16]">
                        {selectedInquiry.name}
                      </h2>
                      {getStatusBadge(selectedInquiry.status)}
                    </div>
                    <div className="text-xs text-[#2D1A16]/70 mt-1 flex flex-wrap items-center gap-2">
                      <span>✉️ {selectedInquiry.email}</span>
                      {selectedInquiry.phone && (
                        <>
                          <span>•</span>
                          <span>📞 {selectedInquiry.phone}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {selectedInquiry.phone && (
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <a
                        href={`tel:${selectedInquiry.phone}`}
                        className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-stone-100 text-[#2D1A16] text-xs font-semibold hover:bg-stone-200 transition text-center"
                      >
                        📞 Call
                      </a>
                      <a
                        href={`https://wa.me/${selectedInquiry.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                          `Hi ${selectedInquiry.name}! This is Pulkit/Vivan from VAP Handicrafts regarding your custom inquiry: "${selectedInquiry.occasion || "bespoke jewellery/cards"}". Happy to share catalogue options!`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition shadow-sm flex items-center justify-center gap-1.5"
                      >
                        <span>WhatsApp</span>
                        <span>💬</span>
                      </a>
                    </div>
                  )}
                </div>

                {/* Inquiry Request Content */}
                <div className="my-6 p-4 rounded-2xl bg-[#FAF5EF] border border-[#2D1A16]/5">
                  <div className="text-[11px] uppercase tracking-wider font-bold text-[#A05A44] mb-1">
                    Occasion &amp; Customer Message:
                  </div>
                  {selectedInquiry.occasion && (
                    <div className="text-sm font-semibold text-[#2D1A16] mb-2">
                      {selectedInquiry.occasion}
                    </div>
                  )}
                  <p className="text-xs sm:text-sm text-[#2D1A16]/80 leading-relaxed italic bg-white p-3 rounded-xl border border-[#2D1A16]/10">
                    &ldquo;{selectedInquiry.message}&rdquo;
                  </p>
                  <div className="text-[10px] text-[#2D1A16]/50 mt-2">
                    Submitted on:{" "}
                    {new Date(selectedInquiry.createdAt).toLocaleString("en-IN", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </div>
                </div>

                {/* Founder Action Form */}
                <div className="p-5 rounded-2xl bg-stone-50 border border-[#2D1A16]/10 space-y-4">
                  <h3 className="text-xs uppercase font-bold text-[#2D1A16] tracking-wider">
                    Pipeline Controls &amp; Quotation
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[11px] font-semibold text-[#2D1A16]/70 block mb-1">
                        Lead Status:
                      </label>
                      <select
                        value={editStatus}
                        onChange={(e) => setEditStatus(e.target.value as InquiryStatus)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-[#2D1A16]/20 bg-white focus:outline-none focus:ring-1 focus:ring-[#A05A44]"
                      >
                        <option value="new">New Lead</option>
                        <option value="in_discussion">In Discussion</option>
                        <option value="quote_sent">Quote Sent</option>
                        <option value="converted">Converted (Order Placed)</option>
                        <option value="closed">Closed / Cancelled</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-[#2D1A16]/70 block mb-1">
                        Assigned Founder:
                      </label>
                      <select
                        value={editAssignedTo}
                        onChange={(e) => setEditAssignedTo(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-[#2D1A16]/20 bg-white focus:outline-none focus:ring-1 focus:ring-[#A05A44]"
                      >
                        <option value="Pulkit Garg">Pulkit Garg</option>
                        <option value="Vivan Mittal">Vivan Mittal</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-[#2D1A16]/70 block mb-1">
                      Quoted Total (₹ INR):
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 3500 for ₹3,500"
                      value={editQuoteRupees}
                      onChange={(e) => setEditQuoteRupees(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-[#2D1A16]/20 bg-white focus:outline-none focus:ring-1 focus:ring-[#A05A44]"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-[#2D1A16]/70 block mb-1">
                      Internal Founder Notes &amp; Next Steps:
                    </label>
                    <textarea
                      rows={3}
                      value={editNotes}
                      onChange={(e) => setEditNotes(e.target.value)}
                      placeholder="e.g. Sent sample pictures of cowrie bracelet set. Client agreed on 25 pieces; waiting for final name list."
                      className="w-full px-3 py-2 text-xs rounded-xl border border-[#2D1A16]/20 bg-white focus:outline-none focus:ring-1 focus:ring-[#A05A44]"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={handleUpdateInquiry}
                      disabled={isUpdating}
                      className="flex-1 py-2.5 rounded-xl bg-[#2D1A16] text-[#FAF5EF] text-xs font-semibold hover:bg-black transition shadow-sm"
                    >
                      {isUpdating ? "Updating..." : "Save Lead Updates"}
                    </button>
                    <button
                      onClick={() => handleDeleteInquiry(selectedInquiry.id, selectedInquiry.name)}
                      disabled={isUpdating}
                      className="px-3 py-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold hover:bg-rose-100 transition"
                      title="Delete this lead"
                    >
                      Delete Lead
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal: Log New Lead */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-[#2D1A16]/10 shadow-2xl">
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-[#2D1A16]/10">
                <h3 className="font-serif text-xl font-bold text-[#2D1A16]">
                  Log New Custom Lead
                </h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-stone-400 hover:text-stone-700 text-lg"
                >
                  &times;
                </button>
              </div>

              <form onSubmit={handleCreateInquiry} className="space-y-3.5">
                <div>
                  <label className="text-[11px] font-semibold text-[#2D1A16]/70 block mb-1">
                    Patron Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Ananya Sharma"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#2D1A16]/20 focus:outline-none focus:ring-1 focus:ring-[#A05A44]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-[#2D1A16]/70 block mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="patron@gmail.com"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-[#2D1A16]/20 focus:outline-none focus:ring-1 focus:ring-[#A05A44]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-[#2D1A16]/70 block mb-1">
                      Phone / WhatsApp
                    </label>
                    <input
                      type="text"
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-[#2D1A16]/20 focus:outline-none focus:ring-1 focus:ring-[#A05A44]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[#2D1A16]/70 block mb-1">
                    Occasion / Requirement
                  </label>
                  <input
                    type="text"
                    value={newOccasion}
                    onChange={(e) => setNewOccasion(e.target.value)}
                    placeholder="e.g. Wedding Favours / Valentine's Card"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#2D1A16]/20 focus:outline-none focus:ring-1 focus:ring-[#A05A44]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[#2D1A16]/70 block mb-1">
                    Request Details *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Details about items, quantity, customizations, timeline..."
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#2D1A16]/20 focus:outline-none focus:ring-1 focus:ring-[#A05A44]"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-[#2D1A16]/60 hover:bg-stone-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreating}
                    className="px-5 py-2 rounded-xl text-xs font-semibold bg-[#2D1A16] text-[#FAF5EF] hover:bg-black transition shadow-sm"
                  >
                    {isCreating ? "Saving..." : "Add Lead"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
