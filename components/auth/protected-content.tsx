"use client";

import { ReactNode } from 'react';
import { useUserMembershipStatus } from 'services/users-client';
import { AdminProtectedContent } from './admin-protected-content';

interface ProtectedContentProps {
  membershipId: string;
  children: ReactNode;
  fallback?: ReactNode;
  loadingComponent?: ReactNode;
}

export function ProtectedContent({ 
  membershipId, 
  children, 
  fallback,
  loadingComponent
}: ProtectedContentProps) {
  // Wrap with AdminProtectedContent to allow admin access
  return (
    <AdminProtectedContent fallback={
      <MembershipCheck 
        membershipId={membershipId}
        fallback={fallback}
        loadingComponent={loadingComponent}
      >
        {children}
      </MembershipCheck>
    }>
      {children}
    </AdminProtectedContent>
  );
}

// Internal component to handle membership checks
function MembershipCheck({ 
  membershipId, 
  children, 
  fallback,
  loadingComponent
}: ProtectedContentProps) {
  const { status, isLoading } = useUserMembershipStatus();

  // Return null during initial load to prevent flash
  if (isLoading) {
    return loadingComponent || null;
  }

  const hasMembership = status?.activeMemberships.includes(membershipId) || false;

  if (!hasMembership) {
    return fallback ? (
      <>{fallback}</>
    ) : (
      <div className="text-center p-6 border rounded-lg bg-gray-50">
        <h3 className="text-lg font-semibold mb-2">
          Premium Inhalt
        </h3>
        <p className="text-gray-600 mb-4">
          Dieser Inhalt ist exklusiv für Mitglieder verfügbar.
        </p>
        <a 
          href="/memberships" 
          className="inline-block px-6 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
        >
          Mitgliedschaften ansehen
        </a>
      </div>
    );
  }

  return <>{children}</>;
}

// Higher-order component for protecting entire pages
export function withMembership(WrappedComponent: React.ComponentType, membershipId: string) {
  return function WithMembershipComponent(props: any) {
    return (
      <ProtectedContent membershipId={membershipId}>
        <WrappedComponent {...props} />
      </ProtectedContent>
    );
  };
}
