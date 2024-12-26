"use client";

import { 
  useFirestore, 
  useFirestoreDocData,
  useFirestoreCollectionData,
} from 'reactfire';
import { collection, doc, query, where, Timestamp, DocumentReference, Query } from 'firebase/firestore';
import { User } from 'types/user';
import { Subscription } from 'types/membership';
import { useEffect, useState, useMemo } from 'react';
import { useAuth } from 'contexts/auth-context';

// Hook for getting current user's profile
export function useUserProfile() {
  const { user, isLoading: authLoading } = useAuth();
  const firestore = useFirestore();

  // Memoize references to prevent unnecessary re-renders
  const userRef = useMemo(() => {
    if (!user?.uid) return null;
    return doc(firestore, 'users', user.uid);
  }, [user?.uid, firestore]);

  const subscriptionsRef = useMemo(() => {
    if (!user?.uid) return null;
    return query(
      collection(firestore, 'subscriptions'),
      where('userId', '==', user.uid),
      where('status', '==', 'active')
    );
  }, [user?.uid, firestore]);

  // Use dummy refs when real ones aren't available
  const dummyDocRef = useMemo(() => doc(firestore, '_dummy', '_dummy'), [firestore]);
  const dummyCollectionRef = useMemo(() => collection(firestore, '_dummy'), [firestore]);

  const { data: profile, status: profileStatus } = useFirestoreDocData(
    (userRef || dummyDocRef) as DocumentReference,
    { idField: 'id', suspense: false }
  );

  const { data: subscriptions = [], status: subscriptionsStatus } = useFirestoreCollectionData(
    (subscriptionsRef || dummyCollectionRef) as Query,
    { idField: 'id', suspense: false }
  );

  // Only show loading during initial data fetch
  const isLoading = authLoading || 
    !user || 
    (profileStatus === 'loading' && !profile) || 
    (subscriptionsStatus === 'loading' && !subscriptions.length);

  // Filter active subscriptions on the client side
  const activeSubscriptions = useMemo(() => {
    if (!subscriptionsRef || !subscriptions) return [];
    const now = Timestamp.now().toMillis();
    return (subscriptions as Subscription[]).filter(sub => 
      sub.status === 'active' && sub.endDate > now
    );
  }, [subscriptionsRef, subscriptions]);

  // Only return real data when we have valid references
  return {
    profile: userRef ? (profile as User | undefined) : undefined,
    activeSubscriptions,
    isLoading
  };
}

// Hook for checking admin status
export function useAdmin() {
  const { profile, isLoading } = useUserProfile();
  
  // Return early if still loading
  if (isLoading) {
    return {
      isAdmin: false,
      isLoading: true,
    };
  }

  return {
    isAdmin: profile?.role === 'admin' || false,
    isLoading: false,
  };
}

// Hook for getting user's membership status
export function useUserMembershipStatus() {
  const { profile, activeSubscriptions, isLoading } = useUserProfile();

  const status = useMemo(() => {
    if (isLoading || !profile) return null;
    
    return {
      hasMembership: activeSubscriptions.length > 0,
      activeMemberships: activeSubscriptions.map(sub => sub.membershipId),
      activeSubscriptions,
    };
  }, [profile, activeSubscriptions, isLoading]);

  return { 
    status, 
    isLoading 
  };
}

// Hook for checking if user has specific membership
export function useHasMembership(membershipId: string) {
  const { status, isLoading } = useUserMembershipStatus();
  
  return {
    hasMembership: status?.activeMemberships.includes(membershipId) || false,
    isLoading,
  };
}
