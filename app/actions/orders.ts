"use server";

import { db } from "@/lib/firebase-admin-server";
import type { Order, OrdersResponse } from "@/types/order";
import { revalidatePath } from "next/cache";

type SortField = 'createdAt' | 'customerName' | 'total' | 'status';
type SortOrder = 'asc' | 'desc';
type FilterOptions = {
  status?: Order['status'] | 'all';
  startDate?: number;
  endDate?: number;
  archived?: boolean;
  searchTerm?: string;
};

async function getNextOrderNumber(): Promise<number> {
  const snapshot = await db.collection("orders")
    .orderBy("orderNumber", "desc")
    .limit(1)
    .get();

  if (snapshot.empty) {
    return 1;
  }

  const lastOrder = snapshot.docs[0].data();
  return (lastOrder.orderNumber || 0) + 1;
}

function getOrderDate(order: any): number {
  // For WooCommerce orders, use dateCreated
  if (order.wooOrderId && order.dateCreated) {
    return order.dateCreated;
  }
  // For new orders, use createdAt
  return order.createdAt || Date.now();
}

// Cache for orders
const ordersCache = new Map<string, { orders: Order[], timestamp: number }>();
const ORDERS_CACHE_TTL = 2 * 60 * 1000; // 2 minutes cache for orders

export async function clearOrdersCache(): Promise<{ success: true }> {
  ordersCache.clear();
  return { success: true };
}

export async function getOrders(
  page: number = 1, 
  perPage: number = 20,
  sortField: SortField = 'createdAt',
  sortOrder: SortOrder = 'desc',
  filters?: FilterOptions
): Promise<OrdersResponse> {
  try {
    const cacheKey = JSON.stringify({ page, perPage, sortField, sortOrder, filters });
    const cached = ordersCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < ORDERS_CACHE_TTL) {
      const total = cached.orders.length;
      const totalPages = Math.ceil(total / perPage);
      const start = (page - 1) * perPage;
      return {
        orders: cached.orders.slice(start, start + perPage),
        total,
        totalPages
      };
    }

    console.log('Getting orders with filters:', JSON.stringify(filters, null, 2));

    // Build query with filters first
    let query = db.collection("orders") as FirebaseFirestore.Query<FirebaseFirestore.DocumentData>;

    console.log('Getting orders with filters:', JSON.stringify(filters, null, 2));

    // Build initial query without any filters to check what orders exist
    let initialQuery = db.collection("orders");
    const initialSnapshot = await initialQuery.get();
    console.log('Initial check - total orders:', initialSnapshot.size);
    
    // Log details of first few orders to understand their structure
    if (!initialSnapshot.empty) {
      initialSnapshot.docs.slice(0, 3).forEach(doc => {
        console.log('Order structure:', {
          id: doc.id,
          hasIsArchived: 'isArchived' in doc.data(),
          hasWooOrderId: 'wooOrderId' in doc.data(),
          fields: Object.keys(doc.data())
        });
      });
    }

    // Always start with createdAt sorting as it's part of our compound indexes
    query = query.orderBy('createdAt', sortOrder);

    // Apply filters based on available indexes
    if (filters) {
      if (filters.status && filters.status !== 'all') {
        // Use the createdAt + status compound index
        query = query.where("status", "==", filters.status as Order['status']);
      } else if (filters.archived) {
        // For archived view, show completed orders
        query = query.where("status", "==", "completed");
      } else {
        // For active view, filter out completed orders
        // Note: We can't use != with compound indexes, so we'll filter in memory
        const allSnapshot = await query.get();
        const filteredOrders = allSnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() } as Order))
          .filter(order => order.status !== 'completed');
        
        // Apply text search filter if needed
        let orders = filteredOrders;
        if (filters?.searchTerm) {
          const searchLower = filters.searchTerm.toLowerCase();
          orders = orders.filter(order => 
            (order.customerName?.toLowerCase().includes(searchLower) || 
             order.customerEmail?.toLowerCase().includes(searchLower) ||
             order.id?.toLowerCase().includes(searchLower) ||
             order.orderNumber?.toString().includes(filters.searchTerm!))
          );
        }

        // Update cache
        ordersCache.set(cacheKey, { orders, timestamp: Date.now() });

        return {
          orders: orders.slice((page - 1) * perPage, page * perPage),
          total: orders.length,
          totalPages: Math.ceil(orders.length / perPage)
        };
      }
    }

    // Get filtered results
    console.log('Executing Firestore query...');
    const querySnapshot = await query.get();
    console.log(`Query returned ${querySnapshot.size} orders`);
    
    // Convert to array and normalize dates
    let orders = querySnapshot.docs.map((doc: FirebaseFirestore.QueryDocumentSnapshot) => {
      const data = doc.data();
      console.log('Order:', {
        id: doc.id,
        status: data.status,
        isArchived: data.isArchived,
        createdAt: data.createdAt
      });
      return {
        id: doc.id,
        ...data
      };
    }) as Order[];

    // Apply text search filter in memory if needed
    if (filters?.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      orders = orders.filter(order => 
        (order.customerName?.toLowerCase().includes(searchLower) || 
         order.customerEmail?.toLowerCase().includes(searchLower) ||
         order.id?.toLowerCase().includes(searchLower) ||
         order.orderNumber?.toString().includes(filters.searchTerm!))
      );
    }

    // Update cache
    ordersCache.set(cacheKey, { orders, timestamp: Date.now() });

    // Apply sorting
    orders.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'createdAt') {
        comparison = getOrderDate(a) - getOrderDate(b);
      } else if (sortField === 'customerName') {
        comparison = (a.customerName || '').localeCompare(b.customerName || '');
      } else if (sortField === 'total') {
        comparison = a.total - b.total;
      } else if (sortField === 'status') {
        comparison = (a.status || '').localeCompare(b.status || '');
      }
      return sortOrder === 'desc' ? -comparison : comparison;
    });

    // Calculate pagination
    const total = orders.length;
    const totalPages = Math.ceil(total / perPage);
    const start = (page - 1) * perPage;
    const paginatedOrders = orders.slice(start, start + perPage);

    return {
      orders: paginatedOrders,
      total,
      totalPages
    };
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
}

