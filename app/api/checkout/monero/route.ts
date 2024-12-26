import { NextRequest, NextResponse } from "next/server";
import { MoneroProcessorFactory } from "@/services/payment-processors/monero/monero-factory";
import { createOrder } from "@/services/orders";
import { auth, db } from "@/lib/firebase-admin-server";
import { Product } from "@/types/product";

// Explicitly set Node.js runtime
export const runtime = 'nodejs';
// Force dynamic to prevent static optimization
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { productId, userId } = await request.json();

    if (!productId) {
      return NextResponse.json(
        { error: "Produkt ID fehlt" },
        { status: 400 }
      );
    }

    // Get product information
    const productDoc = await db.collection('products').doc(productId).get();
    const product = productDoc.data() as Product;

    if (!product) {
      return NextResponse.json(
        { error: "Produkt nicht gefunden" },
        { status: 404 }
      );
    }

    // Get user info if available
    let userEmail = '';
    let userName = 'Anonymous';
    let customerId = '';

    if (userId) {
      const userRecord = await auth.getUser(userId);
      userEmail = userRecord.email || '';
      userName = userRecord.displayName || 'Anonymous';
      customerId = userRecord.uid;
    }

    const now = Date.now();

    // Create preliminary order
    const order = await createOrder({
      userId: userId || 'anonymous',
      items: [{
        productId,
        productName: product.name,
        quantity: 1,
        price: product.price,
        total: product.price
      }],
      total: product.price,
      status: 'pending',
      paymentMethod: 'monero',
      paymentMethodTitle: 'Monero (XMR)',
      customerEmail: userEmail,
      customerName: userName,
      customerId: customerId,
      currency: 'EUR',
      dateCreated: now
    });

    // Get Monero processor and create checkout session
    const moneroProcessor = MoneroProcessorFactory.getProcessor();
    const session = await moneroProcessor.createCheckoutSession({
      product,
      successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success`,
      cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/cancel`
    });

    return NextResponse.json({
      paymentId: session.sessionId,
      address: new URLSearchParams(session.checkoutUrl.split('?')[1]).get('address'),
      amount: new URLSearchParams(session.checkoutUrl.split('?')[1]).get('amount'),
      productName: product.name,
      eurAmount: product.price.toString()
    });
  } catch (error) {
    console.error('Fehler beim Erstellen der Monero Checkout-Session:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Interner Server-Fehler' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID fehlt" },
        { status: 400 }
      );
    }

    const moneroProcessor = MoneroProcessorFactory.getProcessor();
    const verification = await moneroProcessor.verifyPayment(sessionId);

    return NextResponse.json({
      success: verification.success
    });
  } catch (error) {
    console.error('Fehler bei der Monero Zahlungsverifizierung:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Interner Server-Fehler' },
      { status: 500 }
    );
  }
}
