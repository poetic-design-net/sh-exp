import { Suspense } from "react";
import { DashboardContent } from "./dashboard-content";
import { getDashboardData } from "@/services/dashboard-server";
import { auth } from "@/lib/firebase-admin";
import { cookies } from "next/headers";

// Loading placeholder
function DashboardSkeleton() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="animate-pulse flex justify-center items-center min-h-[100px]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    </div>
  );
}

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

async function DashboardServer() {
  const cookiesList = await cookies();
  const sessionCookie = cookiesList.get('session');
  const session = await auth.verifySessionCookie(sessionCookie!.value);
  const data = await getDashboardData(session.uid);

  return (
    <DashboardContent 
      user={{
        displayName: session.name || null,
        email: session.email || null
      }}
      subscriptions={data.subscriptions}
      orders={data.orders}
    />
  );
}

export default function UserDashboard() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardServer />
    </Suspense>
  );
}
