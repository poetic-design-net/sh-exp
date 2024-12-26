import { PaymentProcessor, PaymentOptions, PaymentSession, PaymentVerification } from "../types";
import Stripe from "stripe";

export class StripeProcessor implements PaymentProcessor {
  private stripe: Stripe;

  constructor() {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      throw new Error('Missing STRIPE_SECRET_KEY environment variable');
    }
    this.stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2024-12-18.acacia",
    });
  }

  async createCheckoutSession(options: PaymentOptions): Promise<PaymentSession> {
    const { product, successUrl, cancelUrl } = options;

    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: product.name,
              description: product.description || undefined,
            },
            unit_amount: Math.round(product.price * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: product.isSubscription ? 'subscription' : 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    return {
      sessionId: session.id,
      checkoutUrl: session.url || '',
    };
  }

  async verifyPayment(sessionId: string): Promise<PaymentVerification> {
    try {
      const session = await this.stripe.checkout.sessions.retrieve(sessionId);

      const success = session.payment_status === 'paid';
      const isSubscription = session.mode === 'subscription';
      const subscriptionId = session.subscription?.toString();

      return {
        success,
        productId: session.metadata?.productId,
        isSubscription,
        subscriptionId,
      };
    } catch (error) {
      console.error('Error verifying Stripe payment:', error);
      return {
        success: false,
        productId: undefined,
        error: {
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }
}
