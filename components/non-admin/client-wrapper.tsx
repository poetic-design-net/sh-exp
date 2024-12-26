'use client';


import { MyFirebaseProvider } from "@/components/firebase-providers";
import type { ReactNode } from "react";

interface ClientWrapperProps {
  children: ReactNode;
}

export function ClientWrapper({ children }: ClientWrapperProps) {
  return (
    <MyFirebaseProvider>
      {children}
    </MyFirebaseProvider>
  );
}
