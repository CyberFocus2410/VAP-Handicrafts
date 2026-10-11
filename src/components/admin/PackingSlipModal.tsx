"use client";

import React from "react";
import { formatINR } from "@/lib/money";

interface PackingSlipProps {
  order: {
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
    items: Array<{
      productTitle: string;
      variantTitle: string;
      quantity: number;
      priceMinor: number;
      subtotalMinor: number;
      customization?: Record<string, unknown>;
    }>;
    totalMinor: number;
    createdAt: string;
    trackingNumber?: string;
    courierName?: string;
  };
  onClose: () => void;
}

export const PackingSlipModal: React.FC<PackingSlipProps> = ({ order, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-8 relative shadow-2xl print:p-0 print:shadow-none print:max-w-none print:w-full print:border-none">
        {/* Screen Action Bar (hidden in print) */}
        <div className="flex justify-between items-center mb-6 border-b pb-4 print:hidden">
          <h2 className="font-serif text-lg font-bold text-[#2D1A16]">
            Workshop Packing Slip
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 bg-[#2D1A16] text-white rounded-lg text-sm font-medium hover:bg-[#3D2520] transition"
            >
              🖨️ Print Packing Slip
            </button>
            <button
              onClick={onClose}
              className="px-3 py-1.5 border border-stone-300 rounded-lg text-sm text-stone-600 hover:bg-stone-50"
            >
              Close
            </button>
          </div>
        </div>

        {/* Printable Packing Slip Area */}
        <div className="print:p-6 text-[#2D1A16]">
          {/* Header */}
          <div className="flex justify-between items-start border-b border-[#2D1A16] pb-4 mb-6">
            <div>
              <h1 className="font-serif text-2xl font-bold tracking-tight text-[#2D1A16]">
                VAP HANDICRAFTS
              </h1>
              <p className="text-xs uppercase tracking-wider text-[#735D57]">
                Handmade Shell Jewellery &bull; Personalized Keepsakes
              </p>
              <p className="text-xs text-[#735D57] mt-1">
                Workshop: Pulkit Varshney &amp; Vivan &bull; +91 93685 02623 / +91 87550 51423
              </p>
            </div>
            <div className="text-right">
              <span className="inline-block bg-[#FAF5EF] border border-[#E5DCD3] px-3 py-1 rounded text-xs font-mono font-bold">
                {order.orderReference}
              </span>
              <p className="text-xs text-[#735D57] mt-1">
                Date: {new Date(order.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>

          {/* Delivery & Dispatch Summary */}
          <div className="grid grid-cols-2 gap-6 mb-6 p-4 bg-[#FAF7F4] rounded-xl border border-[#EBE4DD] text-xs">
            <div>
              <span className="font-bold uppercase tracking-wider text-[#735D57] block mb-1">
                Ship To
              </span>
              <p className="font-bold text-sm text-[#2D1A16]">
                {order.shippingAddress.fullName}
              </p>
              <p className="text-[#5C4A45] leading-relaxed">
                {order.shippingAddress.streetAddress}
                {order.shippingAddress.apartment && `, ${order.shippingAddress.apartment}`}
                <br />
                {order.shippingAddress.city}, {order.shippingAddress.state} —{" "}
                <span className="font-bold text-[#2D1A16]">{order.shippingAddress.pincode}</span>
                <br />
                Phone: {order.customerPhone}
              </p>
            </div>
            <div>
              <span className="font-bold uppercase tracking-wider text-[#735D57] block mb-1">
                Shipment Information
              </span>
              <p className="text-[#5C4A45]">
                Courier: <strong>{order.courierName || "To be dispatched"}</strong>
              </p>
              <p className="text-[#5C4A45] font-mono">
                Tracking: <strong>{order.trackingNumber || "Pending"}</strong>
              </p>
              <p className="text-[#5C4A45] mt-1">
                Payment: <strong className="text-emerald-700">PAID {formatINR(order.totalMinor)}</strong> (Online UPI/Paytm)
              </p>
            </div>
          </div>

          {/* Items Table */}
          <table className="w-full text-left text-xs mb-6 border-collapse">
            <thead>
              <tr className="border-b-2 border-[#2D1A16] text-[#735D57] uppercase tracking-wider">
                <th className="py-2">Item Description &amp; Customization Specs</th>
                <th className="py-2 text-center">Qty</th>
                <th className="py-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBE4DD]">
              {order.items.map((item, idx) => (
                <tr key={idx}>
                  <td className="py-3 pr-4">
                    <p className="font-bold text-sm text-[#2D1A16]">{item.productTitle}</p>
                    <p className="text-xs text-[#735D57]">Option: {item.variantTitle}</p>

                    {item.customization && (
                      <div className="mt-2 p-2 bg-[#F5EFEB] rounded border border-[#E5DCD3] text-[11px] leading-relaxed text-[#6E3F38]">
                        <strong className="block mb-0.5 text-[#2D1A16]">Customization Details:</strong>
                        {Object.entries(item.customization).map(([k, v]) => (
                          <div key={k}>
                            <span className="font-semibold capitalize">{k.replace(/([A-Z])/g, " $1")}:</span>{" "}
                            {String(v)}
                          </div>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="py-3 text-center align-top font-bold text-sm">{item.quantity}</td>
                  <td className="py-3 text-right align-top font-bold text-sm">
                    {formatINR(item.subtotalMinor)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Verification Checklist */}
          <div className="border-t border-[#2D1A16] pt-4 mt-8 grid grid-cols-2 gap-4 text-xs">
            <div>
              <p className="font-bold mb-2 uppercase text-[#735D57]">Workshop Quality Check</p>
              <label className="flex items-center gap-2 text-stone-700 mb-1">
                <input type="checkbox" defaultChecked className="rounded text-[#2D1A16]" />
                Crafting &amp; Personalization accuracy verified
              </label>
              <label className="flex items-center gap-2 text-stone-700 mb-1">
                <input type="checkbox" defaultChecked className="rounded text-[#2D1A16]" />
                Protective shell bubble sleeve applied
              </label>
              <label className="flex items-center gap-2 text-stone-700">
                <input type="checkbox" defaultChecked className="rounded text-[#2D1A16]" />
                VAP ribbon &amp; wax seal affixed
              </label>
            </div>
            <div className="text-right flex flex-col justify-end">
              <div className="border-t border-stone-400 w-48 ml-auto pt-1 text-center font-serif italic text-stone-700">
                Pulkit Varshney / Vivan
              </div>
              <p className="text-[10px] text-[#9E8982] text-center w-48 ml-auto">
                Authorized Artisan Sign-off
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
