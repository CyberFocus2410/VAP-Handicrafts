import { EmailOrderDetails, RenderedEmail } from "../types";
import { formatINR } from "@/lib/money";

export function renderAdminOrderAlertEmail(order: EmailOrderDetails): RenderedEmail {
  const subject = `🚨 New Paid Order Alert: ${order.orderReference} (${formatINR(order.totalMinor)})`;

  const itemsList = order.items
    .map((item) => {
      const customSnippet = item.customization
        ? `<div style="font-size: 11px; color: #8A4B38; margin-top: 2px;">
            Custom: ${JSON.stringify(item.customization)}
          </div>`
        : "";
      return `
        <li style="margin-bottom: 8px;">
          <strong>${item.productTitle}</strong> (${item.variantTitle}) x${item.quantity} &bull; ${formatINR(item.subtotalMinor)}
          ${customSnippet}
        </li>
      `;
    })
    .join("");

  const html = `
    <!DOCTYPE html>
    <html>
    <body style="font-family: -apple-system, sans-serif; color: #2D1A16; background-color: #FAF5EF; padding: 24px;">
      <div style="background: white; border-radius: 8px; border: 1px solid #E5DCD3; padding: 24px; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2E7D32; margin-top: 0;">🎉 New Paid Order Received!</h2>
        <p><strong>Order Ref:</strong> ${order.orderReference}</p>
        <p><strong>Customer:</strong> ${order.customerName} (<a href="mailto:${order.customerEmail}">${order.customerEmail}</a>, <a href="tel:${order.customerPhone}">${order.customerPhone}</a>)</p>
        <p><strong>Amount Paid:</strong> <span style="font-size: 18px; font-weight: bold; color: #A15B52;">${formatINR(order.totalMinor)}</span></p>
        
        <h3 style="border-top: 1px solid #eee; padding-top: 12px;">Items to Pack:</h3>
        <ul style="padding-left: 20px;">
          ${itemsList}
        </ul>

        <h3 style="border-top: 1px solid #eee; padding-top: 12px;">Shipping To:</h3>
        <p style="background: #FAF5EF; padding: 12px; border-radius: 4px; font-size: 13px;">
          ${order.shippingAddress.fullName}<br>
          ${order.shippingAddress.streetAddress}${order.shippingAddress.apartment ? `, ${order.shippingAddress.apartment}` : ""}<br>
          ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pincode}<br>
          Phone: ${order.customerPhone}
        </p>

        <p style="margin-top: 24px; font-size: 12px; color: #777;">
          Manage this order in <a href="http://localhost:3000/admin/orders">Admin Orders Dashboard</a>.
        </p>
      </div>
    </body>
    </html>
  `;

  const text = `
NEW PAID ORDER: ${order.orderReference}
Amount: ${formatINR(order.totalMinor)}
Customer: ${order.customerName} (${order.customerEmail}, ${order.customerPhone})

Items:
${order.items.map((i) => `- ${i.productTitle} (${i.variantTitle}) x${i.quantity}`).join("\n")}

Ship To:
${order.shippingAddress.fullName}
${order.shippingAddress.streetAddress}
${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pincode}
Phone: ${order.customerPhone}
  `.trim();

  return { subject, html, text };
}
