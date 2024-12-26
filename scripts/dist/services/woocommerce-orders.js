import WooCommerceRestApi from "@woocommerce/woocommerce-rest-api";
import { db } from "@/lib/firebase-admin-server";
const api = new WooCommerceRestApi({
    url: process.env.NEXT_PUBLIC_WORDPRESS_URL || '',
    consumerKey: process.env.WC_CONSUMER_KEY || '',
    consumerSecret: process.env.WC_CONSUMER_SECRET || '',
    version: 'wc/v3'
});
export async function getWooOrders(page = 1, perPage = 10) {
    try {
        const { data, headers } = await api.get('orders', {
            per_page: perPage,
            page: page,
            orderby: 'date',
            order: 'desc'
        });
        return {
            orders: data,
            total: parseInt(headers['x-wp-total'] || '0'),
            totalPages: parseInt(headers['x-wp-totalpages'] || '0')
        };
    }
    catch (error) {
        console.error('Error fetching WooCommerce orders:', error);
        throw error;
    }
}
export async function getWooOrderById(orderId) {
    try {
        const { data } = await api.get(`orders/${orderId}`);
        return data;
    }
    catch (error) {
        console.error(`Error fetching WooCommerce order ${orderId}:`, error);
        throw error;
    }
}
export async function getWooOrdersByCustomerId(customerId) {
    try {
        const { data } = await api.get('orders', {
            customer: customerId,
            orderby: 'date',
            order: 'desc'
        });
        return data;
    }
    catch (error) {
        console.error(`Error fetching WooCommerce orders for customer ${customerId}:`, error);
        throw error;
    }
}
export async function getWooOrdersBySubscriptionId(subscriptionId) {
    try {
        const { data } = await api.get('orders', {
            subscription: subscriptionId,
            orderby: 'date',
            order: 'desc'
        });
        return data;
    }
    catch (error) {
        console.error(`Error fetching WooCommerce orders for subscription ${subscriptionId}:`, error);
        throw error;
    }
}
// Hilfsfunktion zum Extrahieren der Stripe-Informationen aus den Metadaten
export function getStripeInfoFromOrder(order) {
    const stripeInfo = {
        paymentIntentId: '',
        subscriptionId: '',
        customerId: ''
    };
    order.meta_data.forEach(meta => {
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
    return stripeInfo;
}
// Funktion zum Synchronisieren einer Order mit Firebase
export async function syncOrderWithFirebase(order) {
    try {
        const stripeInfo = getStripeInfoFromOrder(order);
        const orderData = {
            wooOrderId: order.id.toString(),
            status: order.status,
            total: parseFloat(order.total),
            currency: order.currency,
            dateCreated: new Date(order.date_created).getTime(),
            datePaid: order.date_paid ? new Date(order.date_paid).getTime() : null,
            paymentMethod: order.payment_method,
            paymentMethodTitle: order.payment_method_title,
            customerId: order.customer_id.toString(),
            customerEmail: order.billing.email,
            customerName: `${order.billing.first_name} ${order.billing.last_name}`,
            items: order.line_items.map(item => ({
                productId: item.product_id.toString(),
                name: item.name,
                quantity: item.quantity,
                total: parseFloat(item.total)
            })),
            subscriptionId: order.subscription_id?.toString(),
            stripePaymentIntentId: stripeInfo.paymentIntentId,
            stripeSubscriptionId: stripeInfo.subscriptionId,
            stripeCustomerId: stripeInfo.customerId,
            updatedAt: Date.now()
        };
        await db.collection('orders').doc(order.id.toString()).set(orderData, { merge: true });
        return orderData;
    }
    catch (error) {
        console.error(`Error syncing order ${order.id} with Firebase:`, error);
        throw error;
    }
}
// Funktion zum Synchronisieren aller Orders
export async function syncAllOrders() {
    try {
        let page = 1;
        let hasMore = true;
        while (hasMore) {
            const { orders, totalPages } = await getWooOrders(page, 100);
            // Parallel synchronisieren
            await Promise.all(orders.map(order => syncOrderWithFirebase(order)));
            hasMore = page < totalPages;
            page++;
        }
        console.log('Successfully synced all orders with Firebase');
    }
    catch (error) {
        console.error('Error syncing orders:', error);
        throw error;
    }
}
