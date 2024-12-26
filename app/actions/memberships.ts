"use server";

import { db } from "@/lib/firebase-admin-server";
import type { 
  Membership, 
  CreateMembershipInput, 
  UpdateMembershipInput, 
  Subscription, 
  CreateSubscriptionInput, 
  UpdateSubscriptionInput 
} from "@/types/membership";
import { revalidatePath } from "next/cache";

export interface PaginatedMemberships {
  memberships: Membership[];
  total: number;
  hasMore: boolean;
}

// Memberships
// Cache for memberships
const membershipsCache = new Map<string, { data: PaginatedMemberships, timestamp: number }>();
const MEMBERSHIPS_CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache

export async function getMemberships(page: number = 1, limit: number = 10, loadAll: boolean = false): Promise<PaginatedMemberships> {
  const cacheKey = `memberships-${page}-${limit}-${loadAll}`;
  
  // Check cache first
  const cached = membershipsCache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp) < MEMBERSHIPS_CACHE_TTL) {
    return cached.data;
  }

  // Get total count first
  const totalSnapshot = await db.collection("memberships").count().get();
  const total = totalSnapshot.data().count;

  // If loadAll is true, ignore pagination and get all memberships
  let query = db.collection("memberships").orderBy("createdAt", "desc");
  if (!loadAll) {
    query = query.limit(limit).offset((page - 1) * limit);
  }
  
  const snapshot = await query.get();

  const memberships = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Membership[];

  const hasMore = total > page * limit;

  const result = {
    memberships,
    total,
    hasMore
  };

  // Update cache
  membershipsCache.set(cacheKey, { data: result, timestamp: Date.now() });

  return result;
}

// Cache for single memberships
const membershipCache = new Map<string, { membership: Membership | null, timestamp: number }>();
const MEMBERSHIP_CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache

export async function getMembershipById(id: string): Promise<Membership | null> {
  // Check cache first
  const cached = membershipCache.get(id);
  if (cached && (Date.now() - cached.timestamp) < MEMBERSHIP_CACHE_TTL) {
    return cached.membership;
  }

  const doc = await db.collection("memberships").doc(id).get();
  const membership = doc.exists ? {
    id: doc.id,
    ...doc.data(),
  } as Membership : null;

  // Update cache
  membershipCache.set(id, { membership, timestamp: Date.now() });

  return membership;
}

export async function createMembership(input: CreateMembershipInput): Promise<Membership> {
  const now = Date.now();
  const data = {
    ...input,
    createdAt: now,
    updatedAt: now,
  };
  
  const docRef = await db.collection("memberships").add(data);
  revalidatePath("/admin/memberships");
  
  return {
    id: docRef.id,
    ...data,
  };
}

export async function updateMembership(id: string, input: UpdateMembershipInput): Promise<Membership> {
  const now = Date.now();
  const data = {
    ...input,
    updatedAt: now,
  };
  
  await db.collection("memberships").doc(id).update(data);
  revalidatePath("/admin/memberships");
  
  const doc = await db.collection("memberships").doc(id).get();
  if (!doc.exists) {
    throw new Error("Membership not found");
  }

  return {
    id: doc.id,
    ...doc.data(),
  } as Membership;
}

export async function deleteMembership(id: string): Promise<void> {
  await db.collection("memberships").doc(id).delete();
  revalidatePath("/admin/memberships");
}

interface UserMembershipData {
  userId: string;
  membershipId: string;
  status: string;
  startDate: number;
  endDate?: number;
  autoRenew?: boolean;
  price?: number;
  currency?: string;
  paymentGateway?: string;
  paymentStatus?: string;
  lastPaymentDate?: number;
  nextPaymentDate?: number;
  wooCommerceMemberId?: string;
  wooCommercePlanId?: string;
  wooCommerceOrderId?: string;
  wooCommerceProductId?: string;
  wooCommerceSubscriptionId?: string;
  createdAt?: number;
  updatedAt?: number;
}

interface MembershipData {
  name?: string;
  description?: string;
  features?: string[];
  price?: number;
  currency?: string;
}

// Cache for user subscriptions
const userSubscriptionsCache = new Map<string, { subscriptions: Subscription[], timestamp: number }>();
const USER_SUBSCRIPTIONS_CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache

// Cache for membership data
const membershipDataCache = new Map<string, { data: MembershipData, timestamp: number }>();
const MEMBERSHIP_DATA_CACHE_TTL = 10 * 60 * 1000; // 10 minutes cache

