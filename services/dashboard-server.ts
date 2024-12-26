import { db } from "@/lib/firebase-admin-server";
import type { Subscription } from "@/types/membership";
import type { Order } from "@/types/order";
import type { Product } from "@/types/product";
import type { DashboardSubscription } from "@/app/(auth)/app/dashboard/types";

export interface DashboardData {
  subscriptions: DashboardSubscription[];
  orders: Order[];
}

export async function getDashboardData(userId: string): Promise<DashboardData> {
  // Fetch subscriptions and orders in parallel
  const [subscriptionsSnapshot, ordersSnapshot] = await Promise.all([
    db.collection("user_memberships")
      .where("userId", "==", userId)
      .get(),
    db.collection("orders")
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .get()
  ]);

  // Get subscriptions with membership and product details
  const subscriptionsPromises = subscriptionsSnapshot.docs.map(async (doc) => {
    const subscriptionData = doc.data();
    const membershipId = subscriptionData.membershipId;
    const productId = subscriptionData.productId;
    
    // Fetch both membership and product details in parallel
    const [membershipDoc, productDoc] = await Promise.all([
      db.collection("memberships").doc(membershipId).get(),
      productId ? db.collection("products").doc(productId).get() : null
    ]);

    const membershipData = membershipDoc.data();
    const productData = productDoc?.data() as Product | undefined;

    // Get subscription details from the product if available
    const subscriptionDetails = productData?.subscription;

    // Transform to DashboardSubscription
    const dashboardSubscription: DashboardSubscription = {
      id: doc.id,
      userId: subscriptionData.userId,
      membershipId: subscriptionData.membershipId,
      status: subscriptionData.status,
      startDate: subscriptionData.startDate,
      endDate: subscriptionData.endDate,
      autoRenew: subscriptionData.autoRenew,
      name: membershipData?.name || subscriptionData.name || 'Unbekannte Mitgliedschaft',
      description: membershipData?.description || subscriptionData.description,
      features: membershipData?.features || subscriptionData.features,
      price: subscriptionDetails?.price || subscriptionData.subscriptionPrice || subscriptionData.price || 0,
      length: subscriptionDetails?.length || subscriptionData.subscriptionLength || 1,
      period: (subscriptionDetails?.period || subscriptionData.subscriptionPeriod || 'month') as 'day' | 'week' | 'month' | 'year',
      trialLength: subscriptionDetails?.trialLength || subscriptionData.trialLength || 0,
      productType: productData?.type || subscriptionData.productType,
      createdAt: subscriptionData.createdAt,
      updatedAt: subscriptionData.updatedAt
    };

    return dashboardSubscription;
  });

  const subscriptions = await Promise.all(subscriptionsPromises);

  const orders = ordersSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Order[];

  return {
    subscriptions,
    orders
  };
}
