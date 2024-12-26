import { Product } from "@/types/product";

export interface PaymentSession {
  sessionId: string;
  checkoutUrl: string;
}

export interface PaymentVerification {
  success: boolean;
  productId: string | undefined;
  isSubscription?: boolean;
  subscriptionId?: string;
  error?: {
    message: string;
    details?: string;
  };
}

export interface PaymentOptions {
  product: Product;
  successUrl: string;
  cancelUrl: string;
}

export interface PaymentProcessor {
  createCheckoutSession(options: PaymentOptions): Promise<PaymentSession>;
  verifyPayment(sessionId: string): Promise<PaymentVerification>;
}

export type PaymentMethod = "stripe" | "paypal" | "monero" | "sepa_debit";
