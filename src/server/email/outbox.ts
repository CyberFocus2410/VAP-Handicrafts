import { getSupabaseAdminClient } from "@/server/db/supabase";
import { EmailOrderDetails, EmailTemplateType, RenderedEmail } from "./types";
import { renderOrderConfirmationEmail } from "./templates/order-confirmation";
import { renderAdminOrderAlertEmail } from "./templates/admin-order-alert";
import { renderOrderShippedEmail } from "./templates/order-shipped";
import { sendEmail, ADMIN_ALERT_EMAIL } from "./client";

export function renderEmail(
  template: EmailTemplateType,
  details: EmailOrderDetails
): RenderedEmail {
  switch (template) {
    case "order_confirmation_buyer":
      return renderOrderConfirmationEmail(details);
    case "order_notification_admin":
      return renderAdminOrderAlertEmail(details);
    case "order_shipped_buyer":
      return renderOrderShippedEmail(details);
    default:
      throw new Error(`Unknown email template: ${template}`);
  }
}

export async function enqueueEmail({
  orderId,
  recipientEmail,
  templateType,
  details,
}: {
  orderId?: string;
  recipientEmail: string;
  templateType: EmailTemplateType;
  details: EmailOrderDetails;
}): Promise<{ id?: string; immediateSendSuccess?: boolean }> {
  const rendered = renderEmail(templateType, details);
  const supabase = getSupabaseAdminClient();

  let outboxId: string | undefined;

  // Attempt to write to email_outbox table in Supabase
  try {
    const { data, error } = await supabase
      .from("email_outbox")
      .insert({
        order_id: orderId || null,
        recipient_email: recipientEmail,
        template_type: templateType,
        subject: rendered.subject,
        html_body: rendered.html,
        text_body: rendered.text,
        status: "pending",
        retry_count: 0,
      })
      .select("id")
      .single();

    if (!error && data) {
      outboxId = data.id;
    } else {
      console.warn(
        `[Outbox] Could not insert to email_outbox (${error?.message || "unknown"}). Falling back to immediate send.`
      );
    }
  } catch (err) {
    console.warn("[Outbox] email_outbox table write skipped:", err);
  }

  // Attempt dispatch
  const sendResult = await sendEmail({
    to: recipientEmail,
    subject: rendered.subject,
    html: rendered.html,
    text: rendered.text,
  });

  // If we had an outbox entry, update its state
  if (outboxId) {
    try {
      await supabase
        .from("email_outbox")
        .update({
          status: sendResult.success ? "sent" : "failed",
          provider_message_id: sendResult.messageId || null,
          last_error: sendResult.error || null,
          sent_at: sendResult.success ? new Date().toISOString() : null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", outboxId);
    } catch (err) {
      console.warn("[Outbox] Failed to update outbox record:", err);
    }
  }

  return { id: outboxId, immediateSendSuccess: sendResult.success };
}

/**
 * Convenience helper to enqueue both Buyer confirmation and Admin notification upon paid order.
 */
export async function enqueueOrderPaidEmails(
  orderDetails: EmailOrderDetails,
  orderId?: string
) {
  const results = await Promise.allSettled([
    // 1. Buyer order confirmation
    enqueueEmail({
      orderId,
      recipientEmail: orderDetails.customerEmail,
      templateType: "order_confirmation_buyer",
      details: orderDetails,
    }),
    // 2. Admin workshop alert
    enqueueEmail({
      orderId,
      recipientEmail: ADMIN_ALERT_EMAIL,
      templateType: "order_notification_admin",
      details: orderDetails,
    }),
  ]);

  return results;
}

/**
 * Background / cron dispatcher to retry any failed or pending emails in the outbox.
 */
export async function dispatchPendingOutboxEmails(): Promise<{
  processed: number;
  sent: number;
  failed: number;
}> {
  const supabase = getSupabaseAdminClient();
  const stats = { processed: 0, sent: 0, failed: 0 };

  try {
    const { data: pendingRows, error } = await supabase
      .from("email_outbox")
      .select("*")
      .eq("status", "pending")
      .lt("retry_count", 3)
      .limit(20);

    if (error || !pendingRows || pendingRows.length === 0) {
      return stats;
    }

    for (const row of pendingRows) {
      stats.processed++;
      const result = await sendEmail({
        to: row.recipient_email,
        subject: row.subject,
        html: row.html_body,
        text: row.text_body,
      });

      if (result.success) {
        stats.sent++;
        await supabase
          .from("email_outbox")
          .update({
            status: "sent",
            provider_message_id: result.messageId || null,
            sent_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", row.id);
      } else {
        stats.failed++;
        await supabase
          .from("email_outbox")
          .update({
            status: row.retry_count >= 2 ? "failed" : "pending",
            retry_count: row.retry_count + 1,
            last_error: result.error || "Unknown delivery error",
            updated_at: new Date().toISOString(),
          })
          .eq("id", row.id);
      }
    }
  } catch (err) {
    console.error("[Outbox] Dispatch error:", err);
  }

  return stats;
}