export async function getOrderById(orderId: string): Promise<Order | null> {
  try {
    const doc = await db.collection("orders").doc(orderId).get();
    if (!doc.exists) return null;
    
    return {
      id: doc.id,
      ...doc.data()
    } as Order;
  } catch (error) {
    console.error(`Error fetching order ${orderId}:`, error);
    throw error;
  }
}

export async function getOrdersByCustomerId(customerId: string): Promise<Order[]> {
  try {
    const ordersSnapshot = await db
      .collection("orders")
      .where("customerId", "==", customerId)
      .get();

    const orders = ordersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Order[];

    // Sort by date (considering both WooCommerce and new orders)
    return orders.sort((a, b) => getOrderDate(b) - getOrderDate(a));
  } catch (error) {
    console.error(`Error fetching orders for customer ${customerId}:`, error);
    throw error;
  }
}

export async function updateOrderStatus(
  orderId: string, 
  status: Order['status']
): Promise<Order> {
  try {
    const now = Date.now();
    const updateData: any = {
      status,
      updatedAt: now,
      ...(status === 'completed' && { 
        datePaid: now,
        isArchived: true 
      })
    };

    await db.collection("orders").doc(orderId).update(updateData);

    revalidatePath('/admin/orders');
    
    const updatedOrder = await getOrderById(orderId);
    if (!updatedOrder) throw new Error("Order not found after update");
    
    return updatedOrder;
  } catch (error) {
    console.error(`Error updating order ${orderId} status:`, error);
    throw error;
  }
}

export async function toggleOrderArchive(orderId: string): Promise<Order> {
  try {
    const order = await getOrderById(orderId);
    if (!order) throw new Error("Order not found");

    const isArchived = !order.isArchived;
    await db.collection("orders").doc(orderId).update({
      isArchived,
      updatedAt: Date.now()
    });

    revalidatePath('/admin/orders');
    
    return {
      ...order,
      isArchived
    };
  } catch (error) {
    console.error(`Error toggling archive for order ${orderId}:`, error);
    throw error;
  }
}

