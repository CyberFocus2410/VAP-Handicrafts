"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatINR } from "@/lib/money";
import { PackingSlipModal } from "./PackingSlipModal";

interface AdminOrder {
  id: string;
  orderReference: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: {
    fullName: string;
    streetAddress: string;
    apartment?: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  status: "pending" | "payment_initiated" | "paid" | "shipped" | "fulfilled" | "failed" | "cancelled" | "expired";
  subtotalMinor: number;
  shippingMinor: number;
  discountMinor: number;
  totalMinor: number;
  items: Array<{
    productTitle: string;
    variantTitle: string;
    quantity: number;
    priceMinor: number;
    subtotalMinor: number;
    customization?: Record<string, unknown>;
  }>;
  trackingNumber?: string;
  courierName?: string;
  shippedAt?: string;
  createdAt: string;
}

interface AdminOrdersViewProps {
  initialOrders: AdminOrder[];
}

export const AdminOrdersView: React.FC<AdminOrdersViewProps> = ({ initialOrders }) => {
  const [orders, setOrders] = useState<AdminOrder[]>(initialOrders);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedPackingSlip, setSelectedPackingSlip] = useState<AdminOrder | null>(null);

  // Shipping Modal / Inputs state
  const [shippingOrderId, setShippingOrderId] = useState<string | null>(null);
  const [courierName, setCourierName] = useState<string>("Blue Dart");
  const [trackingNumber, setTrackingNumber] = useState<string>("");
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");

