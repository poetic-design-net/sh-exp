'use client';

import { usePathname } from "next/navigation";
import { NavbarWrapper } from "@/components/navbar/navbar-wrapper";
import { Footer } from "@/components/footer";
import { ThemeSwitch } from "@/components/theme-switch";
import { Suspense, useEffect, useState } from "react";

// Helper function to determine if components should be shown
const checkShouldShowComponents = (pathname: string | null): boolean => {
  if (!pathname) return false;
  return !pathname.startsWith('/l/') && pathname !== '/login';
};

// Loading fallback that matches SSR
const LoadingFallback = () => null;

// Header components wrapper
function HeaderComponents({ pathname }: { pathname: string | null }) {
  const shouldShow = checkShouldShowComponents(pathname);
  
  if (!shouldShow) return null;
  
  return (
    <>
      <NavbarWrapper />
      <ThemeSwitch />
    </>
  );
}

// Footer component wrapper
function FooterComponent({ pathname }: { pathname: string | null }) {
  const shouldShow = checkShouldShowComponents(pathname);
  
  if (!shouldShow) return null;
  
  return <Footer />;
}

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const shouldShowHeader = checkShouldShowComponents(pathname);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Show a loading state until the component is mounted
  if (!mounted) {
    return (
      <div className="flex flex-col min-h-screen">
        <div className="w-full h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col min-h-screen">
        {shouldShowHeader && (
          <header className="relative w-full">
            <Suspense fallback={<LoadingFallback />}>
              <HeaderComponents pathname={pathname} />
            </Suspense>
          </header>
        )}
        
        <main className="flex-grow relative">
          <Suspense fallback={
            <div className="w-full h-screen flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          }>
            {children}
          </Suspense>
        </main>

        <Suspense fallback={<LoadingFallback />}>
          <FooterComponent pathname={pathname} />
        </Suspense>
      </div>

      <div id="portal-root" />
    </>
  );
}
