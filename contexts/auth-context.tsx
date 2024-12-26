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
      // Get fresh token when user changes
      user.getIdToken(true).then(token => {
        setIdToken(token);
      });

      // Set up token refresh
      const unsubscribe = setInterval(async () => {
        const token = await user.getIdToken(true);
        setIdToken(token);
      }, 45 * 60 * 1000); // Refresh token every 45 minutes

      return () => clearInterval(unsubscribe);
    } else {
      setIdToken(null);
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
