import { EmailOrderDetails, RenderedEmail } from "../types";
import { formatINR } from "@/lib/money";

export function renderOrderConfirmationEmail(order: EmailOrderDetails): RenderedEmail {
  const subject = `Order Confirmed: ${order.orderReference} — VAP Handicrafts`;

  const itemsHtml = order.items
    .map((item) => {
      const customizationDetails = item.customization
        ? `<div style="margin-top: 4px; padding: 6px 8px; background-color: #F5EFEB; border-radius: 4px; font-size: 11px; color: #6E3F38;">
            <strong>Customization:</strong> ${
              item.customization.templateId === "relationship_licence"
                ? `Relationship Licence (${item.customization.licenseHolder || "Holders Specified"})`
                : "Personalized Card / Note"
            }
          </div>`
        : "";

      return `
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #EBE4DD; vertical-align: top;">
            <div style="font-weight: 600; color: #2D1A16; font-size: 14px;">${item.productTitle}</div>
            <div style="font-size: 12px; color: #735D57;">Option: ${item.variantTitle} &bull; Qty: ${item.quantity}</div>
            ${customizationDetails}
          </td>
          <td style="padding: 12px 0; border-bottom: 1px solid #EBE4DD; text-align: right; vertical-align: top; font-weight: 600; color: #2D1A16; font-size: 14px;">
            ${formatINR(item.subtotalMinor)}
          </td>
        </tr>
      `;
    })
    .join("");

  const itemsText = order.items
    .map((item) => `- ${item.productTitle} (${item.variantTitle}) x${item.quantity}: ${formatINR(item.subtotalMinor)}`)
    .join("\n");

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
                    Small Details &bull; Big Emotions
                  </p>
                </td>
              </tr>

              <!-- Greeting & Status -->
              <tr>
                <td style="padding: 32px 32px 16px;">
                  <div style="display: inline-block; padding: 4px 12px; background-color: #E8F5E9; color: #2E7D32; font-size: 11px; font-weight: 700; border-radius: 9999px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px;">
                    Payment Verified &bull; Order Confirmed
                  </div>
                  <h2 style="margin: 0 0 12px; font-family: 'Playfair Display', Georgia, serif; font-size: 20px; color: #2D1A16;">
                    Thank you, ${order.customerName}!
                  </h2>
                  <p style="margin: 0; font-size: 13px; line-height: 1.6; color: #5C4742;">
                    We have received your order <strong>${order.orderReference}</strong>. Each piece is assembled with natural ocean shells and hand-packed with care at our workshop.
                  </p>
                </td>
              </tr>

              <!-- Items Breakdown -->
              <tr>
                <td style="padding: 0 32px;">
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 16px;">
                    <thead>
                      <tr>
                        <th style="padding-bottom: 8px; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #8C756E; border-bottom: 2px solid #2D1A16;">Item</th>
                        <th style="padding-bottom: 8px; text-align: right; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #8C756E; border-bottom: 2px solid #2D1A16;">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${itemsHtml}
                    </tbody>
                  </table>
                </td>
              </tr>

              <!-- Financial Summary -->
              <tr>
                <td style="padding: 16px 32px;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="padding: 4px 0; font-size: 13px; color: #735D57;">Subtotal</td>
                      <td style="padding: 4px 0; font-size: 13px; text-align: right; color: #2D1A16;">${formatINR(order.subtotalMinor)}</td>
                    </tr>
                    <tr>
                      <td style="padding: 4px 0; font-size: 13px; color: #735D57;">Standard Courier Delivery (India)</td>
                      <td style="padding: 4px 0; font-size: 13px; text-align: right; color: #2D1A16;">${order.shippingMinor === 0 ? "FREE" : formatINR(order.shippingMinor)}</td>
                    </tr>
                    ${order.discountMinor > 0 ? `
                    <tr>
                      <td style="padding: 4px 0; font-size: 13px; color: #2E7D32;">Discount</td>
                      <td style="padding: 4px 0; font-size: 13px; text-align: right; color: #2E7D32;">-${formatINR(order.discountMinor)}</td>
                    </tr>` : ""}
                    <tr>
                      <td style="padding: 12px 0 0; font-size: 16px; font-weight: 700; color: #2D1A16; border-top: 2px solid #EBE4DD;">Total Paid</td>
                      <td style="padding: 12px 0 0; font-size: 18px; font-weight: 700; text-align: right; color: #A15B52; border-top: 2px solid #EBE4DD;">${formatINR(order.totalMinor)}</td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Delivery Address -->
              <tr>
                <td style="padding: 16px 32px 24px;">
                  <div style="background-color: #FAF5EF; border-radius: 8px; padding: 16px 20px; border: 1px solid #EBE4DD;">
                    <h3 style="margin: 0 0 8px; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #735D57;">Delivery Address</h3>
                    <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #2D1A16;">
                      <strong>${order.shippingAddress.fullName}</strong><br>
                      ${order.shippingAddress.streetAddress}${order.shippingAddress.apartment ? `, ${order.shippingAddress.apartment}` : ""}<br>
                      ${order.shippingAddress.city}, ${order.shippingAddress.state} &bull; ${order.shippingAddress.pincode}<br>
                      Phone: ${order.customerPhone}
                    </p>
                  </div>
                </td>
              </tr>

              <!-- Footer with Founder Contacts -->
              <tr>
                <td style="background-color: #F5EFEB; padding: 24px 32px; border-top: 1px solid #EBE4DD; font-size: 12px; color: #735D57; text-align: center; line-height: 1.6;">
                  <p style="margin: 0 0 8px;">
                    Have questions about your order or need express packaging?
                  </p>
                  <p style="margin: 0 0 12px; font-weight: 600; color: #2D1A16;">
                    Pulkit Garg: <a href="tel:+919311516813" style="color: #A15B52; text-decoration: none;">+91 9311516813</a> &bull; 
                    Vivan Mittal: <a href="tel:+919310039258" style="color: #A15B52; text-decoration: none;">+91 9310039258</a>
                  </p>
                  <p style="margin: 0; font-size: 11px; color: #8C756E;">
                    Instagram: <a href="https://instagram.com/vaphandicraft" style="color: #A15B52; text-decoration: none;">@vaphandicraft</a> &bull; Email: <a href="mailto:vaphandicrafts@gmail.com" style="color: #A15B52; text-decoration: none;">vaphandicrafts@gmail.com</a>
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
VAP HANDICRAFTS — Order Confirmed
Order Reference: ${order.orderReference}
Thank you, ${order.customerName}!

Items:
${itemsText}

Subtotal: ${formatINR(order.subtotalMinor)}
Shipping: ${order.shippingMinor === 0 ? "FREE" : formatINR(order.shippingMinor)}
Total Paid: ${formatINR(order.totalMinor)}

Shipping Address:
${order.shippingAddress.fullName}
${order.shippingAddress.streetAddress}${order.shippingAddress.apartment ? `, ${order.shippingAddress.apartment}` : ""}
${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pincode}
Phone: ${order.customerPhone}

Support & Queries:
Pulkit Garg: +91 9311516813
Vivan Mittal: +91 9310039258
Instagram: @vaphandicraft
Email: vaphandicrafts@gmail.com
  `.trim();

  return { subject, html, text };
}
