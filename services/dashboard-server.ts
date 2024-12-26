'use server';

import { db } from "lib/firebase-admin-server";
import type { Order } from "types/order";
import type { Product } from "types/product";
import type { DashboardSubscription } from "app/(auth)/app/dashboard/types";

export interface DashboardData {
  subscriptions: DashboardSubscription[];
  orders: Order[];
}

export async function getDashboardData(userId: string): Promise<DashboardData> {
  try {
    if (!userId) {
      console.error('getDashboardData called without userId');
      return { subscriptions: [], orders: [] };
    }

    // Fetch subscriptions and orders in parallel
    const [subscriptionsSnapshot, ordersSnapshot] = await Promise.all([
      db.collection("user_memberships")
        .where("userId", "==", userId)
        .get(),
      db.collection("orders")
        .where("userId", "==", userId)
        .orderBy("createdAt", "desc")
        .get()
    ]).catch(error => {
      console.error('Error fetching initial data:', error);
      throw new Error('Failed to fetch user data');
    });

    // Get subscriptions with membership and product details
    const subscriptionsPromises = subscriptionsSnapshot.docs.map(async (doc: FirebaseFirestore.QueryDocumentSnapshot) => {
      try {
        const subscriptionData = doc.data();
        const membershipId = subscriptionData?.membershipId;
        const productId = subscriptionData?.productId;
        
        if (!membershipId) {
          console.error(`Subscription ${doc.id} has no membershipId`);
          return null;
        }

        // Fetch both membership and product details in parallel
        const [membershipDoc, productDoc] = await Promise.all([
          db.collection("memberships").doc(membershipId).get(),
          productId ? db.collection("products").doc(productId).get() : null
        ]);

        const membershipData = membershipDoc.exists ? membershipDoc.data() : null;
        const productData = productDoc?.exists ? productDoc.data() as Product : undefined;

        // Get subscription details from the product if available
        const subscriptionDetails = productData?.subscription;

        const now = Date.now();

        // Transform to DashboardSubscription
        const dashboardSubscription: DashboardSubscription = {
          id: doc.id,
          userId: subscriptionData.userId,
          membershipId: subscriptionData.membershipId,
          status: subscriptionData.status || 'inactive',
          startDate: subscriptionData.startDate || now,
          endDate: subscriptionData.endDate || now,
          autoRenew: subscriptionData.autoRenew || false,
          name: membershipData?.name || subscriptionData?.name || 'Unbekannte Mitgliedschaft',
          description: membershipData?.description || subscriptionData?.description || '',
          features: membershipData?.features || subscriptionData?.features || [],
          price: subscriptionDetails?.price || subscriptionData?.subscriptionPrice || subscriptionData?.price || 0,
          length: subscriptionDetails?.length || subscriptionData?.subscriptionLength || 1,
          period: (subscriptionDetails?.period || subscriptionData?.subscriptionPeriod || 'month') as 'day' | 'week' | 'month' | 'year',
          trialLength: subscriptionDetails?.trialLength || subscriptionData?.trialLength || 0,
          productType: productData?.type || subscriptionData?.productType || 'subscription',
          createdAt: typeof subscriptionData.createdAt === 'number' 
            ? subscriptionData.createdAt 
            : now,
          updatedAt: typeof subscriptionData.updatedAt === 'number' 
            ? subscriptionData.updatedAt 
            : now
        };

        return dashboardSubscription;
      } catch (error) {
        console.error(`Error processing subscription ${doc.id}:`, error);
        return null;
      }
    });

    const subscriptions = (await Promise.all(subscriptionsPromises))
      .filter((sub): sub is DashboardSubscription => sub !== null);

    const orders = ordersSnapshot.docs.map((doc: FirebaseFirestore.QueryDocumentSnapshot) => {
      try {
        const data = doc.data();
        const now = Date.now();
        return {
          id: doc.id,
          ...data,
          createdAt: typeof data.createdAt === 'number' ? data.createdAt : now,
          updatedAt: typeof data.updatedAt === 'number' ? data.updatedAt : now,
          status: data.status || 'pending',
          total: data.total || 0,
        } as Order;
      } catch (error) {
        console.error(`Error processing order ${doc.id}:`, error);
        return null;
      }
    }).filter((order): order is Order => order !== null);

    return {
      subscriptions,
      orders
    };
  } catch (error) {
    console.error('Error in getDashboardData:', error);
    // Return empty data instead of throwing
    return {
      subscriptions: [],
      orders: []
    };
  }
}
