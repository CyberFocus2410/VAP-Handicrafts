"use client";

import React, { useState, useEffect } from "react";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export const PushNotificationManager: React.FC = () => {
  const [isSupported, setIsSupported] = useState<boolean>(false);
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>("");

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      "PushManager" in window &&
      "Notification" in window
    ) {
      setIsSupported(true);
      setPermission(Notification.permission);

      // Register Service Worker
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          registration.pushManager.getSubscription().then((sub) => {
            if (sub) {
              setIsSubscribed(true);
            }
          });
        })
        .catch((err) => {
          console.warn("[PWA] Service worker registration notice:", err);
        });
    }
  }, []);

  const handleSubscribe = async () => {
    setLoading(true);
    setStatusMessage("");

    try {
      // 1. Request notification permission
      const perm = await Notification.requestPermission();
      setPermission(perm);

      if (perm !== "granted") {
        setStatusMessage("Notification permission was not granted.");
        setLoading(false);
        return;
      }

      // 2. Fetch VAPID public key
      const keyRes = await fetch("/api/admin/push");
      const keyData = await keyRes.json();
      if (!keyData.publicKey) {
        setStatusMessage("Could not retrieve VAPID key from server.");
        setLoading(false);
        return;
      }

      // 3. Subscribe with PushManager
      const registration = await navigator.serviceWorker.ready;
      let subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        const applicationServerKey = urlBase64ToUint8Array(keyData.publicKey);
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: applicationServerKey as unknown as BufferSource,
        });
      }

      // 4. Save subscription to server
      const saveRes = await fetch("/api/admin/push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "subscribe",
          subscription: subscription.toJSON(),
          userAgent: navigator.userAgent,
        }),
      });

      const saveData = await saveRes.json();
      if (saveData.success) {
        setIsSubscribed(true);
        setStatusMessage("✅ Phone subscribed! You will receive instant order alerts.");
      } else {
        setStatusMessage(saveData.error || "Failed to save subscription.");
      }
    } catch (err: any) {
      setStatusMessage(err?.message || "Error setting up push notifications.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendTestPush = async () => {
    setLoading(true);
    setStatusMessage("");

    try {
      const res = await fetch("/api/admin/push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "test" }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMessage("🔔 " + data.message);
      } else {
        setStatusMessage(data.error || "Failed to send test push.");
      }
    } catch (err: any) {
      setStatusMessage("Network error sending test push: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isSupported) {
    return null;
  }

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#2D1A16]/10 shadow-sm mb-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-[#FAF5EF] flex items-center justify-center text-xl shrink-0 border border-[#2D1A16]/10">
            {isSubscribed ? "🔔" : "📱"}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm sm:text-base text-[#2D1A16]">
                Owner Mobile Push Notifications
              </h3>
              {isSubscribed ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase tracking-wider">
                  Active On Device
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 uppercase tracking-wider">
                  Not Enabled
                </span>
              )}
            </div>
            <p className="text-xs text-[#2D1A16]/65 mt-0.5">
              Receive immediate real-time sound and vibration alerts on your Android/iOS phone when new orders arrive or customers upload UPI payment screenshots.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          {!isSubscribed ? (
            <button
              onClick={handleSubscribe}
              disabled={loading || permission === "denied"}
              className="flex-1 sm:flex-initial px-4 py-2 text-xs font-semibold rounded-xl bg-[#2D1A16] text-[#FAF5EF] hover:bg-black transition shadow-sm disabled:opacity-50"
            >
              {loading ? "Enabling..." : permission === "denied" ? "Permission Denied" : "Enable Phone Alerts"}
            </button>
          ) : (
            <button
              onClick={handleSendTestPush}
              disabled={loading}
              className="flex-1 sm:flex-initial px-4 py-2 text-xs font-semibold rounded-xl bg-amber-500 text-white hover:bg-amber-600 transition shadow-sm disabled:opacity-50"
            >
              {loading ? "Sending..." : "Test Push On Phone 🚀"}
            </button>
          )}
        </div>
      </div>

      {statusMessage && (
        <div className="mt-3.5 pt-3 border-t border-[#2D1A16]/10 text-xs font-medium text-[#2D1A16]/80 flex items-center gap-1.5">
          <span>{statusMessage}</span>
        </div>
      )}
    </div>
  );
};
