'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

function getSessionCookie(): string | null {
  const cookies = document.cookie.split(';');
  const sessionCookie = cookies.find(cookie => cookie.trim().startsWith('session='));
  return sessionCookie ? sessionCookie.split('=')[1] : null;
}

export function SessionVerify({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    const verifySession = async () => {
      try {
        const sessionCookie = getSessionCookie();
        
        if (!sessionCookie) {
          router.replace('/');
          return;
        }

        const response = await fetch('/api/auth/verify-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ sessionCookie }),
        });

        if (!response.ok) {
          router.replace('/');
          return;
        }

        setIsVerifying(false);
      } catch (error) {
        console.error('Sitzungsüberprüfungsfehler:', error);
        router.replace('/');
      }
    };

    verifySession();
  }, [router]);

  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
      </div>
    );
  }

  return children;
}
