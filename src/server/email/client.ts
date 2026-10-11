import { Resend } from "resend";
import { SendEmailResult } from "./types";

const resendApiKey = process.env.RESEND_API_KEY;
const resendClient = resendApiKey ? new Resend(resendApiKey) : null;

export const DEFAULT_FROM_EMAIL =
  process.env.EMAIL_FROM || "VAP Handicrafts <onboarding@resend.dev>";

export const ADMIN_ALERT_EMAIL =
  process.env.ADMIN_NOTIFICATION_EMAIL || "vaphandicrafts@gmail.com";

export async function sendEmail({
  to,
  subject,
  html,
  text,
  from = DEFAULT_FROM_EMAIL,
}: {
  to: string | string[];
  subject: string;
  html: string;
  text: string;
  from?: string;
}): Promise<SendEmailResult> {
  if (!resendClient) {
    console.warn("[EmailClient] Resend API key missing — mock email delivery skipped.");
    return {
      success: false,
      error: "RESEND_API_KEY is not configured.",
    };
  }

  try {
    const recipients = Array.isArray(to) ? to : [to];

    // Attempt primary send
    const { data, error } = await resendClient.emails.send({
      from,
      to: recipients,
      subject,
      html,
      text,
    });

    if (error) {
      console.warn(`[EmailClient] Primary send error (${error.name}): ${error.message}`);

      // Fallback for domain verification restrictions on Resend test sandboxes
      // If user supplied a @gmail.com or unverified domain in EMAIL_FROM, fallback to onboarding@resend.dev
      if (
        (error.message?.includes("domain") || error.name === "validation_error") &&
        from !== "VAP Handicrafts <onboarding@resend.dev>"
      ) {
        console.info("[EmailClient] Retrying send via onboarding@resend.dev test domain fallback...");
        const fallbackRes = await resendClient.emails.send({
          from: "VAP Handicrafts <onboarding@resend.dev>",
          to: recipients,
          subject,
          html,
          text,
        });

        if (fallbackRes.error) {
          return {
            success: false,
            error: fallbackRes.error.message,
          };
        }

        return {
          success: true,
          messageId: fallbackRes.data?.id,
        };
      }

      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      messageId: data?.id,
    };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error("[EmailClient] Exception while sending email:", errorMessage);
    return {
      success: false,
      error: errorMessage,
    };
  }
}
