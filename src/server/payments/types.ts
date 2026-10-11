export type PaymentProviderType = "paytm" | "simulator";

export interface PaymentInitiateParams {
  orderId: string;
  orderReference: string;
  amountMinor: number; // in integer paise (e.g. 59900)
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  returnUrl: string;
}

export interface PaymentInitiateResult {
  provider: PaymentProviderType;
  txnToken?: string;
  orderReference: string;
  amountMinor: number;
  redirectUrl?: string;
  formAction?: string;
  formFields?: Record<string, string>;
  isSimulator: boolean;
}

export interface PaymentVerificationResult {
  success: boolean;
  orderReference: string;
  amountMinor: number; // in integer paise
  providerTxnId: string;
  status: "success" | "failed" | "pending";
  checksumValid: boolean;
  rawResponse: Record<string, unknown>;
  errorMessage?: string;
}

export interface PaymentProvider {
  readonly name: PaymentProviderType;
  initiatePayment(params: PaymentInitiateParams): Promise<PaymentInitiateResult>;
  verifyCallback(payload: Record<string, string>): Promise<PaymentVerificationResult>;
}
