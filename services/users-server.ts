import { db } from "@/lib/firebase-admin";
import { User, CreateUserInput, UpdateUserInput, UserMembershipStatus, UserProfile } from "@/types/user";
import { Subscription } from "@/types/membership";
import { getAuth } from "firebase-admin/auth";

// User Collection Reference
const USERS_COLLECTION = "users";
const SUBSCRIPTIONS_COLLECTION = "subscriptions";

// Get all users
export async function getUsers(): Promise<User[]> {
  const snapshot = await db.collection(USERS_COLLECTION).get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as User);
}

// Create a new user
export async function createUser(input: CreateUserInput): Promise<User> {
  // Create Firebase Auth user
  const userRecord = await getAuth().createUser({
    email: input.email,
    password: input.password,
    displayName: input.displayName,
  });

  const now = Date.now();
  const user: User = {
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
export async function getUserById(userId: string): Promise<User | null> {
  const userDoc = await db.collection(USERS_COLLECTION).doc(userId).get();
  return userDoc.exists ? (userDoc.data() as User) : null;
}

// Get user by WooCommerce ID
export async function getUserByWooCommerceId(wooCommerceId: string): Promise<User | null> {
  const snapshot = await db
    .collection(USERS_COLLECTION)
    .where('wooCommerceUserId', '==', wooCommerceId)
    .limit(1)
    .get();

  if (snapshot.empty) return null;
  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() } as User;
}

// Get user profile with active subscriptions
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const user = await getUserById(userId);
  if (!user) return null;

  const subscriptions = await getActiveSubscriptions(userId);
  
  return {
    ...user,
    activeSubscriptions: subscriptions,
  };
}

// Update user
export async function updateUser(userId: string, input: UpdateUserInput): Promise<User> {
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
export async function getUserMembershipStatus(userId: string): Promise<UserMembershipStatus> {
  const subscriptions = await getActiveSubscriptions(userId);
  
  return {
    hasMembership: subscriptions.length > 0,
    activeMemberships: subscriptions.map(sub => sub.membershipId),
    activeSubscriptions: subscriptions,
  };
}

// Get active subscriptions for a user
async function getActiveSubscriptions(userId: string): Promise<Subscription[]> {
  const now = Date.now();
  const snapshot = await db
    .collection(SUBSCRIPTIONS_COLLECTION)
    .where('userId', '==', userId)
    .where('status', '==', 'active')
    .where('endDate', '>', now)
    .get();

  return snapshot.docs.map(doc => doc.data() as Subscription);
}

// Migrate WooCommerce user
export async function migrateWooCommerceUser(wooCommerceUserId: string, userData: CreateUserInput): Promise<User> {
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
export async function hasActiveMembership(userId: string, membershipId: string): Promise<boolean> {
  const status = await getUserMembershipStatus(userId);
  return status.activeMemberships.includes(membershipId);
}