async function getMembershipData(membershipId: string): Promise<MembershipData> {
  // Check cache first
  const cached = membershipDataCache.get(membershipId);
  if (cached && (Date.now() - cached.timestamp) < MEMBERSHIP_DATA_CACHE_TTL) {
    return cached.data;
  }

  const defaultData: MembershipData = {
    name: 'Unbekannte Mitgliedschaft',
    description: '',
    features: []
  };

  try {
    const membershipDoc = await db
      .collection("memberships")
      .doc(membershipId)
      .get();

    if (!membershipDoc.exists) {
      return defaultData;
    }

    const data = membershipDoc.data() as MembershipData;
    const membershipData = {
      name: data.name || defaultData.name,
      description: data.description || defaultData.description,
      features: data.features || defaultData.features,
      price: data.price,
      currency: data.currency
    };

    // Update cache
    membershipDataCache.set(membershipId, { data: membershipData, timestamp: Date.now() });

    return membershipData;
  } catch (error) {
    console.error(`Error fetching membership ${membershipId}:`, error);
    return defaultData;
  }
}

// User Memberships
export async function getUserSubscriptions(userId: string): Promise<Subscription[]> {
  try {
    // Check cache first
    const cached = userSubscriptionsCache.get(userId);
    if (cached && (Date.now() - cached.timestamp) < USER_SUBSCRIPTIONS_CACHE_TTL) {
      return cached.subscriptions;
    }

    const userMembershipsSnapshot = await db
      .collection("user_memberships")
      .where("userId", "==", userId)
      .where("status", "in", ["active", "pending"])
      .limit(10) // Limit to recent subscriptions
      .orderBy("createdAt", "desc")
      .get();

    if (userMembershipsSnapshot.empty) {
      return [];
    }

    const subscriptions = await Promise.all(
      userMembershipsSnapshot.docs.map(async (doc) => {
        const userMembershipData = doc.data() as UserMembershipData;
        
        // Get membership data (will use cache if available)
        const membershipData = userMembershipData.wooCommercePlanId
          ? await getMembershipData(`wc_${userMembershipData.wooCommercePlanId}`)
          : userMembershipData.membershipId
          ? await getMembershipData(userMembershipData.membershipId)
          : {
              name: 'Unbekannte Mitgliedschaft',
              description: '',
              features: []
            };

        const subscription: Subscription = {
          id: doc.id,
          userId: userMembershipData.userId,
          membershipId: userMembershipData.membershipId,
          status: (userMembershipData.status as Subscription['status']) || 'active',
          startDate: userMembershipData.startDate || Date.now(),
          endDate: userMembershipData.endDate || (Date.now() + 30 * 24 * 60 * 60 * 1000),
          autoRenew: userMembershipData.autoRenew ?? true,
          price: userMembershipData.price || membershipData.price,
          currency: userMembershipData.currency || membershipData.currency || 'EUR',
          paymentGateway: userMembershipData.paymentGateway,
          paymentStatus: (userMembershipData.paymentStatus as Subscription['paymentStatus']) || 'paid',
          lastPaymentDate: userMembershipData.lastPaymentDate,
          nextPaymentDate: userMembershipData.nextPaymentDate,
          name: membershipData.name,
          description: membershipData.description,
          features: membershipData.features,
          wooCommerceMemberId: userMembershipData.wooCommerceMemberId,
          wooCommercePlanId: userMembershipData.wooCommercePlanId,
          wooCommerceOrderId: userMembershipData.wooCommerceOrderId || '',
          wooCommerceProductId: userMembershipData.wooCommerceProductId || '',
          wooCommerceSubscriptionId: userMembershipData.wooCommerceSubscriptionId || '',
          createdAt: userMembershipData.createdAt || Date.now(),
          updatedAt: userMembershipData.updatedAt || Date.now()
        };

        return subscription;
      })
    );

    // Update cache
    userSubscriptionsCache.set(userId, { subscriptions, timestamp: Date.now() });

    return subscriptions;
  } catch (error) {
    console.error('Error in getUserSubscriptions:', error);
    return [];
  }
}

