"use server";

import { db } from "@/lib/firebase-admin-server";
import type { Order } from "@/types/order";
import { revalidatePath } from "next/cache";

interface WooOrder {
  id: number;
  status: string;
  total: string;
  currency: string;
  date_created: string;
  date_paid?: string;
  payment_method: string;
  payment_method_title: string;
  customer_id: number;
  billing: {
    first_name: string;
    last_name: string;
    email: string;
  };
  line_items: Array<{
    id: number;
    name: string;
    product_id: number;
    quantity: number;
    total: string;
  }>;
  meta_data: Array<{
    key: string;
    value: string;
  }>;
}

function convertWooOrderToFirebaseOrder(wooOrder: WooOrder): Omit<Order, "id"> {
  // Extrahiere Stripe-Informationen aus den Metadaten
  const stripeInfo = {
    paymentIntentId: '',
    subscriptionId: '',
    customerId: ''
  };

  wooOrder.meta_data.forEach(meta => {
    switch (meta.key) {
      case '_stripe_payment_intent':
        stripeInfo.paymentIntentId = meta.value;
        break;
      case '_stripe_subscription_id':
        stripeInfo.subscriptionId = meta.value;
        break;
      case '_stripe_customer_id':
        stripeInfo.customerId = meta.value;
        break;
    }
  });

  const now = Date.now();
  
  return {
    userId: wooOrder.customer_id.toString(),
    status: wooOrder.status as Order['status'],
    total: parseFloat(wooOrder.total),
    currency: wooOrder.currency,
    dateCreated: new Date(wooOrder.date_created).getTime(),
    datePaid: wooOrder.date_paid ? new Date(wooOrder.date_paid).getTime() : undefined,
    paymentMethod: wooOrder.payment_method,
    paymentMethodTitle: wooOrder.payment_method_title,
    customerId: wooOrder.customer_id.toString(),
    customerEmail: wooOrder.billing.email,
    customerName: `${wooOrder.billing.first_name} ${wooOrder.billing.last_name}`,
    items: wooOrder.line_items.map(item => ({
      productId: item.product_id.toString(),
      productName: item.name,
      quantity: item.quantity,
      price: parseFloat(item.total) / item.quantity,
      total: parseFloat(item.total)
    })),
    wooOrderId: wooOrder.id.toString(),
    stripePaymentIntentId: stripeInfo.paymentIntentId || undefined,
    stripeSubscriptionId: stripeInfo.subscriptionId || undefined,
    stripeCustomerId: stripeInfo.customerId || undefined,
    createdAt: now,
    updatedAt: now
  };
}

export async function migrateWooOrder(wooOrder: WooOrder): Promise<Order> {
  try {
    const orderData = convertWooOrderToFirebaseOrder(wooOrder);
    
    // Verwende die WooCommerce Order ID als Firebase Document ID
    const docRef = db.collection("orders").doc(wooOrder.id.toString());
    await docRef.set(orderData, { merge: true });

    revalidatePath('/admin/orders');

    return {
      id: docRef.id,
      ...orderData
    };
  } catch (error) {
    console.error(`Error migrating WooCommerce order ${wooOrder.id}:`, error);
    throw error;
  }
}

export async function migrateWooOrders(wooOrders: WooOrder[]): Promise<void> {
  try {
    const batch = db.batch();
    
    wooOrders.forEach(wooOrder => {
      const orderData = convertWooOrderToFirebaseOrder(wooOrder);
      const docRef = db.collection("orders").doc(wooOrder.id.toString());
      batch.set(docRef, orderData, { merge: true });
    });

    await batch.commit();
    revalidatePath('/admin/orders');
    
    console.log(`Successfully migrated ${wooOrders.length} orders`);
  } catch (error) {
    console.error('Error migrating WooCommerce orders:', error);
    throw error;
  }
}

export async function checkMigrationStatus(): Promise<{
  totalOrders: number;
  migratedOrders: number;
}> {
  try {
    const snapshot = await db.collection("orders").count().get();
    return {
      totalOrders: 0, // Dies müsste aus WooCommerce kommen
      migratedOrders: snapshot.data().count
    };
  } catch (error) {
    console.error('Error checking migration status:', error);
    throw error;
  }
}

// Hilfsfunktion zum Überprüfen, ob eine Order bereits migriert wurde
export async function isOrderMigrated(wooOrderId: string): Promise<boolean> {
  try {
    const doc = await db.collection("orders").doc(wooOrderId).get();
    return doc.exists;
  } catch (error) {
    console.error(`Error checking if order ${wooOrderId} is migrated:`, error);
    throw error;
  }
}
