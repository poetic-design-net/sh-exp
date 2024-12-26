'use server';

import { db } from '@/lib/firebase-admin';
import type { User, UserProfile } from '@/types/user';
import { getUserSubscriptions } from '@/app/actions/memberships';

export async function getUsers(page: number = 1, pageSize: number = 20) {
  try {
    const usersRef = db.collection('users');
    
    // Get total count for pagination
    const snapshot = await usersRef.count().get();
    const total = snapshot.data().count;
    const totalPages = Math.ceil(total / pageSize);

    // Get paginated users
    const startAt = (page - 1) * pageSize;
    const usersSnapshot = await usersRef
      .orderBy('createdAt', 'desc')
      .offset(startAt)
      .limit(pageSize)
      .get();

    const users = usersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as User[];

    return {
      users,
      totalPages,
      total
    };
  } catch (error) {
    console.error('Error getting users:', error);
    throw new Error('Failed to fetch users');
  }
}

export async function getUserStats() {
  try {
    const usersRef = db.collection('users');
    
    // Get total users
    const totalSnapshot = await usersRef.count().get();
    const total = totalSnapshot.data().count;

    // Get users created in last 30 days
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    const last30DaysSnapshot = await usersRef
      .where('createdAt', '>=', thirtyDaysAgo)
      .count()
      .get();
    const last30Days = last30DaysSnapshot.data().count;

    // Get users by role
    const [adminSnapshot, moderatorSnapshot, userSnapshot] = await Promise.all([
      usersRef.where('role', '==', 'admin').count().get(),
      usersRef.where('role', '==', 'moderator').count().get(),
      usersRef.where('role', '==', 'user').count().get()
    ]);

    return {
      total,
      last30Days,
      byRole: {
        admin: adminSnapshot.data().count,
        moderator: moderatorSnapshot.data().count,
        user: userSnapshot.data().count
      }
    };
  } catch (error) {
    console.error('Error getting user stats:', error);
    throw new Error('Failed to fetch user statistics');
  }
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      return null;
    }

    const userData = userDoc.data() as User;
    
    // Get active subscriptions using the memberships service
    const activeSubscriptions = await getUserSubscriptions(userId);
    console.log('Fetched subscriptions for user:', activeSubscriptions);

    return {
      ...userData,
      id: userDoc.id,
      activeSubscriptions
    };
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw new Error('Failed to fetch user profile');
  }
}
