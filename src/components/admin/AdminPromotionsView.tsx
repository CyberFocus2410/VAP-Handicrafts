"use client";

import React, { useState, useEffect } from "react";
import { AdminNav } from "./AdminNav";
import { formatINR } from "@/lib/money";
import { type ShippingConfig, type DiscountCoupon } from "@/server/admin/promotions-service";
import {
  Truck,
  Tag,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Copy,
  Percent,
  Banknote,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  RefreshCw,
} from "lucide-react";

export const AdminPromotionsView: React.FC = () => {
  const [shipping, setShipping] = useState<ShippingConfig>({
    standardShippingPaise: 9900,
    freeShippingThresholdPaise: 99900,
    freeShippingEnabled: true,
  });

  const [coupons, setCoupons] = useState<DiscountCoupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingShipping, setSavingShipping] = useState(false);
  const [shippingNotice, setShippingNotice] = useState<string | null>(null);

  // New coupon form state
  const [isCreatingCoupon, setIsCreatingCoupon] = useState(false);
  const [newCode, setNewCode] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newType, setNewType] = useState<"percentage" | "flat">("percentage");
  const [newValue, setNewValue] = useState<number>(10);
  const [newMinOrderRupees, setNewMinOrderRupees] = useState<number>(499);
  const [newIsActive, setNewIsActive] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Editable shipping form inputs in Rupees
  const [standardFeeRupees, setStandardFeeRupees] = useState<number>(99);
  const [freeThresholdRupees, setFreeThresholdRupees] = useState<number>(999);
  const [freeEnabled, setFreeEnabled] = useState<boolean>(true);

  const fetchPromotions = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/promotions");
      const data = await res.json();
      if (data.success) {
        if (data.shipping) {
          setShipping(data.shipping);
          setStandardFeeRupees(Math.round(data.shipping.standardShippingPaise / 100));
          setFreeThresholdRupees(Math.round(data.shipping.freeShippingThresholdPaise / 100));
          setFreeEnabled(data.shipping.freeShippingEnabled ?? true);
        }
        if (data.coupons) {
          setCoupons(data.coupons);
        }
      }
    } catch (err) {
      console.error("Failed to load promotions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, []);

  const handleSaveShipping = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingShipping(true);
    setShippingNotice(null);

    try {
      const payload = {
        action: "update_shipping",
        shipping: {
          standardShippingPaise: Math.max(0, Math.round(standardFeeRupees * 100)),
          freeShippingThresholdPaise: Math.max(0, Math.round(freeThresholdRupees * 100)),
          freeShippingEnabled: freeEnabled,
        },
      };

      const res = await fetch("/api/admin/promotions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setShipping(data.shipping);
        setShippingNotice("Shipping charges & scheme updated successfully!");
        setTimeout(() => setShippingNotice(null), 4000);
      } else {
        alert(data.error || "Failed to update shipping scheme");
      }
    } catch {
      alert("Error saving shipping settings");
    } finally {
      setSavingShipping(false);
    }
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const cleanCode = newCode.trim().toUpperCase();
    if (!cleanCode) {
      setFormError("Please enter a coupon code");
      return;
    }

    if (newType === "percentage" && (newValue <= 0 || newValue > 100)) {
      setFormError("Percentage discount must be between 1% and 100%");
      return;
    }

    if (newType === "flat" && newValue <= 0) {
      setFormError("Flat discount amount must be greater than ₹0");
      return;
    }

    try {
      const payload = {
        action: "create_coupon",
        coupon: {
          code: cleanCode,
          description: newDescription.trim() || undefined,
          type: newType,
          value: newType === "flat" ? Math.round(newValue * 100) : newValue,
          minOrderMinor: Math.max(0, Math.round(newMinOrderRupees * 100)),
          isActive: newIsActive,
        },
      };

      const res = await fetch("/api/admin/promotions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setCoupons((prev) => [data.coupon, ...prev.filter((c) => c.id !== data.coupon.id)]);
        setIsCreatingCoupon(false);
        setNewCode("");
        setNewDescription("");
        setNewValue(10);
        setNewMinOrderRupees(499);
      } else {
        setFormError(data.error || "Failed to create coupon");
      }
    } catch {
      setFormError("Network error while creating coupon");
    }
  };

  const handleToggleActive = async (coupon: DiscountCoupon) => {
    try {
      const res = await fetch("/api/admin/promotions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_coupon",
          id: coupon.id,
          patch: { isActive: !coupon.isActive },
        }),
      });

      const data = await res.json();
      if (data.success) {
        setCoupons((prev) =>
          prev.map((c) => (c.id === coupon.id ? { ...c, isActive: !coupon.isActive } : c))
        );
      }
    } catch {
      alert("Failed to toggle coupon status");
    }
  };

  const handleDeleteCoupon = async (id: string, code: string) => {
    if (!confirm(`Are you sure you want to delete coupon code "${code}"?`)) return;

    try {
      const res = await fetch("/api/admin/promotions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete_coupon",
          id,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setCoupons((prev) => prev.filter((c) => c.id !== id));
      }
    } catch {
      alert("Failed to delete coupon");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(text);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#FAF5EF] text-[#2D1A16] p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        <AdminNav currentTab="promotions" />

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/80 backdrop-blur-md p-6 rounded-2xl border border-[#2D1A16]/10 shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🎟️</span>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#2D1A16]">
                Shipping Schemes &amp; Coupons
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-[#2D1A16]/70 mt-1">
              Configure standard delivery charges, free shipping thresholds, and customer discount coupon codes.
            </p>
          </div>

          <button
            onClick={fetchPromotions}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#2D1A16]/15 hover:bg-[#FAF5EF] text-xs font-medium text-[#2D1A16]/80 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Grid: Shipping Scheme Card & Coupons Manager */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Shipping Configuration Card (5 cols) */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-[#2D1A16]/10 shadow-sm p-6 space-y-6">
            <div className="flex items-center gap-3 border-b border-[#2D1A16]/10 pb-4">
              <div className="p-2.5 rounded-xl bg-[#A05A44]/10 text-[#A05A44]">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-serif text-lg font-bold text-[#2D1A16]">Delivery Charges Scheme</h2>
                <p className="text-xs text-[#2D1A16]/60">Controls live cart &amp; checkout shipping fees</p>
              </div>
            </div>

            {shippingNotice && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-500/20 text-xs text-emerald-800 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{shippingNotice}</span>
              </div>
            )}

            <form onSubmit={handleSaveShipping} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#2D1A16] block">
                  Standard Delivery Fee (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-[#2D1A16]/50 font-medium">
                    ₹
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={standardFeeRupees}
                    onChange={(e) => setStandardFeeRupees(Number(e.target.value))}
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-[#2D1A16]/15 bg-[#FAF5EF]/40 text-sm focus:outline-none focus:ring-2 focus:ring-[#A05A44]/30"
                    placeholder="99"
                    required
                  />
                </div>
                <p className="text-[11px] text-[#2D1A16]/50">
                  Charged on orders below the free delivery threshold.
                </p>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-[#2D1A16] block">
                    Free Delivery Threshold (₹)
                  </label>
                  <label className="flex items-center gap-1.5 text-xs text-[#2D1A16]/70 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={freeEnabled}
                      onChange={(e) => setFreeEnabled(e.target.checked)}
                      className="rounded text-[#A05A44] focus:ring-[#A05A44]"
                    />
                    <span>Offer Free Delivery</span>
                  </label>
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-[#2D1A16]/50 font-medium">
                    ₹
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    disabled={!freeEnabled}
                    value={freeThresholdRupees}
                    onChange={(e) => setFreeThresholdRupees(Number(e.target.value))}
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-[#2D1A16]/15 bg-[#FAF5EF]/40 text-sm disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[#A05A44]/30"
                    placeholder="999"
                    required
                  />
                </div>
                <p className="text-[11px] text-[#2D1A16]/50">
                  Orders equal or above this amount get automatic 100% free delivery.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#FAF5EF] border border-[#2D1A16]/10 space-y-2 text-xs">
                <p className="font-medium text-[#2D1A16] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#A05A44]" />
                  <span>Customer Preview:</span>
                </p>
                <div className="space-y-1 text-[#2D1A16]/80 text-[11px]">
                  <p>• Orders under ₹{freeThresholdRupees}: <strong>₹{standardFeeRupees}</strong> delivery fee</p>
                  <p>
                    • Orders ₹{freeThresholdRupees} &amp; above:{" "}
                    <strong className="text-emerald-700">
                      {freeEnabled ? "FREE Delivery (₹0)" : `₹${standardFeeRupees}`}
                    </strong>
                  </p>
                </div>
              </div>

              <button
                type="submit"
                disabled={savingShipping}
                className="w-full py-2.5 px-4 rounded-xl bg-[#A05A44] hover:bg-[#8B4834] text-white font-medium text-xs shadow-sm transition-colors flex items-center justify-center gap-2"
              >
                {savingShipping ? (
                  <span>Saving Scheme...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Save Delivery Scheme</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Discount Coupons Manager (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-[#2D1A16]/10 shadow-sm p-6 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-[#2D1A16]/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700">
                  <Tag className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-serif text-lg font-bold text-[#2D1A16]">Discount Coupons</h2>
                  <p className="text-xs text-[#2D1A16]/60">
                    {coupons.length} coupon code{coupons.length === 1 ? "" : "s"} active in CRM
                  </p>
                </div>
              </div>

              {!isCreatingCoupon && (
                <button
                  type="button"
                  onClick={() => setIsCreatingCoupon(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#2D1A16] hover:bg-[#432720] text-white text-xs font-medium shadow-sm transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create New Coupon</span>
                </button>
              )}
            </div>

            {/* Create Coupon Drawer / Card */}
            {isCreatingCoupon && (
              <form
                onSubmit={handleCreateCoupon}
                className="p-5 rounded-xl border border-[#A05A44]/30 bg-[#FAF5EF]/60 space-y-4"
              >
                <div className="flex items-center justify-between border-b border-[#2D1A16]/10 pb-3">
                  <h3 className="font-serif text-sm font-bold text-[#2D1A16]">Add New Coupon Code</h3>
                  <button
                    type="button"
                    onClick={() => setIsCreatingCoupon(false)}
                    className="text-xs text-[#2D1A16]/60 hover:text-rose-600 font-semibold"
                  >
                    Cancel
                  </button>
                </div>

                {formError && (
                  <div className="flex items-center gap-2 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                    <span>{formError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#2D1A16]">Coupon Code *</label>
                    <input
                      type="text"
                      placeholder="e.g. FESTIVE20"
                      value={newCode}
                      onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                      className="w-full px-3 py-2 rounded-lg border border-[#2D1A16]/15 bg-white text-xs uppercase font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-[#A05A44]/30"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#2D1A16]">Discount Type *</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setNewType("percentage")}
                        className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium border transition-colors ${
                          newType === "percentage"
                            ? "bg-[#A05A44] text-white border-[#A05A44]"
                            : "bg-white text-[#2D1A16] border-[#2D1A16]/15 hover:bg-[#FAF5EF]"
                        }`}
                      >
                        <Percent className="w-3.5 h-3.5" />
                        <span>Percentage (%)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewType("flat")}
                        className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium border transition-colors ${
                          newType === "flat"
                            ? "bg-[#A05A44] text-white border-[#A05A44]"
                            : "bg-white text-[#2D1A16] border-[#2D1A16]/15 hover:bg-[#FAF5EF]"
                        }`}
                      >
                        <Banknote className="w-3.5 h-3.5" />
                        <span>Flat (₹)</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#2D1A16]">
                      {newType === "percentage" ? "Percentage Discount (%) *" : "Flat Discount (₹) *"}
                    </label>
                    <input
                      type="number"
                      min="1"
                      max={newType === "percentage" ? 100 : undefined}
                      value={newValue}
                      onChange={(e) => setNewValue(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg border border-[#2D1A16]/15 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-[#A05A44]/30"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#2D1A16]">
                      Minimum Order Value (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      placeholder="0 for no minimum"
                      value={newMinOrderRupees}
                      onChange={(e) => setNewMinOrderRupees(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg border border-[#2D1A16]/15 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-[#A05A44]/30"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#2D1A16]">Note / Description</label>
                  <input
                    type="text"
                    placeholder="e.g. Special festival 20% discount on orders above ₹499"
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-[#2D1A16]/15 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-[#A05A44]/30"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <label className="flex items-center gap-2 text-xs text-[#2D1A16] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newIsActive}
                      onChange={(e) => setNewIsActive(e.target.checked)}
                      className="rounded text-[#A05A44] focus:ring-[#A05A44]"
                    />
                    <span>Activate immediately</span>
                  </label>

                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-[#A05A44] hover:bg-[#8B4834] text-white text-xs font-semibold shadow-sm transition-colors"
                  >
                    Save Coupon
                  </button>
                </div>
              </form>
            )}

            {/* Coupons List */}
            {coupons.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-[#2D1A16]/15 rounded-xl bg-[#FAF5EF]/40 space-y-3">
                <Tag className="w-10 h-10 text-[#2D1A16]/30 mx-auto" />
                <p className="text-xs text-[#2D1A16]/60">
                  No discount coupons created yet. Click &ldquo;Create New Coupon&rdquo; to launch your first promotional code.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {coupons.map((coupon) => {
                  const discountDisplay =
                    coupon.type === "percentage"
                      ? `${coupon.value}% OFF`
                      : `${formatINR(coupon.value)} OFF`;

                  return (
                    <div
                      key={coupon.id}
                      className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border transition-colors ${
                        coupon.isActive
                          ? "bg-white border-[#2D1A16]/15 hover:border-[#A05A44]/40"
                          : "bg-[#FAF5EF]/60 border-[#2D1A16]/10 opacity-70"
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-bold tracking-wider text-[#2D1A16] bg-[#FAF5EF] px-2.5 py-1 rounded-md border border-[#2D1A16]/10">
                            {coupon.code}
                          </span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(coupon.code)}
                            className="text-[#2D1A16]/50 hover:text-[#A05A44] p-1"
                            title="Copy code"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          {copiedCode === coupon.code && (
                            <span className="text-[10px] text-emerald-700 font-semibold">Copied!</span>
                          )}
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                              coupon.isActive
                                ? "bg-emerald-50 text-emerald-800 border border-emerald-500/20"
                                : "bg-zinc-100 text-zinc-600 border border-zinc-200"
                            }`}
                          >
                            {coupon.isActive ? "Active" : "Paused"}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-xs text-[#2D1A16]/70 pt-0.5">
                          <span className="font-semibold text-[#A05A44]">{discountDisplay}</span>
                          <span>•</span>
                          <span>
                            {(coupon.minOrderMinor ?? 0) > 0
                              ? `Min order ${formatINR(coupon.minOrderMinor!)}`
                              : "No minimum"}
                          </span>
                          <span>•</span>
                          <span>{coupon.usageCount ?? 0} orders used</span>
                        </div>

                        {coupon.description && (
                          <p className="text-[11px] text-[#2D1A16]/50 italic">
                            {coupon.description}
                          </p>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 mt-3 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#2D1A16]/10">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(coupon)}
                          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                            coupon.isActive
                              ? "bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-300"
                              : "bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300"
                          }`}
                        >
                          {coupon.isActive ? (
                            <>
                              <ToggleRight className="w-4 h-4" />
                              <span>Pause</span>
                            </>
                          ) : (
                            <>
                              <ToggleLeft className="w-4 h-4" />
                              <span>Activate</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteCoupon(coupon.id, coupon.code)}
                          className="p-1.5 rounded-lg hover:bg-rose-50 text-[#2D1A16]/50 hover:text-rose-600 transition-colors"
                          title="Delete coupon"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
