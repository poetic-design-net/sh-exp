"use client";

import { UserNav } from "@/components/navbar/user-nav";
import { CartIcon } from "@/components/cart/cart-icon";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { FC, Suspense, memo } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useAdmin } from "@/services/users-client";

// Loading state that matches both logged-in and logged-out states
const LoadingState = () => (
  <div className="flex items-center gap-4">
    <div className="w-8 h-8 animate-pulse bg-gray-200 dark:bg-gray-700 rounded-full" />
    <div className="flex gap-4">
      <div className="h-10 w-[100px] animate-pulse bg-gray-200 dark:bg-gray-700 rounded-md" />
      <div className="h-10 w-[100px] animate-pulse bg-gray-200 dark:bg-gray-700 rounded-md" />
      <div className="h-10 w-[100px] animate-pulse bg-gray-200 dark:bg-gray-700 rounded-md" />
    </div>
  </div>
);

function UserLinks() {
  const { user, isLoading } = useAuth();
  const { isAdmin } = useAdmin();

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <div className="flex items-center gap-4 min-w-[300px] justify-end">
      <CartIcon />
      {user ? (
        <div className="flex items-center gap-4">
          <Link 
            href="/app" 
            className={buttonVariants()}
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            Dashboard
          </Link>
          {isAdmin && (
            <Link 
              href="/admin" 
              className={buttonVariants()}
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              Admin
            </Link>
          )}
          <UserNav />
        </div>
      ) : (
        <Link 
          href="/login" 
          className={buttonVariants()}
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          Login / Register &rarr;
        </Link>
      )}
    </div>
  );
}

export const NavbarUserLinks: FC = () => {
  return (
    <div className="flex items-center min-w-[300px] justify-end">
      <UserLinks />
    </div>
  );
};
