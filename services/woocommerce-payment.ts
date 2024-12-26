import WooCommerceRestApi from "@woocommerce/woocommerce-rest-api";
import { Subscription } from "@/types/membership";

// WooCommerce API Client initialisieren
const api = new WooCommerceRestApi({
  url: process.env.NEXT_PUBLIC_WORDPRESS_URL || '',
  consumerKey: process.env.WC_CONSUMER_KEY || '',
  consumerSecret: process.env.WC_CONSUMER_SECRET || '',
  version: 'wc/v3'
});

interface WooSubscription {
  id: number;
  status: string;
  billing_period: string;
  billing_interval: string;
  start_date: string;
  next_payment_date: string;
  total: string;
  payment_method: string;
  payment_method_title: string;
}

interface WooOrder {
  id: number;
  status: string;
  total: string;
  payment_method: string;
  payment_method_title: string;
  date_paid: string;
}

export async function getWooCommercePaymentInfo(subscription: Subscription) {
  try {
    let paymentInfo = {
      price: 0,
      currency: 'EUR',
      paymentGateway: '',
      paymentStatus: 'pending',
      lastPaymentDate: null,
      nextPaymentDate: null,
      stripeSubscriptionId: null
    };

    // Wenn es eine WooCommerce Subscription ID gibt
    if (subscription.wooCommerceSubscriptionId) {
      const { data: wooSubscription } = await api.get(
        `subscriptions/${subscription.wooCommerceSubscriptionId}`
      ) as { data: WooSubscription };

      paymentInfo = {
        ...paymentInfo,
        price: parseFloat(wooSubscription.total),
        paymentGateway: wooSubscription.payment_method_title,
        paymentStatus: mapWooStatus(wooSubscription.status),
        nextPaymentDate: new Date(wooSubscription.next_payment_date).getTime()
      };

      // Hole Stripe Subscription ID aus den Metadaten
      const { data: subscriptionMeta } = await api.get(
        `subscriptions/${subscription.wooCommerceSubscriptionId}/meta_data`
      );
      const stripeMeta = subscriptionMeta.find((meta: any) => 
        meta.key === '_stripe_subscription_id'
      );
      if (stripeMeta) {
        paymentInfo.stripeSubscriptionId = stripeMeta.value;
      }
    }

    // Wenn es eine WooCommerce Order ID gibt
    if (subscription.wooCommerceOrderId) {
      const { data: order } = await api.get(
        `orders/${subscription.wooCommerceOrderId}`
      ) as { data: WooOrder };

      paymentInfo = {
        ...paymentInfo,
        lastPaymentDate: order.date_paid ? new Date(order.date_paid).getTime() : null,
        paymentStatus: order.status === 'completed' ? 'paid' : mapWooStatus(order.status)
      };
    }

    return paymentInfo;
  } catch (error) {
    console.error('Error fetching WooCommerce payment info:', error);
    return null;
  }
}

function mapWooStatus(status: string): 'paid' | 'pending' | 'failed' {
  switch (status) {
    case 'completed':
    case 'active':
    case 'processing':
      return 'paid';
    case 'pending':
    case 'on-hold':
      return 'pending';
    case 'failed':
    case 'cancelled':
    case 'refunded':
      return 'failed';
    default:
      return 'pending';
  }
}

export async function syncWooCommercePaymentInfo(subscription: Subscription): Promise<Subscription | null> {
  try {
    const paymentInfo = await getWooCommercePaymentInfo(subscription);
    if (!paymentInfo) return null;

    // Aktualisiere die Subscription in Firebase
    const updatedData = {
      ...subscription,
      price: paymentInfo.price,
      currency: paymentInfo.currency,
      paymentGateway: paymentInfo.paymentGateway,
      paymentStatus: paymentInfo.paymentStatus,
      lastPaymentDate: paymentInfo.lastPaymentDate,
      nextPaymentDate: paymentInfo.nextPaymentDate,
      stripeSubscriptionId: paymentInfo.stripeSubscriptionId,
      updatedAt: Date.now()
    };

    await db.collection("user_memberships").doc(subscription.id).update(updatedData);
    return updatedData;
  } catch (error) {
    console.error('Error syncing WooCommerce payment info:', error);
    return null;
  }
}

// Funktion zum Synchronisieren aller aktiven Mitgliedschaften
export async function syncAllWooCommercePaymentInfo() {
  try {
    const snapshot = await db
      .collection("user_memberships")
      .where("status", "==", "active")
      .get();

    const updatePromises = snapshot.docs.map(async (doc) => {
      const subscription = { id: doc.id, ...doc.data() } as Subscription;
      return syncWooCommercePaymentInfo(subscription);
    });

    await Promise.all(updatePromises);
    console.log('Successfully synced all WooCommerce payment info');
  } catch (error) {
    console.error('Error syncing all WooCommerce payment info:', error);
  }
}
