import { PaymentProvider, PaymentInitiateParams, PaymentInitiateResult, PaymentVerificationResult } from "./types";
import crypto from "crypto";

export interface PaytmConfig {
  mid: string;
  merchantKey: string;
  website: string;
  environment: "staging" | "production";
}

export class PaytmPaymentProvider implements PaymentProvider {
  readonly name = "paytm" as const;
  private readonly config: PaytmConfig;

  constructor(config: PaytmConfig) {
    this.config = config;
  }

  private getHostUrl(): string {
    return this.config.environment === "production"
      ? "https://securegw.paytm.in"
      : "https://securegw-stage.paytm.in";
  }

  /**
   * Generates SHA-256 HMAC signature for Paytm parameters
   */
  private generateSignature(params: Record<string, string>): string {
    const sortedKeys = Object.keys(params).sort();
    const paramString = sortedKeys.map((k) => `${k}=${params[k]}`).join("|");
    return crypto
      .createHmac("sha256", this.config.merchantKey)
      .update(paramString)
      .digest("base64");
  }

  /**
   * Verifies SHA-256 HMAC signature
   */
  private verifySignature(params: Record<string, string>, signature: string): boolean {
    const expected = this.generateSignature(params);
    return expected === signature;
  }

  async initiatePayment(params: PaymentInitiateParams): Promise<PaymentInitiateResult> {
    const rupees = (params.amountMinor / 100).toFixed(2);

    const formFields: Record<string, string> = {
      MID: this.config.mid,
      WEBSITE: this.config.website,
      ORDER_ID: params.orderReference,
      CUST_ID: params.customerPhone || params.orderId,
      TXN_AMOUNT: rupees,
      CHANNEL_ID: "WEB",
      INDUSTRY_TYPE_ID: "Retail",
      CALLBACK_URL: params.returnUrl,
      EMAIL: params.customerEmail,
      MOBILE_NO: params.customerPhone,
    };

    const checksum = this.generateSignature(formFields);
    formFields["CHECKSUMHASH"] = checksum;

    const hostUrl = this.getHostUrl();
    const formAction = `${hostUrl}/order/process`;

    return {
      provider: "paytm",
      orderReference: params.orderReference,
      amountMinor: params.amountMinor,
      formAction,
      formFields,
      isSimulator: false,
    };
  }

  async verifyCallback(payload: Record<string, string>): Promise<PaymentVerificationResult> {
    const orderRef = payload.ORDERID || "";
    const rupees = parseFloat(payload.TXNAMOUNT || "0");
    const amountMinor = Math.round(rupees * 100);
    const txnId = payload.TXNID || "";
    const status = payload.STATUS === "TXN_SUCCESS" ? "success" : "failed";
    const checksum = payload.CHECKSUMHASH || "";

    // Clean params for signature check
    const paramsToCheck: Record<string, string> = {};
    for (const [k, v] of Object.entries(payload)) {
      if (k !== "CHECKSUMHASH") {
        paramsToCheck[k] = v;
      }
    }

    const checksumValid = checksum ? this.verifySignature(paramsToCheck, checksum) : false;

    return {
      success: status === "success" && checksumValid,
      orderReference: orderRef,
      amountMinor,
      providerTxnId: txnId,
      status: status === "success" && checksumValid ? "success" : "failed",
      checksumValid,
      rawResponse: payload,
      errorMessage: checksumValid ? undefined : "Paytm checksum signature verification failed",
    };
  }
}
