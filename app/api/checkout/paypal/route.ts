import { NextRequest, NextResponse } from "next/server";
import { paypalProcessor } from "@/services/payment-processors/paypal";
import { createOrder, updateOrder } from "@/services/orders";
import { auth, db } from "@/lib/firebase-admin-server";
import { Product } from "@/types/product";

export async function POST(request: NextRequest) {
  try {
    const { productId, userId } = await request.json();

    if (!productId) {
      return NextResponse.json(
        { error: "Produkt ID fehlt" },
        { status: 400 }
      );
    }

    // Hole Produkt-Informationen
    const productDoc = await db.collection('products').doc(productId).get();
    const productData = productDoc.data() as Product;

    if (!productData) {
      return NextResponse.json(
        { error: "Produkt nicht gefunden" },
        { status: 404 }
      );
    }

    let userEmail = '';
    let userName = '';

    // Hole User-Informationen wenn verfügbar
    if (userId) {
      try {
        const user = await auth.getUser(userId);
        userEmail = user.email || '';
        userName = user.displayName || '';
      } catch (error) {
        console.error('Error fetching user:', error);
        // Continue without user info if fetch fails
      }
    }

    // Erstelle vorläufige Bestellung
    const order = await createOrder({
      userId: userId || 'anonymous',
      items: [{
        productId,
        productName: productData.name,
        quantity: 1,
        price: productData.price,
        total: productData.price
      }],
      total: productData.price,
      status: 'pending',
      paymentMethod: 'paypal',
      customerEmail: userEmail,
      customerName: userName
    });

    // Erstelle PayPal Checkout-Session
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (!baseUrl) {
      throw new Error("Missing NEXT_PUBLIC_APP_URL environment variable");
    }

    const session = await paypalProcessor.createCheckoutSession({
      product: productData,
      successUrl: `${baseUrl}/checkout/success?session_id=${order.id}&payment_method=paypal`,
      cancelUrl: `${baseUrl}/checkout/cancel`
    });

    return NextResponse.json({
      sessionId: session.sessionId,
      checkoutUrl: session.checkoutUrl,
      orderId: order.id
    });
  } catch (error) {
    console.error('Fehler beim Erstellen der PayPal Checkout-Session:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Interner Server-Fehler'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const token = searchParams.get('token'); // PayPal token from return URL

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID fehlt" },
        { status: 400 }
      );
    }

    console.log('Processing PayPal verification for session:', sessionId);

    // Get the order first to check its current status
    const order = await db.collection('orders').doc(sessionId).get();
    if (!order.exists) {
      console.error('Order not found:', sessionId);
      return NextResponse.json(
        { error: "Bestellung nicht gefunden" },
        { status: 404 }
      );
    }

    const orderData = order.data();
    if (orderData?.status === 'completed') {
      console.log('Order already completed:', sessionId);
      return NextResponse.json({
        success: true,
        message: 'Zahlung bereits verarbeitet'
      });
    }

    // Use the PayPal token if available, otherwise use the session ID
    const paypalOrderId = token || sessionId;
    console.log('Using PayPal order ID:', paypalOrderId);

    // Verifiziere die Zahlung bei PayPal
    const verification = await paypalProcessor.verifyPayment(paypalOrderId);
    console.log('PayPal verification result:', verification);

    if (verification.success) {
      // Aktualisiere den Bestellstatus
      await updateOrder(sessionId, {
        status: 'completed'
      });

      return NextResponse.json({
        success: true,
        message: 'Zahlung erfolgreich verarbeitet'
      });
    } else {
      // Log the verification failure details
      console.error('PayPal verification failed:', {
        sessionId,
        token,
        verification
      });

      // Aktualisiere den Bestellstatus auf fehlgeschlagen
      await updateOrder(sessionId, {
        status: 'cancelled'
      });

      return NextResponse.json({
        success: false,
        message: verification.error?.message || 'Zahlung konnte nicht verifiziert werden',
        details: verification.error?.details
      }, { status: 400 });
    }
  } catch (error) {
    console.error('Fehler bei der Zahlungsverifikation:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Interner Server-Fehler',
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
