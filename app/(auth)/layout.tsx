'use client';

import { AuthProvider } from "contexts/auth-context";
import { MyFirebaseProvider } from "components/firebase-providers";
import { Suspense } from "react";

// Prevent static optimization for auth routes
export const dynamic = 'force-dynamic';
export const dynamicParams = true;
export const revalidate = 0;

// Add runtime config to ensure server-side rendering
export const runtime = 'nodejs';

function LoadingFallback() {
  return <div>Loading...</div>;
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <MyFirebaseProvider>
        <AuthProvider>
          {children}
        </AuthProvider>
      </MyFirebaseProvider>
    </Suspense>
  );
}
