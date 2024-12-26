"use client";

import { ReactNode, useState, useEffect } from 'react';
import { useAuth } from 'contexts/auth-context';

interface AdminProtectedContentProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function AdminProtectedContent({ 
  children, 
  fallback
}: AdminProtectedContentProps) {
  const { idToken } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    let verificationTimeout: NodeJS.Timeout | undefined;

    async function verifyAdmin() {
      if (!idToken) {
        if (mounted) {
          setIsAdmin(false);
          setIsLoading(false);
        }
        return;
      }

      try {
        const response = await fetch('/api/auth/verify-admin-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token: idToken }),
        });

        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Admin verification failed');
        }
        
        if (mounted) {
          setIsAdmin(data.isAdmin);
        }
      } catch (error) {
        console.error('Error verifying admin status:', error);
        if (mounted) {
          setIsAdmin(false);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    // Debounce the verification to prevent multiple calls
    clearTimeout(verificationTimeout);
    verificationTimeout = setTimeout(verifyAdmin, 100);

    return () => {
      mounted = false;
      clearTimeout(verificationTimeout);
    };
  }, [idToken]);

  // Always show loading state until we confirm admin status
  if (isLoading || !idToken) {
    return null;
  }

  if (!isAdmin) {
    return fallback ? (
      <>{fallback}</>
    ) : (
      <div className="text-center p-6 border rounded-lg bg-gray-50">
        <h3 className="text-lg font-semibold mb-2">
          Administratorzugang erforderlich
        </h3>
        <p className="text-gray-600 mb-4">
          Dieser Bereich ist nur für Administratoren zugänglich.
        </p>
        <a 
          href="/"
          className="inline-block px-6 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
        >
          Zur Startseite
        </a>
      </div>
    );
  }

  return <>{children}</>;
}
