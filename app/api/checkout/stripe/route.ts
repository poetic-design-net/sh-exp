import { NextRequest, NextResponse } from "next/server";
import { auth, db } from "@/lib/firebase-admin-server";
import { StripeProcessorFactory } from "@/services/payment-processors/stripe/stripe-factory";
import { Product } from "@/types/product";
import { createOrder, getOrderBySessionId } from "@/services/orders";
import { createSubscription, getMembershipById } from "@/app/actions/memberships";

// Explicitly set Node.js runtime
export const runtime = 'nodejs';
// Force dynamic to prevent static optimization
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { productId, userId } = await request.json();

    console.log('Creating checkout session:', { productId, userId });

    if (!productId) {
      return NextResponse.json(
        { error: "Produkt ID fehlt" },
        { status: 400 }
      );
    }

    // Get product information
    const productDoc = await db.collection('products').doc(productId).get();
    const productData = productDoc.data() as Product;

    if (!productData) {
      return NextResponse.json(
        { error: "Produkt nicht gefunden" },
        { status: 404 }
      );
    }

    // Validate product data
    if (typeof productData.price !== 'number' || isNaN(productData.price)) {
      return NextResponse.json(
        { error: "Ungültiger Produktpreis" },
        { status: 400 }
      );
    }

    // Get the base URL for success/cancel URLs
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (!baseUrl) {
      throw new Error("Missing NEXT_PUBLIC_APP_URL environment variable");
    }

    // Get the Stripe processor from the factory
    const stripeProcessor = StripeProcessorFactory.getProcessor();

    // Create checkout session using the processor
    const session = await stripeProcessor.createCheckoutSession({
      product: productData,
      successUrl: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}&payment_method=stripe&userId=${userId || ''}&productId=${productId}`,
      cancelUrl: `${baseUrl}/checkout/cancel`
    });

    console.log('Checkout session created:', {
      sessionId: session.sessionId,
      userId,
      productId,
      isSubscription: productData.isSubscription,
      subscription: productData.subscription
    });

    return NextResponse.json({
      sessionId: session.sessionId,
      checkoutUrl: session.checkoutUrl
    });
  } catch (error) {
    console.error('Stripe session creation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const userId = searchParams.get('userId');
    const productId = searchParams.get('productId');

    console.log('Verifying payment:', { sessionId, userId, productId });

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID fehlt" },
        { status: 400 }
      );
    }

    if (!userId) {
      console.error('User ID fehlt in der Zahlungsverifizierung');
      return NextResponse.json(
        { error: "User ID fehlt" },
        { status: 400 }
      );
    }

    try {
      // Check if order already exists for this session
      const existingOrder = await getOrderBySessionId(sessionId);
      if (existingOrder) {
        console.log('Order already exists for session:', sessionId);
        return NextResponse.json({
          success: true,
          productId: existingOrder.items[0]?.productId,
          isSubscription: false,
          subscriptionId: undefined
        });
      }

      // Get the Stripe processor from the factory
      const stripeProcessor = StripeProcessorFactory.getProcessor();
      
      // Verify payment using the processor
      const verification = await stripeProcessor.verifyPayment(sessionId);
      
      console.log('Payment verification result:', verification);

      if (!verification) {
        return NextResponse.json({
          success: false,
          error: "Payment verification failed"
        });
      }

      if (verification.success) {
        console.log('Payment successful, creating order...');

        try {
          // Get product details
          const verifiedProductId = productId || verification.productId;
          if (!verifiedProductId) {
            throw new Error('Product ID not found in verification');
          }

          const productDoc = await db.collection('products').doc(verifiedProductId).get();
          const productData = productDoc.data() as Product;

          if (!productData) {
            throw new Error('Product not found');
          }

          // Get user details
          const userDoc = await db.collection('users').doc(userId).get();
          const userData = userDoc.data();

          if (!userData) {
            throw new Error('User not found');
          }

          const now = Date.now();

          // Create order
          const order = await createOrder({
            userId,
            items: [{
              productId: verifiedProductId,
              productName: productData.name,
              quantity: 1,
              price: productData.price,
              total: productData.price
            }],
            total: productData.price,
            status: 'completed',
            paymentMethod: 'stripe',
            customerEmail: userData.email,
            customerName: userData.displayName || 'Unknown',
            sessionId
          });

          console.log('Order created:', order);

          // If the product is a subscription and we have a subscription ID, create the membership
          if (productData.isSubscription && verification.subscriptionId) {
            console.log('Creating subscription for membership product...');
            
            if (!productData.membershipPlanIds || productData.membershipPlanIds.length === 0) {
              throw new Error('Keine Membership-Plan-IDs für das Produkt gefunden');
            }

            const membershipId = productData.membershipPlanIds[0];
            console.log('Using membership ID:', membershipId);

            const membership = await getMembershipById(membershipId);
            if (!membership) {
              console.error('Membership not found:', membershipId);
              console.error('Available membershipPlanIds:', productData.membershipPlanIds);
              throw new Error(`Membership ${membershipId} not found`);
            }
            
            const subscription = await createSubscription({
              userId,
              membershipId,
              startDate: now,
              autoRenew: true,
              paymentGateway: 'stripe',
              paymentStatus: 'paid',
              price: productData.price,
              currency: 'EUR',
              lastPaymentDate: now,
              orderId: order.id,
              productId: verifiedProductId
            });

            console.log('Subscription created:', subscription);
          }

          return NextResponse.json({
            success: true,
            productId: verifiedProductId,
            isSubscription: verification.isSubscription,
            subscriptionId: verification.subscriptionId
          });
        } catch (error) {
          console.error('Error creating order/subscription:', error);
          throw error;
        }
      } else {
        return NextResponse.json({
          success: false,
          error: "Payment not successful"
        });
      }
    } catch (error) {
      console.error('Error during payment verification process:', error);
      throw error;
    }
  } catch (error) {
    console.error('Stripe payment verification error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}
