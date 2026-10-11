"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();
      if (data.success) {
        router.push("/admin/orders");
      } else {
        setError(data.error || "Authentication failed");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF5EF] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl border border-[#E5DCD3] shadow-sm p-8 text-center">
        <div className="w-16 h-16 relative mx-auto mb-4">
          <Image
            src="/images/brand/logo.webp"
            alt="VAP Handicrafts Emblem"
            fill
            className="object-contain"
          />
        </div>
        <h1 className="font-serif text-2xl font-bold text-[#2D1A16] mb-1">
          Workshop Admin Portal
        </h1>
        <p className="text-xs uppercase tracking-wider text-[#735D57] mb-6">
          Pulkit &amp; Vivan &bull; Order Management
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 text-left">
          <div>
            <label className="block text-xs font-semibold text-[#5C4A45] uppercase tracking-wider mb-1">
              Admin Passphrase
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter workshop passphrase"
              required
              className="w-full px-4 py-2.5 rounded-xl border border-[#D5C7BC] bg-[#FCFAF8] text-[#2D1A16] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#2D1A16] hover:bg-[#3D2520] text-white font-medium rounded-xl transition shadow-sm text-sm"
          >
            {loading ? "Verifying..." : "Access Admin Console"}
          </button>
        </form>
      </div>
    </div>
  );
}
