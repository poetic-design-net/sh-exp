import { NextRequest, NextResponse } from "next/server";

// No runtime specification needed as this is just a router
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { paymentMethod } = await request.json();

    if (!paymentMethod) {
      return NextResponse.json(
        { error: "Missing payment method" },
        { status: 400 }
      );
    }

    // Forward the request to the appropriate payment processor endpoint
    const url = new URL(request.url);
    switch (paymentMethod) {
      case "stripe":
        url.pathname = "/api/checkout/stripe";
        return NextResponse.rewrite(url);
      case "monero":
        url.pathname = "/api/checkout/monero";
        return NextResponse.rewrite(url);
      case "paypal":
        url.pathname = "/api/checkout/paypal";
        return NextResponse.rewrite(url);
      default:
        return NextResponse.json(
          { error: "Invalid payment method" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Checkout routing error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const paymentMethod = searchParams.get("paymentMethod");

    if (!paymentMethod) {
      return NextResponse.json(
        { error: "Missing payment method" },
        { status: 400 }
      );
    }

    // Forward the request to the appropriate payment processor endpoint
    const url = new URL(request.url);
    switch (paymentMethod) {
      case "stripe":
        url.pathname = "/api/checkout/stripe";
        return NextResponse.rewrite(url);
      case "monero":
        url.pathname = "/api/checkout/monero";
        return NextResponse.rewrite(url);
      case "paypal":
        url.pathname = "/api/checkout/paypal";
        return NextResponse.rewrite(url);
      default:
        return NextResponse.json(
          { error: "Invalid payment method" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Payment verification routing error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
