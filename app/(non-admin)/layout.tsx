import { Suspense } from "react";
import type { ReactNode } from "react";
import { ClientWrapper } from "@/components/non-admin/client-wrapper";

// Generate empty static params to allow dynamic paths
export function generateStaticParams() {
  return [];
}

// Prevent static optimization for cart functionality
export const fetchCache = 'force-no-store';
export const revalidate = 0;
export const dynamicParams = true;

// Add runtime config to ensure server-side rendering
export const runtime = 'nodejs';

export default function NonAdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <Suspense fallback={
      <div className="w-full h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    }>
      <ClientWrapper>
        {children}
      </ClientWrapper>
    </Suspense>
  );
}
