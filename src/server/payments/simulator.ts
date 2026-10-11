import { PaymentProvider, PaymentInitiateParams, PaymentInitiateResult, PaymentVerificationResult } from "./types";
import crypto from "crypto";

export class SimulatorPaymentProvider implements PaymentProvider {
  readonly name = "simulator" as const;

  async initiatePayment(params: PaymentInitiateParams): Promise<PaymentInitiateResult> {
    const mockTxnToken = `SIM_TXN_${crypto.randomUUID().slice(0, 8).toUpperCase()}`;

    // Redirect to local simulator completion view
    const redirectUrl = `/checkout/simulator?orderRef=${encodeURIComponent(
      params.orderReference
    )}&amountMinor=${params.amountMinor}&token=${mockTxnToken}`;

    return {
      provider: "simulator",
      txnToken: mockTxnToken,
      orderReference: params.orderReference,
      amountMinor: params.amountMinor,
      redirectUrl,
      isSimulator: true,
    };
  }

  async verifyCallback(payload: Record<string, string>): Promise<PaymentVerificationResult> {
    const orderRef = payload.orderRef || payload.ORDERID || "";
    const amountMinorStr = payload.amountMinor || payload.TXNAMOUNT_PAISE || "0";
    const amountMinor = parseInt(amountMinorStr, 10);
    const mockTxnId = payload.txnId || payload.TXNID || `SIM_TXN_${Date.now()}`;
    const status = payload.status === "failed" ? "failed" : "success";

    return {
      success: status === "success",
      orderReference: orderRef,
      amountMinor,
      providerTxnId: mockTxnId,
      status: status === "success" ? "success" : "failed",
      checksumValid: true,
      rawResponse: payload,
    };
  }
}
