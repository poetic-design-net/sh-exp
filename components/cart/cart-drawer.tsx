"use client";

import { useCart } from "@/contexts/cart-context";
import { CartItem } from "@/components/cart/cart-item";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";
import { toast } from "@/components/ui/use-toast";
import { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

// Loading state that matches SSR
const LoadingState = () => (
  <div className="text-center py-8">
    <p className="text-muted-foreground mb-4">Lädt...</p>
  </div>
);

function CartContent({ isOpen, onClose }: CartDrawerProps) {
  const router = useRouter();
  const { cart, clearCart } = useCart();
  const { user, isLoading } = useAuth();

  const handleCheckout = () => {
    onClose();
    router.push("/checkout");
  };

  // Only render content if we're in the browser
  if (typeof window === 'undefined') {
    return null;
  }

  const content = (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/30 z-[9998]"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div 
        className={`
          fixed inset-y-0 right-0 w-full sm:w-[400px] bg-background shadow-xl z-[9999]
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold">Warenkorb</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {cart.items.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  Dein Warenkorb ist leer
                </p>
                <Button asChild onClick={onClose}>
                  <a href="/products">Produkte ansehen</a>
                </Button>
              </div>
            ) : (
              <div className="divide-y">
                {cart.items.map((item) => (
                  <CartItem key={item.productId} item={item} />
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {cart.items.length > 0 && (
            <div className="border-t p-4 space-y-4">
              <div className="flex justify-between items-center text-lg font-medium">
                <span>Gesamtsumme</span>
                <span>{formatPrice(cart.total)}</span>
              </div>

              <div className="grid gap-2">
                <Button
                  onClick={handleCheckout}
                  className="w-full"
                >
                  Zur Kasse
                </Button>
                <Button
                  variant="outline"
                  onClick={clearCart}
                  className="w-full"
                >
                  Warenkorb leeren
                </Button>
              </div>

              {!user && !isLoading && (
                <p className="text-sm text-muted-foreground text-center">
                  Du kannst während des Checkouts einen Account erstellen
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );

  // Use a stable portal root
  const portalRoot = document.getElementById('portal-root') || document.body;
  return createPortal(content, portalRoot);
}

export function CartDrawer(props: CartDrawerProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  // Close drawer on escape key press
  useEffect(() => {
    if (!props.isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") props.onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [props.isOpen, props.onClose]);

  // Don't render anything on the server or before mounting
  if (!isMounted) {
    return null;
  }

  return (
    <Suspense fallback={<LoadingState />}>
      <CartContent {...props} />
    </Suspense>
  );
}
