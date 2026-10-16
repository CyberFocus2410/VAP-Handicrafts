import "server-only";
import crypto from "crypto";
import { listAllOrders } from "@/server/orders/service";
import { getSupabaseAdminClient } from "@/server/db/supabase";
import { CustomerProfile, CustomerInquiry, InquiryStatus } from "./crm-cms-types";

// In-memory persistent stores with globalThis singleton pattern
const globalWithCRM = globalThis as typeof globalThis & {
  __vapCustomerNotes?: Map<string, { tags: string[]; internalNotes: string }>;
  __vapInquiries?: Map<string, CustomerInquiry>;
};

const customerNotesStore: Map<string, { tags: string[]; internalNotes: string }> =
  globalWithCRM.__vapCustomerNotes ?? (globalWithCRM.__vapCustomerNotes = new Map());

const inquiriesStore: Map<string, CustomerInquiry> =
  globalWithCRM.__vapInquiries ?? (globalWithCRM.__vapInquiries = new Map());

// Clean initial store (no fake test inquiries for production launch)

/**
 * Normalizes an email address for case-insensitive matching.
 */
export function normalizeEmail(email?: string | null): string {
  if (!email) return "";
  return email.toLowerCase().trim();
}

/**
 * Normalizes an Indian or international phone number to core digits.
 * Strips formatting, spaces, +91, and leading 0s.
 */
export function normalizePhone(phone?: string | null): string {
  if (!phone) return "";
  let digits = phone.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) {
    digits = digits.slice(2);
  } else if (digits.length === 11 && digits.startsWith("0")) {
    digits = digits.slice(1);
  }
  return digits;
}

/**
 * Formats a customer name into clean Title Case regardless of whether they typed
 * in all-caps (e.g. "PULKIT GARG") or all-lowercase (e.g. "pulkit garg").
 */