export async function getSubscriptionById(id: string): Promise<Subscription | null> {
  try {
    const doc = await db.collection("user_memberships").doc(id).get();
    if (!doc.exists) return null;

    const userMembershipData = doc.data() as UserMembershipData;
    let membershipData: MembershipData = {
      name: 'Unbekannte Mitgliedschaft',
      description: '',
      features: []
    };

    // Try to fetch membership data using wooCommercePlanId first
    if (userMembershipData.wooCommercePlanId) {
      try {
        const membershipDoc = await db
          .collection("memberships")
          .doc(`wc_${userMembershipData.wooCommercePlanId}`)
          .get();

        if (membershipDoc.exists) {
          const data = membershipDoc.data() as MembershipData;
          membershipData = {
            name: data.name || membershipData.name,
            description: data.description || membershipData.description,
            features: data.features || membershipData.features,
            price: data.price,
            currency: data.currency
          };
        }
      } catch (error) {
        console.error(`Error fetching WooCommerce membership ${userMembershipData.wooCommercePlanId}:`, error);
      }
    }
    // Fallback to membershipId if wooCommercePlanId didn't work
    else if (userMembershipData.membershipId) {
      try {
        const membershipDoc = await db
          .collection("memberships")
          .doc(userMembershipData.membershipId)
          .get();

        if (membershipDoc.exists) {
          const data = membershipDoc.data() as MembershipData;
          membershipData = {
            name: data.name || membershipData.name,
            description: data.description || membershipData.description,
            features: data.features || membershipData.features,
            price: data.price,
            currency: data.currency
          };
        }
      } catch (error) {
        console.error(`Error fetching membership ${userMembershipData.membershipId}:`, error);
      }
    }

    return {
      id: doc.id,
      userId: userMembershipData.userId,
      membershipId: userMembershipData.membershipId,
      status: (userMembershipData.status as Subscription['status']) || 'active',
      startDate: userMembershipData.startDate || Date.now(),
      endDate: userMembershipData.endDate || (Date.now() + 30 * 24 * 60 * 60 * 1000),
      autoRenew: userMembershipData.autoRenew ?? true, // Standard ist true
      price: userMembershipData.price || membershipData.price,
      currency: userMembershipData.currency || membershipData.currency || 'EUR',
      paymentGateway: userMembershipData.paymentGateway,
      paymentStatus: (userMembershipData.paymentStatus as Subscription['paymentStatus']) || 'paid',
      lastPaymentDate: userMembershipData.lastPaymentDate,
      nextPaymentDate: userMembershipData.nextPaymentDate,
      name: membershipData.name,
      description: membershipData.description,
      features: membershipData.features,
      wooCommerceMemberId: userMembershipData.wooCommerceMemberId,
      wooCommercePlanId: userMembershipData.wooCommercePlanId,
      wooCommerceOrderId: userMembershipData.wooCommerceOrderId || '',
      wooCommerceProductId: userMembershipData.wooCommerceProductId || '',
      wooCommerceSubscriptionId: userMembershipData.wooCommerceSubscriptionId || '',
      createdAt: userMembershipData.createdAt || Date.now(),
      updatedAt: userMembershipData.updatedAt || Date.now()
    } as Subscription;
  } catch (error) {
    console.error('Error in getSubscriptionById:', error);
    return null;
  }
}

export async function createSubscription(input: CreateSubscriptionInput): Promise<Subscription> {
  const membership = await getMembershipById(input.membershipId);
  if (!membership) throw new Error("Membership not found");

  const now = Date.now();
  const endDate = now + (membership.duration * 24 * 60 * 60 * 1000);

  const data = {
    ...input,
    status: 'active' as const,
    startDate: now,
    endDate,
    autoRenew: true, // Standard ist true
    createdAt: now,
    updatedAt: now,
  };
  
  const docRef = await db.collection("user_memberships").add(data);
  revalidatePath(`/admin/memberships/user/${input.userId}`);
  
  return getSubscriptionById(docRef.id) as Promise<Subscription>;
}

export async function updateSubscription(id: string, input: UpdateSubscriptionInput): Promise<Subscription> {
  const now = Date.now();
  const data = {
    ...input,
    updatedAt: now,
  };
  
  await db.collection("user_memberships").doc(id).update(data);
  return getSubscriptionById(id) as Promise<Subscription>;
}

export async function cancelSubscription(id: string): Promise<void> {
  const subscription = await getSubscriptionById(id);
  if (!subscription) throw new Error("Subscription not found");

  const now = Date.now();
  await db.collection("user_memberships").doc(id).update({
    status: 'cancelled',
    autoRenew: false,
    updatedAt: now,
  });

  revalidatePath(`/admin/memberships/user/${subscription.userId}`);
}

// Utility functions
export async function checkSubscriptionStatus(): Promise<void> {
  const now = Date.now();
  const snapshot = await db
    .collection("user_memberships")
    .where("status", "==", "active")
    .where("endDate", "<=", now)
    .get();

  const batch = db.batch();
  snapshot.docs.forEach((doc) => {
    batch.update(doc.ref, {
      status: 'expired',
      updatedAt: now,
    });
  });

  await batch.commit();
  revalidatePath("/admin/memberships");
}
