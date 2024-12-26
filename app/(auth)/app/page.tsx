import { Suspense } from "react";
import { DashboardContent } from "./dashboard-content";
import { getDashboardData } from "services/dashboard-server";
import { auth, db } from "lib/firebase-admin-server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

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
  try {
    const cookiesList = cookies();
    const sessionCookie = cookiesList.get('session');

    if (!sessionCookie?.value) {
      console.error('No session cookie found');
      redirect('/login');
    }

    const session = await auth.verifySessionCookie(sessionCookie.value, true); // Set checkRevoked to true
    
    if (!session?.uid) {
      console.error('Invalid session');
      cookies().delete('session'); // Clear invalid session
      redirect('/login');
    }

    // Get user role
    const userDoc = await db.collection('users').doc(session.uid).get();
    const userData = userDoc.data();
    
    if (!userData) {
      console.error('User data not found');
      cookies().delete('session');
      redirect('/login');
    }

    // Check if user has required role
    if (userData.role !== 'admin' && userData.role !== 'user') {
      console.error('Insufficient permissions');
      redirect('/');
    }

    const data = await getDashboardData(session.uid);
    
    if (!data.subscriptions.length && !data.orders.length) {
      // If user has no subscriptions or orders, redirect to products
      redirect('/products');
    }

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
  } catch (error) {
    console.error('Error in DashboardServer:', error);
    // Clear session cookie on auth errors
    if (error instanceof Error && 
        (error.message.includes('session') || error.message.includes('token'))) {
      cookies().delete('session');
    }
    redirect('/login');
  }
}

export default function UserDashboard() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardServer />
    </Suspense>
  );
}
