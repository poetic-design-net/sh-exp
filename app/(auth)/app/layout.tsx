'use client';

import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, Suspense } from 'react';

// Loading state that matches SSR
const LoadingState = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-lg animate-pulse">Loading...</div>
  </div>
);

// Redirect message that matches SSR
const RedirectMessage = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-lg">Redirecting...</div>
  </div>
);

function AuthContent({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return <LoadingState />;
  }

  if (!user) {
    return <RedirectMessage />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  );
}

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<LoadingState />}>
      <AuthContent>
        {children}
      </AuthContent>
    </Suspense>
  );
}
