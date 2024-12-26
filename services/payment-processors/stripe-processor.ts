import Stripe from "stripe";
import { PaymentProcessor, PaymentOptions, PaymentSession, PaymentVerification } from "./types";
import { cleanHtml } from "@/lib/utils";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("Missing STRIPE_SECRET_KEY");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-12-18.acacia",
});

function mapPeriodToStripeInterval(period: string): Stripe.Price.Recurring.Interval {
  const intervalMap: { [key: string]: Stripe.Price.Recurring.Interval } = {
    'day': 'day',
    'week': 'week',
    'month': 'month',
    'year': 'year'
  };
  return intervalMap[period] || 'month';
}

export class StripeProcessor implements PaymentProcessor {
  async createCheckoutSession(options: PaymentOptions): Promise<PaymentSession> {
    const { product, successUrl, cancelUrl } = options;

    console.log('Creating Stripe checkout session for product:', {
      productId: product.id,
      price: product.price,
      name: product.name,
      isSubscription: product.isSubscription,
      subscription: product.subscription
    });

    // Extract userId from successUrl if present
    const urlParams = new URL(successUrl).searchParams;
    const userId = urlParams.get('userId');

    console.log('User ID from success URL:', userId);

    try {
      // Create or get Stripe Product
      const stripeProduct = await stripe.products.create({
        name: product.name,
        description: product.description ? cleanHtml(product.description) : undefined,
        images: product.images,
        metadata: {
          productId: product.id,
          isSubscription: product.isSubscription ? 'true' : 'false'
        }
      });

      // Create Price
      const priceData: Stripe.PriceCreateParams = {
        currency: 'eur',
        product: stripeProduct.id,
        unit_amount: Math.round(product.price * 100),
      };

      // Add recurring data for subscriptions
      if (product.isSubscription && product.subscription) {
        priceData.recurring = {
          interval: mapPeriodToStripeInterval(product.subscription.period),
        };
      }

      const price = await stripe.prices.create(priceData);

      // Determine if this should be a subscription or one-time payment
      const mode = product.isSubscription ? "subscription" : "payment";

      const sessionConfig: Stripe.Checkout.SessionCreateParams = {
        payment_method_types: ["card"],
        line_items: [{
          price: price.id,
          quantity: 1,
        }],
        mode,
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          productId: product.id,
          isSubscription: product.isSubscription ? 'true' : 'false',
          ...(userId && { userId })
        },
        payment_intent_data: mode === 'payment' ? {
          metadata: {
            productId: product.id,
            userId: userId || ''
          }
        } : undefined,
        subscription_data: mode === 'subscription' ? {
          metadata: {
            productId: product.id,
            userId: userId || ''
          }
        } : undefined,
      };

      const session = await stripe.checkout.sessions.create(sessionConfig);

      console.log('Stripe session created:', {
        sessionId: session.id,
        url: session.url,
        mode: session.mode
      });

      return {
        sessionId: session.id,
        checkoutUrl: session.url || '',
      };
    } catch (error) {
      console.error('Error creating Stripe session:', error);
      throw error;
    }
  }

  async verifyPayment(sessionId: string): Promise<PaymentVerification> {
    console.log('Verifying Stripe payment for session:', sessionId);

    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId, {
        expand: ['subscription', 'subscription.latest_invoice', 'payment_intent']
      });

      console.log('Retrieved Stripe session:', {
        paymentStatus: session.payment_status,
        productId: session.metadata?.productId,
        userId: session.metadata?.userId,
        isSubscription: session.metadata?.isSubscription,
        subscriptionId: session.subscription ? 
          (typeof session.subscription === 'string' ? session.subscription : session.subscription.id) 
          : undefined
      });

      const success = session.payment_status === "paid";
      
      if (!success) {
        return {
          success: false,
          productId: session.metadata?.productId,
          isSubscription: session.metadata?.isSubscription === 'true',
          subscriptionId: undefined
        };
      }

      // For subscriptions, verify the subscription status
      if (session.mode === 'subscription' && session.subscription) {
        const subscription = typeof session.subscription === 'string' 
          ? await stripe.subscriptions.retrieve(session.subscription)
          : session.subscription;

        const isSubscriptionActive = subscription.status === 'active' || subscription.status === 'trialing';

        if (!isSubscriptionActive) {
          console.error('Subscription is not active:', subscription.status);
          return {
            success: false,
            productId: session.metadata?.productId,
            isSubscription: true,
            subscriptionId: undefined,
            error: {
              message: 'Subscription is not active',
              details: `Subscription status: ${subscription.status}`
            }
          };
        }

        return {
          success: true,
          productId: session.metadata?.productId,
          isSubscription: true,
          subscriptionId: subscription.id
        };
      }

      // For one-time payments
      return {
        success: true,
        productId: session.metadata?.productId,
        isSubscription: false,
        subscriptionId: undefined
      };
    } catch (error) {
      console.error('Error verifying Stripe payment:', error);
      throw error;
    }
  }
}
