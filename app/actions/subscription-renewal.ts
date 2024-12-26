"use server";

import { db } from "@/lib/firebase-admin-server";
import type { Subscription } from "@/types/membership";
import { revalidatePath } from "next/cache";

interface RenewalResult {
  success: boolean;
  message: string;
  subscription?: Subscription;
}

export async function processSubscriptionRenewal(subscriptionId: string): Promise<RenewalResult> {
  try {
    // Hole das Abonnement
    const subscriptionDoc = await db.collection("user_memberships").doc(subscriptionId).get();
    if (!subscriptionDoc.exists) {
      return {
        success: false,
        message: "Abonnement nicht gefunden"
      };
    }

    const subscription = {
      id: subscriptionDoc.id,
      ...subscriptionDoc.data()
    } as Subscription;

    // Prüfe, ob das Abonnement für die automatische Verlängerung geeignet ist
    if (!subscription.autoRenew || subscription.status !== 'active') {
      return {
        success: false,
        message: "Abonnement ist nicht für automatische Verlängerung konfiguriert"
      };
    }

    // Berechne das neue Enddatum (30 Tage von jetzt)
    const now = Date.now();
    const newEndDate = now + (30 * 24 * 60 * 60 * 1000); // 30 Tage in Millisekunden

    // Aktualisiere das Abonnement
    await db.collection("user_memberships").doc(subscriptionId).update({
      endDate: newEndDate,
      updatedAt: now,
      // Behalte WooCommerce-spezifische Felder bei
      wooCommerceMemberId: subscription.wooCommerceMemberId,
      wooCommercePlanId: subscription.wooCommercePlanId,
      wooCommerceOrderId: subscription.wooCommerceOrderId,
      wooCommerceProductId: subscription.wooCommerceProductId,
      wooCommerceSubscriptionId: subscription.wooCommerceSubscriptionId
    });

    // Hole das aktualisierte Abonnement
    const updatedDoc = await db.collection("user_memberships").doc(subscriptionId).get();
    const updatedSubscription = {
      id: updatedDoc.id,
      ...updatedDoc.data()
    } as Subscription;

    revalidatePath('/app');

    return {
      success: true,
      message: "Abonnement erfolgreich verlängert",
      subscription: updatedSubscription
    };
  } catch (error) {
    console.error('Error in processSubscriptionRenewal:', error);
    return {
      success: false,
      message: "Fehler bei der Verlängerung des Abonnements"
    };
  }
}

export async function checkAndRenewSubscriptions(): Promise<void> {
  try {
    const now = Date.now();
    // Hole alle aktiven Abonnements, die in den nächsten 24 Stunden ablaufen
    const subscriptionsToRenew = await db
      .collection("user_memberships")
      .where("status", "==", "active")
      .where("autoRenew", "==", true)
      .where("endDate", "<=", now + (24 * 60 * 60 * 1000)) // 24 Stunden in Millisekunden
      .get();

    const batch = db.batch();
    const newEndDate = now + (30 * 24 * 60 * 60 * 1000); // 30 Tage in Millisekunden

    subscriptionsToRenew.docs.forEach((doc) => {
      batch.update(doc.ref, {
        endDate: newEndDate,
        updatedAt: now
      });
    });

    await batch.commit();
    revalidatePath('/app');

    console.log(`${subscriptionsToRenew.size} Abonnements wurden automatisch verlängert`);
  } catch (error) {
    console.error('Error in checkAndRenewSubscriptions:', error);
  }
}

// Funktion zum Überprüfen des Verlängerungsstatus eines Abonnements
export async function checkRenewalStatus(subscriptionId: string): Promise<{
  shouldRenew: boolean;
  daysUntilRenewal: number;
}> {
  try {
    const doc = await db.collection("user_memberships").doc(subscriptionId).get();
    if (!doc.exists) {
      throw new Error("Abonnement nicht gefunden");
    }

    const subscription = {
      id: doc.id,
      ...doc.data()
    } as Subscription;

    const now = Date.now();
    const daysUntilRenewal = Math.floor((subscription.endDate - now) / (1000 * 60 * 60 * 24));
    const shouldRenew = subscription.autoRenew && 
                       subscription.status === 'active' && 
                       daysUntilRenewal <= 7; // Verlängerung in den nächsten 7 Tagen

    return {
      shouldRenew,
      daysUntilRenewal
    };
  } catch (error) {
    console.error('Error in checkRenewalStatus:', error);
    return {
      shouldRenew: false,
      daysUntilRenewal: 0
    };
  }
}
