import { EmailOrderDetails, RenderedEmail } from "../types";
import { formatINR } from "@/lib/money";

export function renderOrderShippedEmail(order: EmailOrderDetails): RenderedEmail {
  const subject = `Your Order Has Shipped: ${order.orderReference} — VAP Handicrafts`;

  const trackingInfo = order.trackingNumber
    ? `
      <div style="margin: 20px 0; padding: 16px; background-color: #F8F5F2; border-left: 4px solid #D4AF37; border-radius: 6px;">
        <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #735D57; font-weight: 600;">Shipment Tracking</div>
        <div style="font-size: 16px; font-weight: 700; color: #2D1A16; margin-top: 4px;">
          Courier: ${order.courierName || "Express Courier"}
        </div>
        <div style="font-size: 15px; color: #6E3F38; margin-top: 2px; font-family: monospace;">
          Tracking AWB / ID: <strong>${order.trackingNumber}</strong>
        </div>
        <div style="font-size: 12px; color: #735D57; margin-top: 6px;">
          Expected delivery: 3–5 business days depending on pincode destination (${order.shippingAddress.pincode}).
        </div>
      </div>
    `
    : `
      <div style="margin: 20px 0; padding: 16px; background-color: #F8F5F2; border-left: 4px solid #D4AF37; border-radius: 6px;">
        <div style="font-size: 14px; color: #2D1A16;">
          Your parcel has been dispatched with our shipping partner. Tracking details will update shortly.
        </div>
      </div>
    `;

  const itemsHtml = order.items
    .map((item) => `
      <tr>
        <td style="padding: 10px 0; border-bottom: 1px solid #EBE4DD; font-size: 13px; color: #2D1A16;">
          <strong>${item.productTitle}</strong> (${item.variantTitle}) &bull; Qty: ${item.quantity}
        </td>
        <td style="padding: 10px 0; border-bottom: 1px solid #EBE4DD; text-align: right; font-size: 13px; font-weight: 600; color: #2D1A16;">
          ${formatINR(item.subtotalMinor)}
        </td>
      </tr>
    `)
    .join("");

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <title>${subject}</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #FAF5EF; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #2D1A16;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #FAF5EF; padding: 32px 16px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #FFFFFF; border-radius: 12px; border: 1px solid #E5DCD3; overflow: hidden; max-width: 600px; width: 100%; box-shadow: 0 4px 12px rgba(45,26,22,0.04);">
              <!-- Brand Header -->
              <tr>
                <td style="background-color: #2D1A16; padding: 28px 32px; text-align: center;">
                  <h1 style="margin: 0; font-family: 'Playfair Display', Georgia, serif; font-size: 24px; color: #FFFFFF; letter-spacing: 0.5px;">
                    VAP Handicrafts
                  </h1>
                  <p style="margin: 6px 0 0; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #D4AF37;">
                    Handcrafted With Love &bull; Small Details &bull; Big Emotions
                  </p>
                </td>
              </tr>

              <!-- Shipped Hero Notice -->
              <tr>
                <td style="padding: 32px 32px 20px;">
                  <h2 style="margin: 0 0 12px; font-family: 'Playfair Display', Georgia, serif; font-size: 20px; color: #2D1A16;">
                    Your Parcel is on the Way, ${order.customerName}! 🚚
                  </h2>
                  <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #5C4A45;">
                    Great news! Our workshop artisans have carefully finished, inspected, and packed your handcrafted order <strong>#${order.orderReference}</strong>. It is now handed over for shipping.
                  </p>

                  ${trackingInfo}

                  <!-- Delivery Destination -->
                  <div style="margin: 24px 0 16px; padding: 14px 18px; border: 1px solid #EBE4DD; border-radius: 8px; background-color: #FAF7F4;">
                    <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #735D57; font-weight: 700; margin-bottom: 6px;">
                      Delivering To
                    </div>
                    <div style="font-size: 13px; line-height: 1.5; color: #2D1A16;">
                      <strong>${order.shippingAddress.fullName}</strong><br>
                      ${order.shippingAddress.streetAddress}${order.shippingAddress.apartment ? `, ${order.shippingAddress.apartment}` : ""}<br>
                      ${order.shippingAddress.city}, ${order.shippingAddress.state} — ${order.shippingAddress.pincode}<br>
                      Phone: ${order.customerPhone}
                    </div>
                  </div>

                  <!-- Items in this shipment -->
                  <div style="margin-top: 24px;">
                    <div style="font-size: 13px; font-weight: 700; color: #2D1A16; margin-bottom: 8px;">
                      Package Contents
                    </div>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      ${itemsHtml}
                    </table>
                  </div>

                  <!-- Care & Unboxing Note -->
                  <div style="margin-top: 24px; padding: 14px 16px; background-color: #FFF9F2; border: 1px dashed #D4AF37; border-radius: 8px; font-size: 12px; color: #6E3F38; line-height: 1.5;">
                    💡 <strong>Unboxing Tip:</strong> We recommend taking a quick unboxing video when your package arrives. Our seashell jewellery and personalized cards are delicately packed in protective bubble sleeves and eco kraft packaging.
                  </div>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background-color: #F8F5F2; padding: 24px 32px; border-top: 1px solid #EBE4DD; text-align: center; font-size: 12px; color: #735D57; line-height: 1.6;">
                  <p style="margin: 0 0 8px;">
                    Have questions about your delivery? Reach us directly at
                    <a href="mailto:vaphandicrafts@gmail.com" style="color: #6E3F38; font-weight: 600; text-decoration: none;">vaphandicrafts@gmail.com</a>
                    or on WhatsApp at <strong>+91 93685 02623</strong>.
                  </p>
                  <p style="margin: 0; font-size: 11px; color: #9E8982;">
                    &copy; ${new Date().getFullYear()} VAP Handicrafts &bull; Pulkit Varshney &amp; Vivan &bull; Uttar Pradesh, India
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const text = `
YOUR ORDER HAS SHIPPED — VAP HANDICRAFTS
==========================================

Order Reference: ${order.orderReference}
Hello ${order.customerName},

Your handcrafted order has been carefully packaged and handed over to our shipping partner.

SHIPPING DETAILS:
Courier: ${order.courierName || "Express Courier"}
Tracking Number: ${order.trackingNumber || "Pending partner sync"}
Destination: ${order.shippingAddress.fullName}, ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pincode}

ITEMS IN SHIPMENT:
${order.items.map((i) => `- ${i.productTitle} (${i.variantTitle}) x${i.quantity}`).join("\n")}

Total: ${formatINR(order.totalMinor)}

NEED HELP?
WhatsApp: +91 93685 02623 / +91 87550 51423
Email: vaphandicrafts@gmail.com

Thank you for choosing VAP Handicrafts!
  `.trim();

  return { subject, html, text };
}
