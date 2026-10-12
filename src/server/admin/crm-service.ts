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
 * Aggregates all orders into unified customer profiles with LTV, tags, and personalization history.
 */
export async function listAllCustomers(): Promise<CustomerProfile[]> {
  try {
    const supabase = getSupabaseAdminClient();
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

  for (const order of orders) {
    const emailKey = order.customerEmail.toLowerCase().trim();
    const phoneKey = order.customerPhone.trim();
    const customerKey = emailKey || phoneKey || order.orderReference;

    const existing = customerMap.get(customerKey);

    const itemsSummary = order.items.map((i) => `${i.productTitle} (${i.quantity})`).join(", ");
    const orderSummary = {
      orderReference: order.orderReference,
      date: order.createdAt,
      status: order.status,
      amountMinor: order.totalMinor,
      itemCount: order.items.reduce((s, i) => s + i.quantity, 0),
      itemsSummary,
    };

    const personalizations = order.items
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
      });

    const address = {
      fullName: order.shippingAddress.fullName,
      streetAddress: order.shippingAddress.streetAddress,
      city: order.shippingAddress.city,
      state: order.shippingAddress.state,
      pincode: order.shippingAddress.pincode,
    };

    if (!existing) {
      const storedNote = customerNotesStore.get(customerKey) || { tags: [], internalNotes: "" };

      // Compute initial tags based on behaviour
      const computedTags = [...storedNote.tags];
      if (order.totalMinor >= 200000 && !computedTags.includes("VIP Buyer")) {
        computedTags.push("VIP Buyer");
      }
      if (personalizations.length > 0 && !computedTags.includes("Personalization Lover")) {
        computedTags.push("Personalization Lover");
      }

      customerMap.set(customerKey, {
        id: crypto.createHash("md5").update(customerKey).digest("hex").slice(0, 12),
        customerKey,
        name: order.customerName,
        email: order.customerEmail,
        phone: order.customerPhone,
        tags: computedTags,
        internalNotes: storedNote.internalNotes,
        totalOrders: 1,
        totalSpendMinor: order.totalMinor,
        firstOrderDate: order.createdAt,
        lastOrderDate: order.createdAt,
        orders: [orderSummary],
        addresses: [address],
        personalizations,
      });
    } else {
      existing.totalOrders += 1;
      existing.totalSpendMinor += order.totalMinor;
      if (new Date(order.createdAt) > new Date(existing.lastOrderDate)) {
        existing.lastOrderDate = order.createdAt;
      }
      if (new Date(order.createdAt) < new Date(existing.firstOrderDate)) {
        existing.firstOrderDate = order.createdAt;
      }
      existing.orders.push(orderSummary);
      existing.personalizations.push(...personalizations);

      // Check if address already exists
      const hasAddr = existing.addresses.some(
        (a) => a.streetAddress === address.streetAddress && a.pincode === address.pincode
      );
      if (!hasAddr) {
        existing.addresses.push(address);
      }

      // Add repeat customer tag if >= 2 orders
      if (existing.totalOrders >= 2 && !existing.tags.includes("Repeat Customer")) {
        existing.tags.push("Repeat Customer");
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
 * Deletes a customer inquiry permanently from CRM and Supabase.
 */
export async function deleteCustomerInquiry(id: string): Promise<boolean> {
  const existed = inquiriesStore.delete(id);
  try {
    const supabase = getSupabaseAdminClient();
    await supabase.from("site_settings").upsert({
      key: "crm_inquiries",
      value: Array.from(inquiriesStore.values()),
      is_public: false,
      updated_at: new Date().toISOString(),
    });
  } catch (err) {
    console.warn("[CRM Error] Failed to delete inquiry from Supabase:", err);
  }
  return existed;
}