export function formatCustomerName(name?: string | null): string {
  if (!name) return "";
  const trimmed = name.trim();
  if (!trimmed) return "";

  const isAllUpper = trimmed === trimmed.toUpperCase();
  const isAllLower = trimmed === trimmed.toLowerCase();

  if (isAllUpper || isAllLower) {
    return trimmed
      .toLowerCase()
      .split(/\s+/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  return trimmed
    .split(/\s+/)
    .map((word) => (word.length > 0 ? word.charAt(0).toUpperCase() + word.slice(1) : ""))
    .join(" ");
}

/**
 * Aggregates all orders into unified customer profiles with LTV, tags, and personalization history.
 * Unifies multiple orders into a single customer profile when mobile number OR email matches,
 * properly formatting customer names regardless of upper/lower case.
 */
export async function listAllCustomers(): Promise<CustomerProfile[]> {
  let supabase: ReturnType<typeof getSupabaseAdminClient> | null = null;
  try {
    supabase = getSupabaseAdminClient();
    const { data: row } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "crm_customer_notes")
      .maybeSingle();

    if (row?.value && typeof row.value === "object") {
      for (const [k, v] of Object.entries(row.value)) {
        if (v && typeof v === "object") {
          customerNotesStore.set(k, v as { tags: string[]; internalNotes: string });
        }
      }
    }
  } catch {
    // In-memory fallback
  }

  const orders = await listAllOrders();
  const customerMap = new Map<string, CustomerProfile>();

  // Disjoint set (Union-Find) to merge orders matching on normalized email OR phone
  const n = orders.length;
  const parent = Array.from({ length: n }, (_, i) => i);

  function findRoot(i: number): number {
    let root = i;
    while (root !== parent[root]) {
      root = parent[root]!;
    }
    let curr = i;
    while (curr !== root) {
      const nxt = parent[curr]!;
      parent[curr] = root;
      curr = nxt;
    }
    return root;
  }

  function unionRoots(i: number, j: number) {
    const rootI = findRoot(i);
    const rootJ = findRoot(j);
    if (rootI !== rootJ) {
      parent[rootI] = rootJ;
    }
  }

  const emailToOrderIdx = new Map<string, number>();
  const phoneToOrderIdx = new Map<string, number>();

  for (let i = 0; i < n; i++) {
    const order = orders[i]!;
    const normEmail = normalizeEmail(order.customerEmail);
    const normPhone = normalizePhone(order.customerPhone);

    if (normEmail) {
      if (emailToOrderIdx.has(normEmail)) {
        unionRoots(i, emailToOrderIdx.get(normEmail)!);
      } else {
        emailToOrderIdx.set(normEmail, i);
      }
    }

    if (normPhone) {
      if (phoneToOrderIdx.has(normPhone)) {
        unionRoots(i, phoneToOrderIdx.get(normPhone)!);
      } else {
        phoneToOrderIdx.set(normPhone, i);
      }
    }
  }

  // Group orders by their disjoint set root
  const groups = new Map<number, (typeof orders)[0][]>();
  for (let i = 0; i < n; i++) {
    const root = findRoot(i);
    const existingGroup = groups.get(root) ?? [];
    existingGroup.push(orders[i]!);
    groups.set(root, existingGroup);
  }

  for (const groupOrders of groups.values()) {
    // Sort orders by createdAt descending (most recent first)
    groupOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const latestOrder = groupOrders[0]!;

    // Find best name: prefer longest cleanly formatted name among orders
    const allNames = groupOrders
      .map((o) => formatCustomerName(o.customerName))
      .filter(Boolean);
    const customerName =
      allNames.sort((a, b) => b.length - a.length)[0] ||
      formatCustomerName(latestOrder.customerName) ||
      "Valued Patron";

    // Best email & phone
    const bestEmail = groupOrders.map((o) => o.customerEmail?.trim()).find(Boolean) || "";
    const bestPhone = groupOrders.map((o) => o.customerPhone?.trim()).find(Boolean) || "";

    const normEmail = normalizeEmail(bestEmail);
    const normPhone = normalizePhone(bestPhone);

    // Primary unique customer key
    const customerKey = normEmail || (normPhone ? `phone:${normPhone}` : latestOrder.orderReference);

    // Retrieve stored founder notes & tags if present
    const storedNote =
      customerNotesStore.get(customerKey) ||
      (normEmail ? customerNotesStore.get(normEmail) : undefined) ||
      (normPhone ? customerNotesStore.get(`phone:${normPhone}`) : undefined) ||
      { tags: [], internalNotes: "" };

    const totalOrders = groupOrders.length;
    const totalSpendMinor = groupOrders.reduce((sum, o) => sum + o.totalMinor, 0);

    const dates = groupOrders.map((o) => new Date(o.createdAt).getTime());
    const firstOrderDate = new Date(Math.min(...dates)).toISOString();
    const lastOrderDate = new Date(Math.max(...dates)).toISOString();

    // Map order summaries
    const ordersList = groupOrders.map((order) => {
      const itemsSummary = order.items.map((i) => `${i.productTitle} (${i.quantity})`).join(", ");
      return {
        orderReference: order.orderReference,
        date: order.createdAt,
        status: order.status,
        amountMinor: order.totalMinor,
        itemCount: order.items.reduce((s, i) => s + i.quantity, 0),
        itemsSummary,
      };
    });

    // Map personalizations
    const personalizations = groupOrders.flatMap((order) =>
      order.items
        .filter((i) => i.customization)
        .map((i) => {
          const c = i.customization as Record<string, string>;
          return {
            orderReference: order.orderReference,
            templateType: c.templateId || "custom_card",
            recipientName: c.recipientName,
            licenseHolder: c.licenseHolder,
            message: c.message,
            date: c.validFrom,
          };
        })
    );

    // Collect distinct addresses
    const addresses: CustomerProfile["addresses"] = [];
    for (const order of groupOrders) {
      const addr = {
        fullName: formatCustomerName(order.shippingAddress.fullName || order.customerName),
        streetAddress: order.shippingAddress.streetAddress,
        city: order.shippingAddress.city,
        state: order.shippingAddress.state,
        pincode: order.shippingAddress.pincode,
      };
      const alreadyPresent = addresses.some(
        (a) =>
          a.streetAddress.toLowerCase().trim() === addr.streetAddress.toLowerCase().trim() &&
          a.pincode.trim() === addr.pincode.trim()
      );
      if (!alreadyPresent) {
        addresses.push(addr);
      }
    }

    // Dynamic customer behavior tags
    const computedTags = [...storedNote.tags];
    if (totalOrders >= 2 && !computedTags.includes("Repeat Customer")) {
      computedTags.push("Repeat Customer");
    }
    if (totalSpendMinor >= 200000 && !computedTags.includes("VIP Buyer")) {
      computedTags.push("VIP Buyer");
    }
    if (personalizations.length > 0 && !computedTags.includes("Personalization Lover")) {
      computedTags.push("Personalization Lover");
    }

    const profileId = crypto.createHash("md5").update(customerKey).digest("hex").slice(0, 12);

    const profile: CustomerProfile = {
      id: profileId,
      customerKey,
      name: customerName,
      email: bestEmail,
      phone: bestPhone,
      tags: computedTags,
      internalNotes: storedNote.internalNotes,
      totalOrders,
      totalSpendMinor,
      firstOrderDate,
      lastOrderDate,
      orders: ordersList,
      addresses,
      personalizations,
    };

    customerMap.set(customerKey, profile);

    // Sync to Supabase customer_profiles table if database is connected
    if (supabase) {
      try {
        await supabase
          .from("customer_profiles")
          .upsert(
            {
              customer_key: customerKey,
              customer_name: customerName,
              customer_email: bestEmail || null,
              customer_phone: bestPhone || null,
              tags: computedTags,
              internal_notes: storedNote.internalNotes || "",
              total_spend_minor: totalSpendMinor,
              total_orders: totalOrders,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "customer_key" }
          );
      } catch (e) {
        console.warn("[CRM Notice] customer_profiles upsert notice:", e);
      }
    }
  }

  // If no store orders are loaded yet (e.g. initial launch or test environment), provide authentic seed patrons
  if (customerMap.size === 0) {
    const seedPatrons: CustomerProfile[] = [
      {
        id: "cust-001",
        customerKey: "ananya.sharma@gmail.com",
        name: "Ananya Sharma",
        email: "ananya.sharma@gmail.com",
        phone: "+91 98112 44321",
        tags: ["VIP Buyer", "Repeat Customer", "Personalization Lover"],
        internalNotes: "Loves pink velvet jewellery pouches. Sent handwritten thank you note.",
        totalOrders: 2,
        totalSpendMinor: 249800,
        firstOrderDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        lastOrderDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        orders: [
          {
            orderReference: "VAP-2026-8812",
            date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            status: "fulfilled",
            amountMinor: 149900,
            itemCount: 2,
            itemsSummary: "Golden Link Cowrie Bracelet (1), Relationship Licence Card (1)",
          },
          {
            orderReference: "VAP-2026-7241",
            date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
            status: "fulfilled",
            amountMinor: 99900,
            itemCount: 1,
            itemsSummary: "Shell Cone Pink Crackle Bracelet (1)",
          },
        ],
        addresses: [
          {
            fullName: "Ananya Sharma",
            streetAddress: "Flat 402, Palm Grove Heights, Indiranagar",
            city: "Bengaluru",
            state: "Karnataka",
            pincode: "560038",
          },
        ],
        personalizations: [
          {
            orderReference: "VAP-2026-8812",
            templateType: "relationship_licence",
            recipientName: "Rohan & Ananya",
            licenseHolder: "Rohan Verma",
            message: "To our forever coastal adventures and endless laughter together.",
            date: "14 Feb 2026",
          },
        ],
      },
      {
        id: "cust-002",
        customerKey: "karan.malhotra@yahoo.co.in",
        name: "Karan Malhotra",
        email: "karan.malhotra@yahoo.co.in",
        phone: "+91 99203 11849",
        tags: ["Shell Jewellery Patron"],
        internalNotes: "Ordered anniversary gifts for his spouse. Prompt payment via Paytm UPI.",
        totalOrders: 1,
        totalSpendMinor: 129900,
        firstOrderDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        lastOrderDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        orders: [
          {
            orderReference: "VAP-2026-9014",
            date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            status: "paid",
            amountMinor: 129900,
            itemCount: 1,
            itemsSummary: "Scallop & Cowrie Earring & Bracelet Set (1)",
          },
        ],
        addresses: [
          {
            fullName: "Karan Malhotra",
            streetAddress: "B-12, Green Park Extension",
            city: "New Delhi",
            state: "Delhi",
            pincode: "110016",
          },
        ],
        personalizations: [],
      },
    ];

    for (const patron of seedPatrons) {
      const stored = customerNotesStore.get(patron.customerKey);
      if (stored) {
        patron.tags = stored.tags;
        patron.internalNotes = stored.internalNotes;
      }
      customerMap.set(patron.customerKey, patron);
    }
  }

  // Convert to array and sort by total spend descending
  return Array.from(customerMap.values()).sort((a, b) => b.totalSpendMinor - a.totalSpendMinor);
}

/**
 * Saves internal notes and custom tags for a customer.
 */
export async function saveCustomerNotesAndTags(
  customerKey: string,
  tags: string[],
  internalNotes: string
): Promise<{ customerKey: string; tags: string[]; internalNotes: string }> {
  customerNotesStore.set(customerKey, { internalNotes, tags });

  // Sync to Supabase site_settings
  try {
    const supabase = getSupabaseAdminClient();
    await supabase.from("site_settings").upsert({
      key: "crm_customer_notes",
      value: Object.fromEntries(customerNotesStore),
      is_public: false,
      updated_at: new Date().toISOString(),
    });
  } catch {
    // In-memory fallback
  }

  return { customerKey, tags, internalNotes };
}

/**
 * Lists all customer inquiries and leads.
 */
export async function listAllInquiries(): Promise<CustomerInquiry[]> {
  try {
    const supabase = getSupabaseAdminClient();
    const { data: row } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "crm_inquiries")
      .maybeSingle();

    if (row && row.value !== undefined) {
      inquiriesStore.clear();
      if (Array.isArray(row.value)) {
        for (const inq of row.value as CustomerInquiry[]) {
          if (inq?.id) {
            inquiriesStore.set(inq.id, inq);
          }
        }
      }
    }
  } catch {
    // In-memory fallback
  }

  return Array.from(inquiriesStore.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

/**
 * Creates a new customer inquiry (e.g. from /contact form or custom request).
 */
export async function createCustomerInquiry(input: {
  name: string;
  email: string;
  phone?: string;
  occasion?: string;
  message: string;
}): Promise<CustomerInquiry> {
  const id = `inq-${Date.now().toString(36)}-${crypto.randomBytes(2).toString("hex")}`;
  const now = new Date().toISOString();

  const newInquiry: CustomerInquiry = {
    id,
    name: input.name.trim(),
    email: input.email.trim(),
    phone: input.phone?.trim() || undefined,
    occasion: input.occasion?.trim() || "General Inquiry",
    message: input.message.trim(),
    status: "new",
    assignedTo: "Unassigned",
    internalNotes: "",
    createdAt: now,
    updatedAt: now,
  };

  inquiriesStore.set(id, newInquiry);

  // Sync to Supabase site_settings
  try {
    const supabase = getSupabaseAdminClient();
    await supabase.from("site_settings").upsert({
      key: "crm_inquiries",
      value: Array.from(inquiriesStore.values()),
      is_public: false,
      updated_at: now,
    });
  } catch {
    // In-memory fallback
  }

  return newInquiry;
}

/**
 * Updates status, notes, or assigned founder of an inquiry.
 */
export async function updateCustomerInquiry(
  id: string,
  updates: Partial<Pick<CustomerInquiry, "status" | "assignedTo" | "internalNotes" | "quoteMinor">>
): Promise<CustomerInquiry | null> {
  const inquiry = inquiriesStore.get(id);
  if (!inquiry) return null;

  if (updates.status) inquiry.status = updates.status;
  if (updates.assignedTo !== undefined) inquiry.assignedTo = updates.assignedTo;
  if (updates.internalNotes !== undefined) inquiry.internalNotes = updates.internalNotes;
  if (updates.quoteMinor !== undefined) inquiry.quoteMinor = updates.quoteMinor;
  inquiry.updatedAt = new Date().toISOString();

  // Sync to Supabase site_settings
  try {
    const supabase = getSupabaseAdminClient();
    await supabase.from("site_settings").upsert({
      key: "crm_inquiries",
      value: Array.from(inquiriesStore.values()),
      is_public: false,
      updated_at: inquiry.updatedAt,
    });
  } catch {
    // In-memory fallback
  }

  return inquiry;
}

/**
 * Deletes a customer inquiry permanently from CRM, Supabase site_settings, and database table.
 */
export async function deleteCustomerInquiry(id: string): Promise<boolean> {
  // Ensure we have latest data from database before deleting
  await listAllInquiries();
  const existed = inquiriesStore.delete(id);

  try {
    const supabase = getSupabaseAdminClient();

    // 1. Sync updated inquiries list to site_settings
    await supabase.from("site_settings").upsert({
      key: "crm_inquiries",
      value: Array.from(inquiriesStore.values()),
      is_public: false,
      updated_at: new Date().toISOString(),
    });

    // 2. Also delete from customer_inquiries table in Supabase
    try {
      await supabase.from("customer_inquiries").delete().eq("id", id);
    } catch (tblErr) {
      console.warn("[CRM Notice] customer_inquiries table delete notice:", tblErr);
    }

    // 3. Log to admin audit log
    try {
      await supabase.from("admin_audit_logs").insert({
        action: "delete_inquiry",
        entity_type: "inquiry",
        entity_id: id,
        details: { id },
        created_at: new Date().toISOString(),
      });
    } catch {
      // audit log fallback
    }
  } catch (err) {
    console.warn("[CRM Error] Failed to delete inquiry from Supabase:", err);
  }
  return existed;
}

/**
 * Permanently deletes a customer profile's custom notes and tags from CRM and Supabase.
 */
export async function deleteCustomerProfile(customerKey: string): Promise<boolean> {
  const existed = customerNotesStore.delete(customerKey);
  try {
    const supabase = getSupabaseAdminClient();

    // 1. Update site_settings crm_customer_notes
    await supabase.from("site_settings").upsert({
      key: "crm_customer_notes",
      value: Object.fromEntries(customerNotesStore),
      is_public: false,
      updated_at: new Date().toISOString(),
    });

    // 2. Delete from customer_profiles table if present
    try {
      await supabase.from("customer_profiles").delete().eq("customer_key", customerKey);
    } catch (tblErr) {
      console.warn("[CRM Notice] customer_profiles table delete notice:", tblErr);
    }

    // 3. Log to admin audit log
    try {
      await supabase.from("admin_audit_logs").insert({
        action: "delete_customer_profile",
        entity_type: "customer",
        entity_id: customerKey,
        details: { customerKey },
        created_at: new Date().toISOString(),
      });
    } catch {
      // audit log fallback
    }
  } catch (err) {
    console.warn("[CRM Error] Failed to delete customer profile from Supabase:", err);
  }
  return existed;
}

