import "server-only";
import webpush from "web-push";
import { getSupabaseAdminClient } from "@/server/db/supabase";

export interface StoredPushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  userAgent?: string;
  createdAt: string;
}

const DEFAULT_SUBJECT = process.env.VAPID_SUBJECT || "mailto:vaphandicrafts@gmail.com";
const PUBLIC_VAPID_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";
const PRIVATE_VAPID_KEY = process.env.VAPID_PRIVATE_KEY || "";

let isVapidConfigured = false;

function ensureVapidConfigured(): boolean {
  if (!PUBLIC_VAPID_KEY || !PRIVATE_VAPID_KEY) {
    return false;
  }
  if (!isVapidConfigured) {
    try {
      webpush.setVapidDetails(DEFAULT_SUBJECT, PUBLIC_VAPID_KEY, PRIVATE_VAPID_KEY);
      isVapidConfigured = true;
    } catch (err) {
      console.warn("[PushService] Failed to configure VAPID:", err);
      return false;
    }
  }
  return true;
}

export function getVapidPublicKey(): string {
  return PUBLIC_VAPID_KEY;
}

// In-memory cache for fast, non-blocking notification delivery
let memorySubscriptions: StoredPushSubscription[] = [];
let hasLoadedFromDb = false;

export async function listPushSubscriptions(): Promise<StoredPushSubscription[]> {
  if (hasLoadedFromDb && memorySubscriptions.length > 0) {
    return memorySubscriptions;
  }

  try {
    const supabase = getSupabaseAdminClient();
    const { data: row } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "admin_push_subscriptions")
      .maybeSingle();

    if (row?.value && Array.isArray(row.value)) {
      memorySubscriptions = row.value as StoredPushSubscription[];
      hasLoadedFromDb = true;
      return memorySubscriptions;
    }
  } catch (err) {
    console.warn("[PushService] Failed to fetch subscriptions from Supabase:", err);
  }

  return memorySubscriptions;
}

export async function savePushSubscription(sub: StoredPushSubscription): Promise<void> {
  const current = await listPushSubscriptions();
  const filtered = current.filter((s) => s.endpoint !== sub.endpoint);
  filtered.push(sub);
  memorySubscriptions = filtered;
  hasLoadedFromDb = true;

  try {
    const supabase = getSupabaseAdminClient();
    await supabase.from("site_settings").upsert(
      {
        key: "admin_push_subscriptions",
        value: filtered,
        is_public: false,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "key" }
    );
  } catch (err) {
    console.warn("[PushService] Failed to persist subscription to Supabase:", err);
  }
}

export async function removePushSubscription(endpoint: string): Promise<void> {
  const current = await listPushSubscriptions();
  const filtered = current.filter((s) => s.endpoint !== endpoint);
  memorySubscriptions = filtered;

  try {
    const supabase = getSupabaseAdminClient();
    await supabase.from("site_settings").upsert(
      {
        key: "admin_push_subscriptions",
        value: filtered,
        is_public: false,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "key" }
    );
  } catch (err) {
    console.warn("[PushService] Failed to remove subscription from Supabase:", err);
  }
}

export async function sendPushNotificationToAdmins(payload: {
  title: string;
  body: string;
  url?: string;
  tag?: string;
}): Promise<{ successCount: number; failureCount: number }> {
  if (!ensureVapidConfigured()) {
    return { successCount: 0, failureCount: 0 };
  }
  const subscriptions = await listPushSubscriptions();

  if (subscriptions.length === 0) {
    return { successCount: 0, failureCount: 0 };
  }

  let successCount = 0;
  let failureCount = 0;
  const expiredEndpoints: string[] = [];

  const notificationPayload = JSON.stringify({
    title: payload.title,
    body: payload.body,
    url: payload.url || "/admin/orders",
    tag: payload.tag || "vap-admin-order",
    icon: "/icons/icon-192x192.png",
  });

  await Promise.all(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: sub.keys,
          },
          notificationPayload,
          {
            TTL: 60 * 60 * 24, // 24 hours
            urgency: "high",
          }
        );
        successCount++;
      } catch (err: any) {
        failureCount++;
        // If status code is 410 (Gone) or 404 (Not Found), the subscription has expired or was revoked
        if (err?.statusCode === 410 || err?.statusCode === 404) {
          expiredEndpoints.push(sub.endpoint);
        }
      }
    })
  );

  // Clean up any revoked subscriptions asynchronously
  if (expiredEndpoints.length > 0) {
    for (const exp of expiredEndpoints) {
      await removePushSubscription(exp).catch(() => {});
    }
  }

  return { successCount, failureCount };
}
