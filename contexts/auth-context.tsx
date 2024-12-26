'use client';

import { createContext, useContext, ReactNode, useMemo, useState, useEffect } from "react";
import { getAuth, onAuthStateChanged, User, Auth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getApp } from "firebase/app";

interface AuthContextType {
  user: User | null;
  isSignedIn: boolean;
  isLoading: boolean;
  auth: Auth | null;
  idToken: string | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isSignedIn: false,
  isLoading: true,
  auth: null,
  idToken: null
});

// Static fallback state for SSR that matches initial client state
const StaticAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const value = useMemo(() => ({
    user: null,
    isSignedIn: false,
    isLoading: true,
    auth: null,
    idToken: null
  }), []);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Dynamic auth provider component
function DynamicAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [auth, setAuth] = useState<Auth | null>(null);

  useEffect(() => {
    let mounted = true;

    async function initializeAuth() {
      try {
        const app = getApp();
        const auth = getAuth(app);
        
        // Set persistence to local to maintain auth state across tabs
        await setPersistence(auth, browserLocalPersistence);
        
        if (mounted) {
          setAuth(auth);
          
          // Check if we already have a user before setting up the listener
          const currentUser = auth.currentUser;
          if (currentUser) {
            setUser(currentUser);
            setIsLoading(false);
          }

          // Set up auth state listener
          const unsubscribe = onAuthStateChanged(auth, (firebaseUser: User | null) => {
            if (mounted) {
              setUser(firebaseUser);
              setIsLoading(false);
            }
          });

          return unsubscribe;
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    initializeAuth();

    return () => {
      mounted = false;
    };
  }, []);

  const [idToken, setIdToken] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      console.log('User state changed, creating session...');
      
      // Get fresh token when user changes and sync with server session
      user.getIdToken(true).then(async token => {
        console.log('Got fresh ID token');
        setIdToken(token);
        
        // Create session cookie on server
        try {
          console.log('Creating session cookie...');
          const response = await fetch('/api/auth/session', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Cache-Control': 'no-cache'
            },
            body: JSON.stringify({ idToken: token }),
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.error('Failed to create session:', {
              status: response.status,
              statusText: response.statusText,
              error: errorText
            });
            throw new Error(`Failed to create session: ${errorText}`);
          }

          console.log('Session created successfully');
          
          // After successful session creation, let the page handle redirect
          console.log('Session created successfully, page will handle redirect');
        } catch (error) {
          console.error('Error creating session:', {
            error,
            message: error instanceof Error ? error.message : String(error)
          });
        }
      }).catch(error => {
        console.error('Error getting ID token:', {
          error,
          message: error instanceof Error ? error.message : String(error)
        });
      });

      // Set up token refresh
      const unsubscribe = setInterval(async () => {
        try {
          console.log('Refreshing ID token...');
          const token = await user.getIdToken(true);
          setIdToken(token);
          
          // Refresh session cookie
          console.log('Refreshing session cookie...');
          const response = await fetch('/api/auth/session', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Cache-Control': 'no-cache'
            },
            body: JSON.stringify({ idToken: token }),
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.error('Failed to refresh session:', {
              status: response.status,
              statusText: response.statusText,
              error: errorText
            });
            throw new Error(`Failed to refresh session: ${errorText}`);
          }

          console.log('Session refreshed successfully');
        } catch (error) {
          console.error('Error refreshing session:', {
            error,
            message: error instanceof Error ? error.message : String(error)
          });
        }
      }, 45 * 60 * 1000); // Refresh token every 45 minutes

      return () => clearInterval(unsubscribe);
    } else {
      setIdToken(null);
      // Clear session cookie when user signs out
      fetch('/api/auth/session', { method: 'DELETE' }).catch(console.error);
    }
  }, [user]);

  const value = useMemo(() => ({
    user,
    isSignedIn: !!user,
    isLoading,
    auth,
    idToken
  }), [user, isLoading, auth, idToken]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // For static routes or SSR, use static provider
  if (typeof window === 'undefined') {
    return <StaticAuthProvider>{children}</StaticAuthProvider>;
  }

  // For client-side, use dynamic provider
  return <DynamicAuthProvider>{children}</DynamicAuthProvider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
