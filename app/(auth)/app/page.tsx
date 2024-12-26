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

// Force dynamic rendering and disable caching
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;
export const runtime = 'nodejs';

// Helper function to handle auth errors
function handleAuthError(error: unknown) {
  console.error('Auth error:', {
    error,
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined
  });
  
  cookies().delete('session');
  redirect('/login?error=auth_failed');
}

// Type for the server component
type DashboardServerProps = {
  user: {
    displayName: string | null;
    email: string | null;
  };
  subscriptions: any[];
  orders: any[];
};

// This is a React Server Component
async function DashboardServer() {
  console.log('Starting dashboard server render');
  
  try {
    // Check for session cookie
    const cookiesList = cookies();
    const sessionCookie = cookiesList.get('session');

    if (!sessionCookie?.value) {
      console.error('No session cookie found');
      redirect('/login?error=no_session');
    }

    console.log('Verifying session cookie...');
    let session;
    try {
      session = await auth.verifySessionCookie(sessionCookie.value, false);
    } catch (error) {
      console.error('Session verification failed:', error);
      cookies().delete('session');
      redirect('/login?error=invalid_session');
    }

    if (!session?.uid) {
      console.error('No UID in session');
      cookies().delete('session');
      redirect('/login?error=no_uid');
    }

    console.log('Getting user data...');
    const userDoc = await db.collection('users').doc(session.uid).get();
    const userData = userDoc.data();
    
    if (!userData) {
      console.error('No user data found for UID:', session.uid);
      cookies().delete('session');
      redirect('/login?error=no_user_data');
    }

    // Validate user role
    if (userData.role !== 'admin' && userData.role !== 'user') {
      console.error('Invalid user role:', userData.role);
      redirect('/?error=invalid_role');
    }

    console.log('Getting dashboard data...');
    const data = await getDashboardData(session.uid);
    
    // Check access
    if (!data.subscriptions.length && !data.orders.length && !userData.role) {
      console.log('No access data found, redirecting to products');
      redirect('/products');
    }

    console.log('Rendering dashboard content');

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
    handleAuthError(error);
  }
}

// Main dashboard page component
export default function UserDashboard() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardServer />
    </Suspense>
  );
}

// Add type declarations for better TypeScript support
UserDashboard.displayName = 'UserDashboard';
DashboardServer.displayName = 'DashboardServer';
