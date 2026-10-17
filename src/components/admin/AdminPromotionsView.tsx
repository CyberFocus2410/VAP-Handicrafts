"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { AdminNav } from "./AdminNav";
import { formatINR } from "@/lib/money";
import {
  type ShippingConfig,
  type DiscountCoupon,
  type FreebieScheme,
} from "@/server/admin/promotions-service";
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
  Lock,
  Globe,
  Gift,
  Edit3,
  Users,
} from "lucide-react";

export const AdminPromotionsView: React.FC = () => {
  const [shipping, setShipping] = useState<ShippingConfig>({
    standardShippingPaise: 9900,
    freeShippingThresholdPaise: 99900,
    freeShippingEnabled: true,
  });

  const [coupons, setCoupons] = useState<DiscountCoupon[]>([]);
  const [freebies, setFreebies] = useState<FreebieScheme[]>([]);
  const [availableProducts, setAvailableProducts] = useState<
    Array<{ id: string; name: string; slug: string; priceMinor: number; imageUrl?: string }>
  >([]);

  const [loading, setLoading] = useState(true);
  const [savingShipping, setSavingShipping] = useState(false);
  const [shippingNotice, setShippingNotice] = useState<string | null>(null);

  // Active Tab
  const [activeTab, setActiveTab] = useState<"freebies" | "coupons" | "shipping">("freebies");

  // Freebie scheme form state
  const [isCreatingFreebie, setIsCreatingFreebie] = useState(false);
  const [editingFreebie, setEditingFreebie] = useState<FreebieScheme | null>(null);
  const [freebieTitle, setFreebieTitle] = useState(
    "First 11 Customers Special: Free Gift worth ₹149 on orders above ₹299"
  );
  const [freebieMinOrderRupees, setFreebieMinOrderRupees] = useState<number>(299);
  const [freebieProductName, setFreebieProductName] = useState(
    "Handcrafted Seaside Shell Charm Keepsake"
  );
  const [freebieProductSlug, setFreebieProductSlug] = useState(
    "spiral-conch-pink-crackle-bracelet"
  );
  const [freebieProductId, setFreebieProductId] = useState(
    "00000000-0000-4000-8000-000000000001"
  );
  const [freebieVariantId, setFreebieVariantId] = useState("var-freebie-001");
  const [freebieVariantName, setFreebieVariantName] = useState(
    "Complimentary Freebie Gift (Worth ₹149)"
  );
  const [freebieWorthRupees, setFreebieWorthRupees] = useState<number>(149);
  const [freebieImageUrl, setFreebieImageUrl] = useState(
    "/images/products/shell-cone-pink-crackle-bracelet.webp"
  );
  const [freebieMaxCustomers, setFreebieMaxCustomers] = useState<number>(11);
  const [freebieIsActive, setFreebieIsActive] = useState<boolean>(true);
  const [freebieIsBannerVisible, setFreebieIsBannerVisible] = useState<boolean>(true);
  const [freebieBannerText, setFreebieBannerText] = useState(
    "A freebie worth rupees 149 will be gifted free on minimum order of 299 for the first 11 customers."
  );

  // New coupon form state
  const [isCreatingCoupon, setIsCreatingCoupon] = useState(false);
  const [newCode, setNewCode] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newType, setNewType] = useState<"percentage" | "flat">("percentage");
  const [newValue, setNewValue] = useState<number>(10);
  const [newMinOrderRupees, setNewMinOrderRupees] = useState<number>(499);
  const [newIsActive, setNewIsActive] = useState(true);
  const [newIsVisibleOnStorefront, setNewIsVisibleOnStorefront] = useState(false);
  const [filterTab, setFilterTab] = useState<"all" | "secret" | "public" | "paused">("all");
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
        if (data.freebies) {
          setFreebies(data.freebies);
        }
      }
    } catch (err) {
      console.error("Failed to load promotions:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch available products from catalogue for freebie selector
  useEffect(() => {
    fetch("/api/admin/cms/products")
      .then((r) => r.json())
      .then((d) => {
        if (d.success && Array.isArray(d.products)) {
          setAvailableProducts(
            d.products.map((p: any) => ({
              id: p.id,
              name: p.name,
              slug: p.slug,
              priceMinor: p.priceMinor,
              imageUrl: p.imageUrl || p.images?.[0],
            }))
          );
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchPromotions();
  }, []);

  /* -------------------------------------------------------------------------- */
  /*                            Freebie Handlers                                */
  /* -------------------------------------------------------------------------- */

  const handleSelectProduct = (productId: string) => {
    const prod = availableProducts.find((p) => p.id === productId);
    if (!prod) return;
    setFreebieProductId(prod.id);
    setFreebieProductName(prod.name);
    setFreebieProductSlug(prod.slug);
    setFreebieWorthRupees(Math.round(prod.priceMinor / 100));
    if (prod.imageUrl) {
      setFreebieImageUrl(prod.imageUrl);
    }
    setFreebieVariantId(`var-${prod.id}`);
    setFreebieVariantName("Complimentary Freebie Gift");
  };

  const handleSaveFreebie = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!freebieTitle.trim()) {
      alert("Please enter a scheme title");
      return;
    }
    if (!freebieProductName.trim()) {
      alert("Please enter the freebie gift item name");
      return;
    }

    try {
      const payload = {
        action: editingFreebie ? "update_freebie" : "create_freebie",
        id: editingFreebie ? editingFreebie.id : undefined,
        patch: editingFreebie
          ? {
              title: freebieTitle.trim(),
              minOrderMinor: Math.round(freebieMinOrderRupees * 100),
              freebieProductName: freebieProductName.trim(),
              freebieProductSlug,
              freebieProductId,
              freebieVariantId,
              freebieVariantName,
              freebiePriceMinor: Math.round(freebieWorthRupees * 100),
              freebieImageUrl,
              maxCustomersLimit: freebieMaxCustomers,
              isActive: freebieIsActive,
              isBannerVisible: freebieIsBannerVisible,
              bannerText: freebieBannerText.trim(),
            }
          : undefined,
        freebie: !editingFreebie
          ? {
              title: freebieTitle.trim(),
              minOrderMinor: Math.round(freebieMinOrderRupees * 100),
              freebieProductName: freebieProductName.trim(),
              freebieProductSlug,
              freebieProductId,
              freebieVariantId,
              freebieVariantName,
              freebiePriceMinor: Math.round(freebieWorthRupees * 100),
              freebieImageUrl,
              maxCustomersLimit: freebieMaxCustomers,
              isActive: freebieIsActive,
              isBannerVisible: freebieIsBannerVisible,
              bannerText: freebieBannerText.trim(),
            }
          : undefined,
      };

      const res = await fetch("/api/admin/promotions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        if (editingFreebie) {
          setFreebies((prev) =>
            prev.map((f) => (f.id === editingFreebie.id ? data.freebie : f))
          );
        } else {
          setFreebies((prev) => [data.freebie, ...prev]);
        }
        setIsCreatingFreebie(false);
        setEditingFreebie(null);
      } else {
        alert(data.error || "Failed to save freebie scheme");
      }
    } catch {
      alert("Error saving freebie scheme");
    }
  };

  const handleToggleFreebiePause = async (scheme: FreebieScheme) => {
    const nextActive = !scheme.isActive;
    try {
      const res = await fetch("/api/admin/promotions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_freebie",
          id: scheme.id,
          patch: { isActive: nextActive },
        }),
      });
      const data = await res.json();
      if (data.success) {
        setFreebies((prev) =>
          prev.map((f) => (f.id === scheme.id ? { ...f, isActive: nextActive } : f))
        );
      }
    } catch {
      alert("Failed to toggle freebie scheme status");
    }
  };

  const handleDeleteFreebie = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to permanently delete the freebie scheme "${title}"?`)) return;
    try {
      const res = await fetch("/api/admin/promotions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete_freebie",
          id,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setFreebies((prev) => prev.filter((f) => f.id !== id));
      }
    } catch {
      alert("Failed to delete freebie scheme");
    }
  };

  const handleEditFreebie = (scheme: FreebieScheme) => {
    setEditingFreebie(scheme);
    setFreebieTitle(scheme.title);
    setFreebieMinOrderRupees(Math.round(scheme.minOrderMinor / 100));
    setFreebieProductName(scheme.freebieProductName);
    setFreebieProductSlug(scheme.freebieProductSlug);
    setFreebieProductId(scheme.freebieProductId);
    setFreebieVariantId(scheme.freebieVariantId);
    setFreebieVariantName(scheme.freebieVariantName);
    setFreebieWorthRupees(Math.round(scheme.freebiePriceMinor / 100));
    setFreebieImageUrl(scheme.freebieImageUrl);
    setFreebieMaxCustomers(scheme.maxCustomersLimit);
    setFreebieIsActive(scheme.isActive);
    setFreebieIsBannerVisible(scheme.isBannerVisible);
    setFreebieBannerText(scheme.bannerText);
    setIsCreatingFreebie(true);
  };

  const handleStartNewFreebie = () => {
    setEditingFreebie(null);
    setFreebieTitle("First 11 Customers Special: Free Gift worth ₹149 on orders above ₹299");
    setFreebieMinOrderRupees(299);
    setFreebieProductName("Handcrafted Seaside Shell Charm Keepsake");
    setFreebieProductSlug("spiral-conch-pink-crackle-bracelet");
    setFreebieProductId("00000000-0000-4000-8000-000000000001");
    setFreebieVariantId("var-freebie-001");
    setFreebieVariantName("Complimentary Freebie Gift (Worth ₹149)");
    setFreebieWorthRupees(149);
    setFreebieImageUrl("/images/products/shell-cone-pink-crackle-bracelet.webp");
    setFreebieMaxCustomers(11);
    setFreebieIsActive(true);
    setFreebieIsBannerVisible(true);
    setFreebieBannerText(
      "A freebie worth rupees 149 will be gifted free on minimum order of 299 for the first 11 customers."
    );
    setIsCreatingFreebie(true);
  };

  /* -------------------------------------------------------------------------- */
  /*                            Shipping Handlers                               */
  /* -------------------------------------------------------------------------- */

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

  /* -------------------------------------------------------------------------- */
  /*                            Coupon Handlers                                 */
  /* -------------------------------------------------------------------------- */

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
          isVisibleOnStorefront: newIsVisibleOnStorefront,
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
        setNewIsVisibleOnStorefront(false);
      } else {
        setFormError(data.error || "Failed to create coupon");
      }
    } catch {
      setFormError("An error occurred while creating coupon");
    }
  };

  const handleToggleActive = async (coupon: DiscountCoupon) => {
    const nextActive = !coupon.isActive;
    try {
      const res = await fetch("/api/admin/promotions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_coupon",
          id: coupon.id,
          patch: { isActive: nextActive },
        }),
      });

      const data = await res.json();
      if (data.success) {
        setCoupons((prev) =>
          prev.map((c) => (c.id === coupon.id ? { ...c, isActive: nextActive } : c))
        );
      }
    } catch {
      alert("Failed to toggle coupon status");
    }
  };

  const handleToggleVisibility = async (coupon: DiscountCoupon) => {
    const nextVisibility = !coupon.isVisibleOnStorefront;
    try {
      const res = await fetch("/api/admin/promotions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_coupon",
          id: coupon.id,
          patch: { isVisibleOnStorefront: nextVisibility },
        }),
      });

      const data = await res.json();
      if (data.success) {
        setCoupons((prev) =>
          prev.map((c) => (c.id === coupon.id ? { ...c, isVisibleOnStorefront: nextVisibility } : c))
        );
      }
    } catch {
      alert("Failed to toggle coupon visibility");
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
              <span className="text-2xl">🎁</span>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#2D1A16]">
                Promotions, Freebies &amp; Shipping
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-[#2D1A16]/70 mt-1">
              Configure freebie gift rules, top announcement banner, discount coupons, and delivery rates.
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

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-[#2D1A16]/10 pb-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab("freebies")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-xs transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === "freebies"
                ? "bg-[#2D1A16] text-white shadow-sm font-semibold"
                : "bg-white/80 text-[#2D1A16]/70 hover:bg-white"
            }`}
          >
            <Gift className="w-4 h-4 text-amber-500" />
            <span>Freebie Gift Schemes ({freebies.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("coupons")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-xs transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === "coupons"
                ? "bg-[#2D1A16] text-white shadow-sm font-semibold"
                : "bg-white/80 text-[#2D1A16]/70 hover:bg-white"
            }`}
          >
            <Tag className="w-4 h-4 text-emerald-600" />
            <span>Discount Coupons ({coupons.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("shipping")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-xs transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === "shipping"
                ? "bg-[#2D1A16] text-white shadow-sm font-semibold"
                : "bg-white/80 text-[#2D1A16]/70 hover:bg-white"
            }`}
          >
            <Truck className="w-4 h-4 text-rose-deep" />
            <span>Delivery Scheme (₹{standardFeeRupees} / Free ₹{freeThresholdRupees}+)</span>
          </button>
        </div>

        {/* ==================================================================== */}
        {/* TAB 1: FREEBIE GIFT SCHEMES                                          */}
        {/* ==================================================================== */}
        {activeTab === "freebies" && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-[#2D1A16]/10 shadow-sm p-6 space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#2D1A16]/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-700">
                    <Gift className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="font-serif text-lg font-bold text-[#2D1A16]">
                      Free Gift Schemes (Auto-Add on Cart Threshold)
                    </h2>
                    <p className="text-xs text-[#2D1A16]/60">
                      Auto-adds a complimentary gift item at ₹0 when a customer&apos;s cart subtotal reaches the required threshold.
                    </p>
                  </div>
                </div>

                {!isCreatingFreebie && (
                  <button
                    type="button"
                    onClick={handleStartNewFreebie}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2D1A16] hover:bg-[#432720] text-white text-xs font-medium shadow-sm transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create Freebie Scheme</span>
                  </button>
                )}
              </div>

              {/* Create / Edit Freebie Form */}
              {isCreatingFreebie && (
                <form
                  onSubmit={handleSaveFreebie}
                  className="p-5 sm:p-6 rounded-xl border border-amber-500/30 bg-[#FAF5EF]/60 space-y-5"
                >
                  <div className="flex items-center justify-between border-b border-[#2D1A16]/10 pb-3">
                    <h3 className="font-serif text-base font-bold text-[#2D1A16]">
                      {editingFreebie ? "Edit Freebie Offer Scheme" : "Create New Freebie Offer Scheme"}
                    </h3>
                    <button
                      type="button"
                      onClick={() => {
                        setIsCreatingFreebie(false);
                        setEditingFreebie(null);
                      }}
                      className="text-xs text-[#2D1A16]/60 hover:text-rose-600 font-semibold cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Title */}
                    <div className="sm:col-span-2 space-y-1">
                      <label className="text-xs font-semibold text-[#2D1A16]">Scheme Title *</label>
                      <input
                        type="text"
                        value={freebieTitle}
                        onChange={(e) => setFreebieTitle(e.target.value)}
                        placeholder="e.g. First 11 Customers Special: Free Gift worth ₹149 on orders above ₹299"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#2D1A16]/15 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                        required
                      />
                    </div>

                    {/* Minimum Order Threshold */}
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-[#2D1A16]">
                        Minimum Cart Order Required (₹) *
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-[#2D1A16]/50">
                          ₹
                        </span>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={freebieMinOrderRupees}
                          onChange={(e) => setFreebieMinOrderRupees(Number(e.target.value))}
                          placeholder="299"
                          className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-[#2D1A16]/15 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                          required
                        />
                      </div>
                      <p className="text-[11px] text-[#2D1A16]/50">
                        When non-freebie items reach this amount, freebie is auto-added at ₹0.
                      </p>
                    </div>

                    {/* Customer Quota Limit */}
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-[#2D1A16]">
                        Customer Limit (Usage Cap) *
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={freebieMaxCustomers}
                        onChange={(e) => setFreebieMaxCustomers(Number(e.target.value))}
                        placeholder="11"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#2D1A16]/15 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                        required
                      />
                      <p className="text-[11px] text-[#2D1A16]/50">
                        e.g. 11 customers (enter 0 for unlimited customers).
                      </p>
                    </div>

                    {/* Pick from Catalogue Dropdown */}
                    {availableProducts.length > 0 && (
                      <div className="sm:col-span-2 space-y-1">
                        <label className="text-xs font-semibold text-[#2D1A16]">
                          Quick Pick Gift Product from Catalogue
                        </label>
                        <select
                          onChange={(e) => handleSelectProduct(e.target.value)}
                          defaultValue=""
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#2D1A16]/15 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                        >
                          <option value="" disabled>
                            -- Choose an existing item or enter custom details below --
                          </option>
                          {availableProducts.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} (Worth ₹{Math.round(p.priceMinor / 100)})
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Freebie Product Name */}
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-[#2D1A16]">
                        Free Gift Product Name *
                      </label>
                      <input
                        type="text"
                        value={freebieProductName}
                        onChange={(e) => setFreebieProductName(e.target.value)}
                        placeholder="Handcrafted Seaside Shell Charm Keepsake"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#2D1A16]/15 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                        required
                      />
                    </div>

                    {/* Freebie Retail Worth */}
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-[#2D1A16]">
                        Free Gift Retail Worth (₹) *
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-[#2D1A16]/50">
                          ₹
                        </span>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={freebieWorthRupees}
                          onChange={(e) => setFreebieWorthRupees(Number(e.target.value))}
                          placeholder="149"
                          className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-[#2D1A16]/15 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                          required
                        />
                      </div>
                      <p className="text-[11px] text-[#2D1A16]/50">
                        Shown as strikethrough value (e.g. ₹149) with FREE ₹0 in the cart.
                      </p>
                    </div>

                    {/* Freebie Image URL */}
                    <div className="sm:col-span-2 space-y-1">
                      <label className="text-xs font-semibold text-[#2D1A16]">
                        Gift Item Image URL
                      </label>
                      <div className="flex gap-3 items-center">
                        <input
                          type="text"
                          value={freebieImageUrl}
                          onChange={(e) => setFreebieImageUrl(e.target.value)}
                          placeholder="/images/products/shell-cone-pink-crackle-bracelet.webp"
                          className="flex-1 px-3.5 py-2.5 rounded-xl border border-[#2D1A16]/15 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                        />
                        {freebieImageUrl && (
                          <div className="relative w-11 h-11 rounded-lg border border-border overflow-hidden bg-sand shrink-0">
                            <Image
                              src={freebieImageUrl}
                              alt="Freebie preview"
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Banner Text */}
                    <div className="sm:col-span-2 space-y-1">
                      <label className="text-xs font-semibold text-[#2D1A16]">
                        Storefront Announcement Banner Copy
                      </label>
                      <textarea
                        rows={2}
                        value={freebieBannerText}
                        onChange={(e) => setFreebieBannerText(e.target.value)}
                        placeholder="A freebie worth rupees 149 will be gifted free on minimum order of 299 for the first 11 customers."
                        className="w-full px-3.5 py-2 rounded-xl border border-[#2D1A16]/15 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                      />
                      <p className="text-[11px] text-[#2D1A16]/50">
                        Displayed in the top global announcement bar and bottom sliding bar across the storefront.
                      </p>
                    </div>

                    {/* Toggles */}
                    <div className="sm:col-span-2 flex flex-wrap gap-6 pt-2">
                      <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-[#2D1A16]">
                        <input
                          type="checkbox"
                          checked={freebieIsBannerVisible}
                          onChange={(e) => setFreebieIsBannerVisible(e.target.checked)}
                          className="rounded text-amber-600 focus:ring-amber-500"
                        />
                        <span>Display on Storefront Announcement Banner</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-[#2D1A16]">
                        <input
                          type="checkbox"
                          checked={freebieIsActive}
                          onChange={(e) => setFreebieIsActive(e.target.checked)}
                          className="rounded text-emerald-600 focus:ring-emerald-500"
                        />
                        <span>Active (Immediately enable on storefront &amp; cart)</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-3 border-t border-[#2D1A16]/10">
                    <button
                      type="button"
                      onClick={() => {
                        setIsCreatingFreebie(false);
                        setEditingFreebie(null);
                      }}
                      className="px-4 py-2 rounded-xl border border-[#2D1A16]/15 text-xs text-[#2D1A16]/80 hover:bg-sand/40 font-medium cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
                    >
                      {editingFreebie ? "Update Scheme" : "Create & Activate Scheme"}
                    </button>
                  </div>
                </form>
              )}

              {/* Freebie Schemes List */}
              {freebies.length === 0 ? (
                <div className="text-center py-12 space-y-3 bg-[#FAF5EF]/40 rounded-xl border border-dashed border-[#2D1A16]/15">
                  <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-700 flex items-center justify-center mx-auto">
                    <Gift className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-serif font-bold text-[#2D1A16]">
                    No Freebie Schemes Configured
                  </p>
                  <p className="text-xs text-[#2D1A16]/60 max-w-sm mx-auto">
                    Create a freebie scheme to gift items worth ₹149 on a minimum order of ₹299.
                  </p>
                  <button
                    type="button"
                    onClick={handleStartNewFreebie}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2D1A16] text-white text-xs font-medium shadow-sm hover:bg-[#432720] cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create First Freebie Scheme</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {freebies.map((scheme) => {
                    const minOrderRupees = Math.round(scheme.minOrderMinor / 100);
                    const worthRupees = Math.round(scheme.freebiePriceMinor / 100);
                    const claimedPercent =
                      scheme.maxCustomersLimit > 0
                        ? Math.min(100, Math.round((scheme.claimedCount / scheme.maxCustomersLimit) * 100))
                        : 0;
                    const spotsRemaining =
                      scheme.maxCustomersLimit > 0
                        ? Math.max(0, scheme.maxCustomersLimit - scheme.claimedCount)
                        : 999;

                    return (
                      <div
                        key={scheme.id}
                        className={`p-5 rounded-xl border transition-all ${
                          scheme.isActive
                            ? "bg-white border-[#2D1A16]/15 shadow-sm"
                            : "bg-[#FAF5EF]/60 border-[#2D1A16]/10 opacity-75"
                        }`}
                      >
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#2D1A16]/10 pb-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-serif text-base font-bold text-[#2D1A16]">
                                {scheme.title}
                              </h3>

                              {/* Status Badge */}
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                  scheme.isActive
                                    ? "bg-emerald-50 text-emerald-800 border border-emerald-500/20"
                                    : "bg-zinc-100 text-zinc-600 border border-zinc-200"
                                }`}
                              >
                                {scheme.isActive ? "🟢 Active (Live in Cart)" : "⏸️ Paused"}
                              </span>

                              {/* Banner Status */}
                              {scheme.isBannerVisible && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                                  <Globe className="w-3 h-3 text-blue-600" />
                                  <span>Top Banner Active</span>
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-[#2D1A16]/70">
                              Trigger: Cart subtotal ≥ <strong>₹{minOrderRupees}</strong> • Customer Quota:{" "}
                              <strong>{scheme.maxCustomersLimit > 0 ? `${scheme.maxCustomersLimit} customers` : "Unlimited"}</strong>
                            </p>
                          </div>

                          {/* Quick Actions */}
                          <div className="flex items-center gap-2">
                            {/* Pause / Resume Button */}
                            <button
                              type="button"
                              onClick={() => handleToggleFreebiePause(scheme)}
                              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                                scheme.isActive
                                  ? "bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-300"
                                  : "bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300"
                              }`}
                              title={scheme.isActive ? "Pause scheme" : "Resume scheme"}
                            >
                              {scheme.isActive ? (
                                <>
                                  <ToggleRight className="w-4 h-4 text-amber-600" />
                                  <span>Pause Scheme</span>
                                </>
                              ) : (
                                <>
                                  <ToggleLeft className="w-4 h-4 text-emerald-600" />
                                  <span>Resume Scheme</span>
                                </>
                              )}
                            </button>

                            {/* Edit Button */}
                            <button
                              type="button"
                              onClick={() => handleEditFreebie(scheme)}
                              className="p-1.5 rounded-lg border border-[#2D1A16]/15 hover:bg-[#FAF5EF] text-[#2D1A16]/70 hover:text-[#A05A44] transition-colors cursor-pointer"
                              title="Edit scheme"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>

                            {/* Delete Button */}
                            <button
                              type="button"
                              onClick={() => handleDeleteFreebie(scheme.id, scheme.title)}
                              className="p-1.5 rounded-lg border border-[#2D1A16]/15 hover:bg-rose-50 text-[#2D1A16]/60 hover:text-rose-600 transition-colors cursor-pointer"
                              title="Permanently delete scheme"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 items-center">
                          {/* Freebie Item Preview */}
                          <div className="flex items-center gap-3 bg-[#FAF5EF]/50 p-3 rounded-xl border border-[#2D1A16]/5">
                            <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-border bg-sand shrink-0">
                              <Image
                                src={scheme.freebieImageUrl || "/images/products/shell-cone-pink-crackle-bracelet.webp"}
                                alt={scheme.freebieProductName}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="min-w-0">
                              <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wide">
                                Freebie Gift Item
                              </p>
                              <p className="text-xs font-semibold text-[#2D1A16] truncate">
                                {scheme.freebieProductName}
                              </p>
                              <div className="flex items-center gap-1.5 text-[11px] mt-0.5">
                                <span className="line-through text-[#2D1A16]/50">
                                  Worth ₹{worthRupees}
                                </span>
                                <span className="font-bold text-emerald-700">₹0 in Cart</span>
                              </div>
                            </div>
                          </div>

                          {/* Quota & Customer Claims */}
                          <div className="bg-[#FAF5EF]/50 p-3 rounded-xl border border-[#2D1A16]/5 space-y-1.5">
                            <div className="flex items-center justify-between text-xs">
                              <span className="flex items-center gap-1 font-semibold text-[#2D1A16]">
                                <Users className="w-3.5 h-3.5 text-rose-deep" />
                                <span>Customer Quota</span>
                              </span>
                              <span className="font-bold text-[#A05A44]">
                                {scheme.claimedCount} / {scheme.maxCustomersLimit} Claimed
                              </span>
                            </div>
                            <div className="w-full bg-[#2D1A16]/10 rounded-full h-2 overflow-hidden">
                              <div
                                className="bg-[#A05A44] h-full rounded-full transition-all duration-500"
                                style={{ width: `${claimedPercent}%` }}
                              />
                            </div>
                            <p className="text-[10px] text-[#2D1A16]/60">
                              {spotsRemaining > 0
                                ? `${spotsRemaining} gifts remaining before cap is reached.`
                                : "All quota spots claimed!"}
                            </p>
                          </div>

                          {/* Storefront Banner Display */}
                          <div className="bg-[#FAF5EF]/50 p-3 rounded-xl border border-[#2D1A16]/5 space-y-1">
                            <p className="text-[10px] font-bold text-[#2D1A16]/70 uppercase tracking-wide">
                              Live Banner Text:
                            </p>
                            <p className="text-xs text-[#2D1A16] italic line-clamp-2">
                              &ldquo;{scheme.bannerText}&rdquo;
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 2: DISCOUNT COUPONS                                              */}
        {/* ==================================================================== */}
        {activeTab === "coupons" && (
          <div className="bg-white rounded-2xl border border-[#2D1A16]/10 shadow-sm p-6 space-y-6">
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
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#2D1A16] hover:bg-[#432720] text-white text-xs font-medium shadow-sm transition-colors cursor-pointer"
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
                    className="text-xs text-[#2D1A16]/60 hover:text-rose-600 font-semibold cursor-pointer"
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
                      value={newCode}
                      onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                      placeholder="e.g. VIP20, FESTIVE100"
                      className="w-full px-3.5 py-2 rounded-xl border border-[#2D1A16]/15 bg-white text-xs font-mono font-bold tracking-wider uppercase focus:outline-none focus:ring-2 focus:ring-[#A05A44]/30"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#2D1A16]">Discount Type *</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setNewType("percentage")}
                        className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border text-xs font-medium cursor-pointer transition-colors ${
                          newType === "percentage"
                            ? "bg-[#2D1A16] text-white border-[#2D1A16]"
                            : "bg-white text-[#2D1A16]/70 border-[#2D1A16]/15 hover:bg-[#FAF5EF]"
                        }`}
                      >
                        <Percent className="w-3.5 h-3.5" />
                        <span>Percentage (%)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewType("flat")}
                        className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border text-xs font-medium cursor-pointer transition-colors ${
                          newType === "flat"
                            ? "bg-[#2D1A16] text-white border-[#2D1A16]"
                            : "bg-white text-[#2D1A16]/70 border-[#2D1A16]/15 hover:bg-[#FAF5EF]"
                        }`}
                      >
                        <Banknote className="w-3.5 h-3.5" />
                        <span>Flat Rupees (₹)</span>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#2D1A16]">
                      {newType === "percentage" ? "Percentage Discount (%)" : "Flat Discount (₹)"} *
                    </label>
                    <input
                      type="number"
                      min="1"
                      max={newType === "percentage" ? 100 : 5000}
                      step="1"
                      value={newValue}
                      onChange={(e) => setNewValue(Number(e.target.value))}
                      placeholder={newType === "percentage" ? "10" : "100"}
                      className="w-full px-3.5 py-2 rounded-xl border border-[#2D1A16]/15 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-[#A05A44]/30"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#2D1A16]">
                      Minimum Order Subtotal (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={newMinOrderRupees}
                      onChange={(e) => setNewMinOrderRupees(Number(e.target.value))}
                      placeholder="499"
                      className="w-full px-3.5 py-2 rounded-xl border border-[#2D1A16]/15 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-[#A05A44]/30"
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-xs font-semibold text-[#2D1A16]">
                      Description / Purpose (Optional)
                    </label>
                    <input
                      type="text"
                      value={newDescription}
                      onChange={(e) => setNewDescription(e.target.value)}
                      placeholder="e.g. 10% off for first-time website patrons"
                      className="w-full px-3.5 py-2 rounded-xl border border-[#2D1A16]/15 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-[#A05A44]/30"
                    />
                  </div>

                  <div className="sm:col-span-2 p-3.5 rounded-xl border border-blue-200 bg-blue-50/60 flex items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 font-semibold text-xs text-blue-900">
                        {newIsVisibleOnStorefront ? (
                          <>
                            <Globe className="w-4 h-4 text-blue-600" />
                            <span>Public Storefront Offer</span>
                          </>
                        ) : (
                          <>
                            <Lock className="w-4 h-4 text-purple-600" />
                            <span>Secret / VIP Coupon</span>
                          </>
                        )}
                      </div>
                      <p className="text-[11px] text-blue-800/80">
                        {newIsVisibleOnStorefront
                          ? "Displays publicly as a clickable chip on live Cart Drawer & Cart page for all customers."
                          : "Hidden from site. Customer must type or paste the code manually."}
                      </p>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        checked={newIsVisibleOnStorefront}
                        onChange={(e) => setNewIsVisibleOnStorefront(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-zinc-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-[#2D1A16]/10">
                  <button
                    type="button"
                    onClick={() => setIsCreatingCoupon(false)}
                    className="px-4 py-2 rounded-xl border border-[#2D1A16]/15 text-xs text-[#2D1A16]/80 hover:bg-sand/40 font-medium cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#2D1A16] hover:bg-[#432720] text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
                  >
                    Save Coupon
                  </button>
                </div>
              </form>
            )}

            {/* Coupons List */}
            <div className="space-y-3">
              {coupons.map((coupon) => {
                const discountDisplay =
                  coupon.type === "percentage" ? `${coupon.value}% OFF` : `₹${coupon.value} OFF`;

                return (
                  <div
                    key={coupon.id}
                    className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-colors ${
                      coupon.isActive
                        ? "bg-white border-[#2D1A16]/15 shadow-2xs hover:border-[#2D1A16]/25"
                        : "bg-[#FAF5EF]/60 border-[#2D1A16]/10 opacity-70"
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-sm font-bold tracking-wider text-[#2D1A16] bg-[#FAF5EF] px-2.5 py-1 rounded-md border border-[#2D1A16]/10">
                          {coupon.code}
                        </span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(coupon.code)}
                          className="text-[#2D1A16]/50 hover:text-[#A05A44] p-1 transition-colors cursor-pointer"
                          title="Copy code"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        {copiedCode === coupon.code && (
                          <span className="text-[10px] text-emerald-700 font-semibold animate-pulse">
                            Copied!
                          </span>
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

                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide ${
                            coupon.isVisibleOnStorefront
                              ? "bg-blue-50 text-blue-800 border border-blue-200"
                              : "bg-purple-50 text-purple-800 border border-purple-200"
                          }`}
                        >
                          {coupon.isVisibleOnStorefront ? (
                            <>
                              <Globe className="w-3 h-3 text-blue-600" />
                              <span>Public</span>
                            </>
                          ) : (
                            <>
                              <Lock className="w-3 h-3 text-purple-600" />
                              <span>Secret VIP</span>
                            </>
                          )}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-[#2D1A16]/70 pt-0.5">
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
                        <p className="text-[11px] text-[#2D1A16]/60 italic">
                          {coupon.description}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mt-3 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#2D1A16]/10">
                      <button
                        type="button"
                        onClick={() => handleToggleVisibility(coupon)}
                        className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                          coupon.isVisibleOnStorefront
                            ? "bg-purple-50 hover:bg-purple-100 text-purple-800 border-purple-200"
                            : "bg-blue-50 hover:bg-blue-100 text-blue-800 border-blue-200"
                        }`}
                      >
                        {coupon.isVisibleOnStorefront ? (
                          <>
                            <Lock className="w-3.5 h-3.5" />
                            <span>Make Secret</span>
                          </>
                        ) : (
                          <>
                            <Globe className="w-3.5 h-3.5" />
                            <span>Make Public</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleToggleActive(coupon)}
                        className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
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
                        className="p-1.5 rounded-lg hover:bg-rose-50 text-[#2D1A16]/50 hover:text-rose-600 transition-colors cursor-pointer"
                        title="Delete coupon"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 3: SHIPPING CONFIGURATION                                        */}
        {/* ==================================================================== */}
        {activeTab === "shipping" && (
          <div className="max-w-2xl bg-white rounded-2xl border border-[#2D1A16]/10 shadow-sm p-6 space-y-6">
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
                className="w-full py-2.5 px-4 rounded-xl bg-[#A05A44] hover:bg-[#8B4834] text-white font-medium text-xs shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
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
        )}
      </div>
    </div>
  );
};
