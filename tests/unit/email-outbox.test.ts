import { describe, it, expect } from "vitest";
import { renderOrderConfirmationEmail } from "@/server/email/templates/order-confirmation";
import { renderAdminOrderAlertEmail } from "@/server/email/templates/admin-order-alert";
import { renderOrderShippedEmail } from "@/server/email/templates/order-shipped";
import { EmailOrderDetails } from "@/server/email/types";

describe("Phase 6 Transactional Email Templates", () => {
  const sampleOrder: EmailOrderDetails = {
    orderReference: "VAP-20261011-TEST01",
    customerName: "Aarav Sharma",
    customerEmail: "aarav@example.com",
    customerPhone: "9876543210",
    shippingAddress: {
      fullName: "Aarav Sharma",
      streetAddress: "42 MG Road, Indiranagar",
      apartment: "Flat 4B",
      city: "Bengaluru",
      state: "Karnataka",
      pincode: "560038",
      country: "India",
    },
    items: [
      {
        productTitle: "Spiral Conch & Pink Crackle Bead Bracelet",
        variantTitle: "Rose Gold Accent / Standard",
        quantity: 2,
        priceMinor: 49900,
        subtotalMinor: 99800,
        customization: {
          templateId: "relationship_licence",
          licenseHolder: "Aarav & Meera",
          validUntil: "Forever",
          loveCode: "AM-2024",
        },
      },
    ],
    subtotalMinor: 99800,
    shippingMinor: 0,
    discountMinor: 0,
    totalMinor: 99800,
    trackingNumber: "BD-99887766IN",
    courierName: "Blue Dart Express",
  };

  it("renders Buyer Order Confirmation email with pricing and customization details", () => {
    const rendered = renderOrderConfirmationEmail(sampleOrder);

    expect(rendered.subject).toContain("Order Confirmed: VAP-20261011-TEST01");
    expect(rendered.html).toContain("VAP Handicrafts");
    expect(rendered.html).toContain("Aarav Sharma");
    expect(rendered.html).toContain("₹998");
    expect(rendered.html).toContain("Relationship Licence");
    expect(rendered.text).toContain("VAP-20261011-TEST01");
    expect(rendered.text).toContain("₹998");
  });

  it("renders Admin Workshop Alert email with customer contact and packing instructions", () => {
    const rendered = renderAdminOrderAlertEmail(sampleOrder);

    expect(rendered.subject).toContain("🚨 New Paid Order Alert: VAP-20261011-TEST01");
    expect(rendered.html).toContain("New Paid Order Received");
    expect(rendered.html).toContain("9876543210");
    expect(rendered.html).toContain("560038");
    expect(rendered.text).toContain("NEW PAID ORDER: VAP-20261011-TEST01");
    expect(rendered.text).toContain("Aarav Sharma");
  });

  it("renders Buyer Order Shipped tracking email with courier and AWB", () => {
    const rendered = renderOrderShippedEmail(sampleOrder);

    expect(rendered.subject).toContain("Your Order Has Shipped: VAP-20261011-TEST01");
    expect(rendered.html).toContain("Blue Dart Express");
    expect(rendered.html).toContain("BD-99887766IN");
    expect(rendered.html).toContain("560038");
    expect(rendered.text).toContain("BD-99887766IN");
    expect(rendered.text).toContain("Blue Dart Express");
  });
});
