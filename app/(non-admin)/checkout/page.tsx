"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/contexts/cart-context";
import { toast } from "@/components/ui/use-toast";
import { CheckoutForm } from "@/components/checkout/checkout-form";

export default function CheckoutPage() {
  const router = useRouter();
  const { cart } = useCart();
  const [initialLoad, setInitialLoad] = useState(true);

  useEffect(() => {
    // Only check cart on initial load
    if (initialLoad && cart.items.length === 0) {
      router.push("/products");
      toast({
        variant: "destructive",
        title: "Warenkorb ist leer",
        description: "Bitte füge Produkte zum Warenkorb hinzu."
      });
    }
    setInitialLoad(false);
  }, [cart.items.length, router, initialLoad]);

  // Only show empty cart message on initial load
  if (initialLoad && cart.items.length === 0) {
    return null;
  }

  return (
    <div className="container mx-auto py-12">
      <div className="max-w-2xl mx-auto space-y-8">
        <h1 className="text-2xl font-bold">Checkout</h1>
        <CheckoutForm />
      </div>
    </div>
  );
}
