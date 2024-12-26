import { NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";

export async function POST(request: Request) {
  try {
    const { productId, userId, paymentIntentId } = await request.json();

    // Get the product to check if it grants any memberships
    const productDoc = await db.collection("products").doc(productId).get();
    const product = productDoc.data();

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Get memberships that this product grants
    const membershipsSnapshot = await db
      .collection("memberships")
      .where("productIds", "array-contains", productId)
      .where("isActive", "==", true)
      .get();

    // For each membership this product grants
    for (const membershipDoc of membershipsSnapshot.docs) {
      const membership = membershipDoc.data();
      
      // Calculate end date based on membership duration
      const startDate = Date.now();
      const endDate = startDate + (membership.duration * 24 * 60 * 60 * 1000); // Convert days to milliseconds

      // Create subscription
      await db.collection("subscriptions").add({
        userId,
        membershipId: membershipDoc.id,
        productId,
        orderId: paymentIntentId,
        status: "active",
        startDate,
        endDate,
        autoRenew: false,
        createdAt: startDate,
        updatedAt: startDate,
      });
    }

    // Update payment status
    await db.collection("payments").doc(paymentIntentId).update({
      status: "completed",
      updatedAt: Date.now(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error activating membership:", error);
    return NextResponse.json(
      { error: "Failed to activate membership" },
      { status: 500 }
    );
  }
}