export async function getOrdersBySubscriptionId(subscriptionId: string): Promise<Order[]> {
  try {
    const ordersSnapshot = await db
      .collection("orders")
      .where("stripeSubscriptionId", "==", subscriptionId)
      .get();

    const orders = ordersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Order[];

    // Sort by date (considering both WooCommerce and new orders)
    return orders.sort((a, b) => getOrderDate(b) - getOrderDate(a));
  } catch (error) {
    console.error(`Error fetching orders for subscription ${subscriptionId}:`, error);
    throw error;
  }
}

export async function createOrder(orderData: Omit<Order, "id" | "createdAt" | "updatedAt" | "orderNumber">): Promise<Order> {
  try {
    const now = Date.now();
    const orderNumber = await getNextOrderNumber();
    const data = {
      ...orderData,
      orderNumber,
      createdAt: now,
      updatedAt: now,
      isArchived: false
    };

    const docRef = await db.collection("orders").add(data);
    revalidatePath('/admin/orders');

    return {
      id: docRef.id,
      ...data
    } as Order;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
}

export async function refundOrder(orderId: string): Promise<Order> {
  try {
    const order = await getOrderById(orderId);
    if (!order) throw new Error("Order not found");
    
    // Check if order can be refunded
    if (order.status === 'refunded') {
      throw new Error("Order is already refunded");
    }
    if (!order.stripePaymentIntentId && !order.paymentMethod) {
      throw new Error("No payment information found");
    }

    // Handle different payment methods
    if (order.stripePaymentIntentId) {
      const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
      await stripe.refunds.create({
        payment_intent: order.stripePaymentIntentId
      });
    } else if (order.paymentMethod === 'paypal') {
      const { paypalProcessor } = await import("@/services/payment-processors/paypal");
      await paypalProcessor.refundPayment(order.id);
    } else if (order.paymentMethod === 'monero') {
      // For Monero, we can only mark as refunded since refunds must be done manually
      console.log("Monero refund must be processed manually");
    }

    // Update order status
    const now = Date.now();
    await db.collection("orders").doc(orderId).update({
      status: 'refunded',
      updatedAt: now
    });

    revalidatePath('/admin/orders');
    
    const updatedOrder = await getOrderById(orderId);
    if (!updatedOrder) throw new Error("Order not found after refund");
    
    return updatedOrder;
  } catch (error) {
    console.error(`Error refunding order ${orderId}:`, error);
    throw error;
  }
}

export async function deleteOrder(orderId: string): Promise<void> {
  try {
    const order = await getOrderById(orderId);
    if (!order) throw new Error("Order not found");
    if (!order.isArchived) throw new Error("Only archived orders can be deleted");

    await db.collection("orders").doc(orderId).delete();
    revalidatePath('/admin/orders');
  } catch (error) {
    console.error(`Error deleting order ${orderId}:`, error);
    throw error;
  }
}

// Cache for order stats
const statsCache = new Map<string, { stats: any, timestamp: number }>();
const STATS_CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache for stats

export async function getOrderStats() {
  try {
    // Check cache first
    const cached = statsCache.get('orderStats');
    if (cached && (Date.now() - cached.timestamp) < STATS_CACHE_TTL) {
      return cached.stats;
    }

    const now = Date.now();
    const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);

    // Get total count using more efficient count() method
    const totalSnapshot = await db.collection("orders").count().get();
    const total = totalSnapshot.data().count;

    // Get last 30 days count
    const last30DaysSnapshot = await db
      .collection("orders")
      .where("createdAt", ">=", thirtyDaysAgo)
      .count()
      .get();
    const last30Days = last30DaysSnapshot.data().count;

    // Get counts by status using separate queries
    const [completedSnapshot, processingSnapshot, pendingSnapshot] = await Promise.all([
      db.collection("orders").where("status", "==", "completed").count().get(),
      db.collection("orders").where("status", "==", "processing").count().get(),
      db.collection("orders").where("status", "==", "pending").count().get()
    ]);

    const stats = {
      total,
      last30Days,
      byStatus: {
        completed: completedSnapshot.data().count,
        processing: processingSnapshot.data().count,
        pending: pendingSnapshot.data().count
      }
    };

    // Update cache
    statsCache.set('orderStats', { stats, timestamp: Date.now() });

    return stats;
  } catch (error) {
    console.error('Error fetching order stats:', error);
    throw error;
  }
}
