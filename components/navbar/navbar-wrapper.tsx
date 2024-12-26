'use client';

import { usePathname } from 'next/navigation';
import { NavBar } from '@/components/navbar/navbar';
import { AuthProvider } from '@/contexts/auth-context';

export function NavbarWrapper() {
  const pathname = usePathname();
  
  if (pathname?.startsWith('/admin')) {
    return null;
  }
  
  return (
    <AuthProvider>
      <NavBar />
    </AuthProvider>
  );
}
