import { db } from "@/lib/firebase-admin";
import { emailService } from "@/services/email";
const ORDERS_COLLECTION = "orders";
export async function getOrders() {
    const snapshot = await db.collection(ORDERS_COLLECTION).orderBy('createdAt', 'desc').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}
export async function getOrderById(orderId) {
    const orderDoc = await db.collection(ORDERS_COLLECTION).doc(orderId).get();
    return orderDoc.exists ? { id: orderDoc.id, ...orderDoc.data() } : null;
}
export async function getUserOrders(userId) {
    const snapshot = await db
        .collection(ORDERS_COLLECTION)
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}
export async function getOrderBySessionId(sessionId) {
    const snapshot = await db
        .collection(ORDERS_COLLECTION)
        .where('sessionId', '==', sessionId)
        .limit(1)
        .get();
    if (snapshot.empty) {
        return null;
    }
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() };
}
export async function createOrder(data) {
    // Check for existing order with the same session ID if provided
    if (data.sessionId) {
        const existingOrder = await getOrderBySessionId(data.sessionId);
        if (existingOrder) {
            console.log('Order already exists for session:', data.sessionId);
            return existingOrder;
        }
    }
    const now = Date.now();
    const orderData = {
        ...data,
        createdAt: now,
        updatedAt: now,
    };
    const docRef = await db.collection(ORDERS_COLLECTION).add(orderData);
    const newOrder = { id: docRef.id, ...orderData };
    // Sende Bestellbestätigung
    await emailService.sendEmail('order-confirmation', {
        to: data.customerEmail,
        subject: 'Ihre Bestellung bei Stefan Hiene',
        templateData: {
            orderNumber: docRef.id,
            items: data.items,
            total: data.total
        }
    });
    return newOrder;
}
export async function updateOrder(orderId, data) {
    const orderRef = db.collection(ORDERS_COLLECTION).doc(orderId);
    const order = await getOrderById(orderId);
    if (!order) {
        throw new Error('Bestellung nicht gefunden');
    }
    const updates = {
        ...data,
        updatedAt: Date.now(),
    };
    await orderRef.update(updates);
    // Sende Status-Update Email, wenn sich der Status geändert hat
    if (data.status && data.status !== order.status) {
        await emailService.sendEmail('status-update', {
            to: order.customerEmail,
            subject: 'Update zu Ihrer Bestellung',
            templateData: {
                orderNumber: orderId,
                newStatus: data.status
            }
        });
        // Wenn die Bestellung abgeschlossen ist, sende die Zahlungsbestätigung
        if (data.status === 'completed') {
            await emailService.sendEmail('payment-receipt', {
                to: order.customerEmail,
                subject: 'Zahlungsbestätigung für Ihre Bestellung',
                templateData: {
                    orderNumber: orderId,
                    total: order.total,
                    paymentMethod: order.paymentMethod
                }
            });
        }
    }
    return {
        ...order,
        ...updates,
    };
}
export async function getOrderStats() {
    const orders = await getOrders();
    return {
        total: orders.length,
        completed: orders.filter(o => o.status === 'completed').length,
        pending: orders.filter(o => o.status === 'pending').length,
        cancelled: orders.filter(o => o.status === 'cancelled').length,
        totalRevenue: orders
            .filter(o => o.status === 'completed')
            .reduce((sum, order) => sum + order.total, 0),
    };
}
