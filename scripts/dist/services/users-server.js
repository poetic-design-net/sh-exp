import { db } from "@/lib/firebase-admin";
import { getAuth } from "firebase-admin/auth";
// User Collection Reference
const USERS_COLLECTION = "users";
const SUBSCRIPTIONS_COLLECTION = "subscriptions";
// Get all users
export async function getUsers() {
    const snapshot = await db.collection(USERS_COLLECTION).get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}
// Create a new user
export async function createUser(input) {
    // Create Firebase Auth user
    const userRecord = await getAuth().createUser({
        email: input.email,
        password: input.password,
        displayName: input.displayName,
    });
    const now = Date.now();
    const user = {
        id: userRecord.uid,
        email: input.email,
        displayName: input.displayName,
        firstName: input.firstName,
        lastName: input.lastName,
        phoneNumber: input.phoneNumber,
        photoURL: input.photoURL,
        bio: input.bio,
        role: 'user',
        isActive: true,
        wooCommerceUserId: input.wooCommerceUserId,
        createdAt: now,
        updatedAt: now,
    };
    // Store additional user data in Firestore
    await db.collection(USERS_COLLECTION).doc(user.id).set(user);
    return user;
}
// Get user by ID
export async function getUserById(userId) {
    const userDoc = await db.collection(USERS_COLLECTION).doc(userId).get();
    return userDoc.exists ? userDoc.data() : null;
}
// Get user by WooCommerce ID
export async function getUserByWooCommerceId(wooCommerceId) {
    const snapshot = await db
        .collection(USERS_COLLECTION)
        .where('wooCommerceUserId', '==', wooCommerceId)
        .limit(1)
        .get();
    if (snapshot.empty)
        return null;
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() };
}
// Get user profile with active subscriptions
export async function getUserProfile(userId) {
    const user = await getUserById(userId);
    if (!user)
        return null;
    const subscriptions = await getActiveSubscriptions(userId);
    return {
        ...user,
        activeSubscriptions: subscriptions,
    };
}
// Update user
export async function updateUser(userId, input) {
    const userRef = db.collection(USERS_COLLECTION).doc(userId);
    const user = await getUserById(userId);
    if (!user) {
        throw new Error('User not found');
    }
    const updates = {
        ...input,
        updatedAt: Date.now(),
    };
    await userRef.update(updates);
    return {
        ...user,
        ...updates,
    };
}
// Get user's membership status
export async function getUserMembershipStatus(userId) {
    const subscriptions = await getActiveSubscriptions(userId);
    return {
        hasMembership: subscriptions.length > 0,
        activeMemberships: subscriptions.map(sub => sub.membershipId),
        activeSubscriptions: subscriptions,
    };
}
// Get active subscriptions for a user
async function getActiveSubscriptions(userId) {
    const now = Date.now();
    const snapshot = await db
        .collection(SUBSCRIPTIONS_COLLECTION)
        .where('userId', '==', userId)
        .where('status', '==', 'active')
        .where('endDate', '>', now)
        .get();
    return snapshot.docs.map(doc => doc.data());
}
// Migrate WooCommerce user
export async function migrateWooCommerceUser(wooCommerceUserId, userData) {
    // Check if user already migrated
    const existingUser = await getUserByWooCommerceId(wooCommerceUserId);
    if (existingUser) {
        throw new Error('User already migrated');
    }
    // Create new user with WooCommerce ID
    return createUser({
        ...userData,
        wooCommerceUserId,
    });
}
// Check if user has specific membership
export async function hasActiveMembership(userId, membershipId) {
    const status = await getUserMembershipStatus(userId);
    return status.activeMemberships.includes(membershipId);
}
