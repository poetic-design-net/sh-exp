'use client';

import type { ReactNode } from "react";
import { useAdmin } from "@/services/users-client";
import dynamic from "next/dynamic";
import { Suspense } from "react";

interface ClientWrapperProps {
  children: ReactNode;
}

// Loading state that matches SSR
const LoadingState = () => (
  <div className="flex items-center justify-center min-h-[200px]">
    <div className="animate-pulse text-lg text-gray-600">
      Loading...
    </div>
  </div>
);

// Admin content with proper error boundary
function AdminContent({ children }: { children: ReactNode }) {
  const { isAdmin, isLoading } = useAdmin();

  if (isLoading) {
    return <LoadingState />;
  }

  if (!isAdmin) {
    return (
      <div className="text-center p-6 border rounded-lg bg-gray-50">
        <h3 className="text-lg font-semibold mb-2">
          Admin Access Required
        </h3>
        <p className="text-gray-600 mb-4">
          This area is restricted to administrators only.
        </p>
        <a 
          href="/"
          className="inline-block px-6 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
        >
          Return Home
        </a>
      </div>
    );
  }

  return <>{children}</>;
}

// Main wrapper component
function AdminWrapper({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<LoadingState />}>
      <AdminContent>
        {children}
      </AdminContent>
    </Suspense>
  );
}

// Export a dynamic component with SSR disabled
export const ClientWrapper = dynamic(() => Promise.resolve(AdminWrapper), {
  ssr: false,
}) as React.ComponentType<ClientWrapperProps>;
