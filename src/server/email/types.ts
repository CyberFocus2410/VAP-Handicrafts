export type EmailTemplateType =
  | "order_confirmation_buyer"
  | "order_notification_admin"
  | "order_shipped_buyer";

export interface EmailOrderDetails {
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
  subtotalMinor: number;
  shippingMinor: number;
  discountMinor: number;
  totalMinor: number;
  trackingNumber?: string;
  courierName?: string;
}

export interface RenderedEmail {
  subject: string;
  html: string;
  text: string;
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}