  const filteredOrders = orders.filter((order) => {
    const matchesStatus =
      statusFilter === "all" ? true : order.status === statusFilter;
    const matchesSearch =
      searchQuery === ""
        ? true
        : order.orderReference.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.customerPhone.includes(searchQuery) ||
          order.customerEmail.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleMarkShipped = async (orderReference: string) => {
    if (!trackingNumber.trim() || !courierName.trim()) {
      alert("Please provide both courier name and tracking number.");
      return;
    }

    setActionLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/admin/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "mark_shipped",
          orderReference,
          courierName: courierName.trim(),
          trackingNumber: trackingNumber.trim(),
        }),
      });

      const data = await res.json();
      if (data.success && data.order) {
        setOrders((prev) =>
          prev.map((o) => (o.orderReference === orderReference ? data.order : o))
        );
        setShippingOrderId(null);
        setTrackingNumber("");
        setMessage(`Order ${orderReference} marked as shipped & buyer email enqueued!`);
      } else {
        alert(data.error || "Failed to update order");
      }
    } catch {
      alert("Network error updating order");
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkFulfilled = async (orderReference: string) => {
    setActionLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/admin/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "mark_fulfilled",
          orderReference,
        }),
      });

      const data = await res.json();
      if (data.success && data.order) {
        setOrders((prev) =>
          prev.map((o) => (o.orderReference === orderReference ? data.order : o))
        );
        setMessage(`Order ${orderReference} marked as delivered/fulfilled!`);
      } else {
        alert(data.error || "Failed to update order");
      }
    } catch {
      alert("Network error updating order");
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: AdminOrder["status"]) => {
    switch (status) {
      case "paid":
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">Paid &bull; Ready to Pack</span>;
      case "shipped":
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">Shipped</span>;
      case "fulfilled":
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">Delivered</span>;
      case "payment_initiated":
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">Payment Initiated</span>;
      case "failed":
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">Payment Failed</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-stone-100 text-stone-700">{status}</span>;
    }
  };

  const paidOrdersCount = orders.filter((o) => o.status === "paid").length;
  const shippedOrdersCount = orders.filter((o) => o.status === "shipped").length;
  const totalRevenuePaise = orders
    .filter((o) => ["paid", "shipped", "fulfilled"].includes(o.status))
    .reduce((sum, o) => sum + o.totalMinor, 0);

  return (
    <div className="min-h-screen bg-[#FAF5EF] text-[#2D1A16] p-6 lg:p-10">
      <div className="max-w-6xl mx-auto">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 relative">
              <Image
                src="/images/brand/logo.webp"
                alt="VAP Emblem"
                fill
                className="object-contain"
              />
            </div>
            <div>
              <h1 className="font-serif text-2xl font-bold text-[#2D1A16]">
                Workshop Order Management
              </h1>
              <p className="text-xs text-[#735D57]">
                Pulkit Varshney &amp; Vivan &bull; Artisan Fulfillment Dashboard
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-xs font-medium text-[#735D57] hover:text-[#2D1A16] px-3 py-2 rounded-lg border border-[#E5DCD3] bg-white transition"
            >
              &larr; View Storefront
            </Link>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-5 rounded-2xl border border-[#E5DCD3] shadow-sm">
            <div className="text-xs uppercase tracking-wider font-semibold text-[#735D57]">
              Awaiting Packaging
            </div>
            <div className="text-2xl font-bold font-serif text-[#2D1A16] mt-1">
              {paidOrdersCount}
            </div>
            <p className="text-xs text-amber-700 mt-1">Paid orders ready to handcraft &amp; ship</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#E5DCD3] shadow-sm">
            <div className="text-xs uppercase tracking-wider font-semibold text-[#735D57]">
              In Transit (Shipped)
            </div>
            <div className="text-2xl font-bold font-serif text-[#2D1A16] mt-1">
              {shippedOrdersCount}
            </div>
            <p className="text-xs text-blue-700 mt-1">Dispatched with courier partner</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#E5DCD3] shadow-sm">
            <div className="text-xs uppercase tracking-wider font-semibold text-[#735D57]">
              Total Captured Revenue
            </div>
            <div className="text-2xl font-bold font-serif text-emerald-800 mt-1">
              {formatINR(totalRevenuePaise)}
            </div>
            <p className="text-xs text-[#735D57] mt-1">Across all confirmed orders</p>
          </div>
        </div>

        {/* Toast / Alert Message */}
        {message && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-xl flex justify-between items-center">
            <span>{message}</span>
            <button
              onClick={() => setMessage("")}
              className="text-xs font-bold text-emerald-900 hover:underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Filters and Search */}
        <div className="bg-white p-4 rounded-2xl border border-[#E5DCD3] shadow-sm mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            {["all", "paid", "shipped", "fulfilled"].map((tab) => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold capitalize transition ${
                  statusFilter === tab
                    ? "bg-[#2D1A16] text-white shadow-sm"
                    : "bg-[#F5EFEB] text-[#735D57] hover:bg-[#EBE4DD]"
                }`}
              >
                {tab === "paid" ? "Awaiting Pack (Paid)" : tab}
              </button>
            ))}
          </div>

          <div className="w-full md:w-72">
            <input
              type="text"
              placeholder="Search reference, customer, phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#D5C7BC] bg-[#FAF5EF] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50"
            />
          </div>
        </div>

        {/* Orders Listing */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#E5DCD3] p-12 text-center text-[#735D57]">
            <p className="font-serif text-lg font-bold text-[#2D1A16]">No Orders Found</p>
            <p className="text-xs mt-1">
              {orders.length === 0
                ? "As customers complete checkout, their orders will appear here automatically."
                : "No orders match the selected filter criteria."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div
                key={order.orderReference}
                className="bg-white rounded-2xl border border-[#E5DCD3] shadow-sm p-6 hover:border-[#D4AF37] transition"
              >
                {/* Order Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-[#F0EBE6] pb-4 mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-[#2D1A16]">
                        {order.orderReference}
                      </span>
                      {getStatusBadge(order.status)}
                    </div>
                    <p className="text-xs text-[#735D57] mt-0.5">
                      Placed on{" "}
                      {new Date(order.createdAt).toLocaleString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      onClick={() => setSelectedPackingSlip(order)}
                      className="px-3 py-1.5 rounded-lg border border-[#D5C7BC] text-xs font-semibold text-[#2D1A16] hover:bg-[#FAF5EF] transition"
                    >
                      🖨️ Packing Slip
                    </button>

                    {order.status === "paid" && (
                      <button
                        onClick={() => setShippingOrderId(order.orderReference)}
                        className="px-3.5 py-1.5 rounded-lg bg-[#2D1A16] text-white text-xs font-semibold hover:bg-[#3D2520] transition shadow-sm"
                      >
                        🚚 Fulfill &amp; Ship
                      </button>
                    )}

                    {order.status === "shipped" && (
                      <button
                        onClick={() => handleMarkFulfilled(order.orderReference)}
                        disabled={actionLoading}
                        className="px-3.5 py-1.5 rounded-lg bg-emerald-800 text-white text-xs font-semibold hover:bg-emerald-900 transition shadow-sm"
                      >
                        ✅ Mark Delivered
                      </button>
                    )}
                  </div>
                </div>

                {/* Inline Shipping Input Form if active */}
                {shippingOrderId === order.orderReference && (
                  <div className="mb-4 p-4 bg-[#FAF7F4] rounded-xl border border-[#D4AF37] text-xs space-y-3">
                    <div className="font-bold text-[#2D1A16] flex justify-between items-center">
                      <span>Dispatch Shipment — {order.orderReference}</span>
                      <button
                        onClick={() => setShippingOrderId(null)}
                        className="text-stone-400 hover:text-stone-700"
                      >
                        ✕ Cancel
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-[#735D57] mb-1">
                          Courier Partner
                        </label>
                        <select
                          value={courierName}
                          onChange={(e) => setCourierName(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg border border-[#D5C7BC] bg-white text-[#2D1A16]"
                        >
                          <option value="Blue Dart">Blue Dart</option>
                          <option value="DTDC">DTDC</option>
                          <option value="India Post (Speed Post)">India Post (Speed Post)</option>
                          <option value="Delhivery">Delhivery</option>
                          <option value="Shiprocket">Shiprocket</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-[#735D57] mb-1">
                          AWB / Tracking Number
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. BD7839210IN"
                          value={trackingNumber}
                          onChange={(e) => setTrackingNumber(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg border border-[#D5C7BC] bg-white text-[#2D1A16]"
                        />
                      </div>
                    </div>
                    <button
                      onClick={() => handleMarkShipped(order.orderReference)}
                      disabled={actionLoading}
                      className="px-4 py-2 bg-[#2D1A16] text-white rounded-lg text-xs font-bold hover:bg-[#3D2520] transition"
                    >
                      {actionLoading ? "Updating..." : "Confirm Dispatch & Send Email to Buyer"}
                    </button>
                  </div>
                )}

                {/* Tracking info banner if shipped */}
                {order.trackingNumber && (
                  <div className="mb-4 p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-xs flex flex-wrap gap-4 items-center">
                    <div>
                      <span className="text-blue-800 font-semibold">Courier:</span>{" "}
                      <span className="font-bold text-[#2D1A16]">{order.courierName}</span>
                    </div>
                    <div>
                      <span className="text-blue-800 font-semibold">Tracking AWB:</span>{" "}
                      <span className="font-mono font-bold text-[#2D1A16]">{order.trackingNumber}</span>
                    </div>
                    {order.shippedAt && (
                      <div className="text-stone-500">
                        Dispatched: {new Date(order.shippedAt).toLocaleDateString("en-IN")}
                      </div>
                    )}
                  </div>
                )}

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
                  {/* Customer Information */}
                  <div>
                    <h3 className="font-semibold text-xs text-[#735D57] uppercase tracking-wider mb-2">
                      Customer &amp; Delivery Address
                    </h3>
                    <p className="font-bold text-[#2D1A16]">{order.customerName}</p>
                    <p className="text-[#5C4A45] leading-relaxed">
                      {order.shippingAddress.streetAddress}
                      {order.shippingAddress.apartment && `, ${order.shippingAddress.apartment}`}
                      <br />
                      {order.shippingAddress.city}, {order.shippingAddress.state} —{" "}
                      <strong>{order.shippingAddress.pincode}</strong>
                    </p>
                    <div className="mt-2 text-[#735D57] space-y-0.5">
                      <div>📞 {order.customerPhone}</div>
                      <div>✉️ {order.customerEmail}</div>
                    </div>
                  </div>

                  {/* Items Ordered */}
                  <div className="md:col-span-2">
                    <h3 className="font-semibold text-xs text-[#735D57] uppercase tracking-wider mb-2">
                      Customized Items ({order.items.length})
                    </h3>
                    <div className="space-y-3">
                      {order.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="p-3 bg-[#FAF7F4] rounded-xl border border-[#EBE4DD] flex flex-col sm:flex-row justify-between items-start gap-2"
                        >
                          <div>
                            <div className="font-bold text-sm text-[#2D1A16]">
                              {item.productTitle}
                            </div>
                            <div className="text-xs text-[#735D57]">
                              Option: {item.variantTitle} &bull; Qty: {item.quantity}
                            </div>

                            {/* Customization Details */}
                            {item.customization && (
                              <div className="mt-2 p-2 bg-[#F5EFEB] rounded-lg border border-[#E5DCD3] text-[11px] text-[#6E3F38]">
                                <span className="font-bold text-[#2D1A16] block">Personalization Attributes:</span>
                                {Object.entries(item.customization).map(([k, v]) => (
                                  <div key={k} className="mt-0.5">
                                    <span className="font-semibold capitalize">{k.replace(/([A-Z])/g, " $1")}:</span>{" "}
                                    {String(v)}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          <div className="font-bold text-sm text-[#2D1A16] sm:text-right whitespace-nowrap">
                            {formatINR(item.subtotalMinor)}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between items-center mt-3 pt-3 border-t border-[#F0EBE6] font-bold text-sm">
                      <span>Total Paid Amount:</span>
                      <span className="text-[#2D1A16] font-serif text-base">
                        {formatINR(order.totalMinor)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Printable Packing Slip Modal */}
      {selectedPackingSlip && (
        <PackingSlipModal
          order={selectedPackingSlip}
          onClose={() => setSelectedPackingSlip(null)}
        />
      )}
    </div>
  );
};
