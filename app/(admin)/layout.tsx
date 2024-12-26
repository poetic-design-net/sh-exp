import { Suspense } from "react";
import type { ReactNode } from "react";
import { ClientWrapper } from "@/components/admin/client-wrapper";

// Generate empty static params to allow dynamic paths
export function generateStaticParams() {
  return [];
}

// Prevent static optimization for admin routes
export const fetchCache = 'force-no-store';
export const revalidate = 0;
export const dynamicParams = true;

// Add runtime config to ensure server-side rendering
export const runtime = 'nodejs';

export default function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ClientWrapper>
        {children}
      </ClientWrapper>
    </Suspense>
  );
}
