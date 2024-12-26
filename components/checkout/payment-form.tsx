"use client";

import { useState } from "react";
import { useCart } from "@/contexts/cart-context";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { createCheckoutSession } from "@/services/payments";
import { toast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";

interface PaymentFormProps {
  userId: string;
}

export function PaymentForm({ userId }: PaymentFormProps) {
  const router = useRouter();
  const { cart, clearCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      const productIds = cart.items.map(item => ({
        id: item.productId,
        quantity: item.quantity
      }));
      
      await createCheckoutSession(productIds, userId);
      clearCart();
      
      toast({
        title: "Zahlung erfolgreich",
        description: "Vielen Dank für deinen Einkauf!",
      });

      // Redirect to success page or dashboard
      router.push("/");
    } catch (error) {
      console.error("Payment error:", error);
      toast({
        title: "Zahlung fehlgeschlagen",
        description: error instanceof Error ? error.message : "Ein Fehler ist aufgetreten",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="cardNumber" className="text-sm font-medium">
            Kartennummer
          </label>
          <input
            id="cardNumber"
            type="text"
            className="w-full rounded-md border p-2"
            placeholder="1234 5678 9012 3456"
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="expiry" className="text-sm font-medium">
              Ablaufdatum
            </label>
            <input
              id="expiry"
              type="text"
              className="w-full rounded-md border p-2"
              placeholder="MM/YY"
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="cvc" className="text-sm font-medium">
              CVC
            </label>
            <input
              id="cvc"
              type="text"
              className="w-full rounded-md border p-2"
              placeholder="123"
              required
            />
          </div>
        </div>
      </div>

      <Button 
        type="submit" 
        className="w-full" 
        disabled={isProcessing}
      >
        {isProcessing 
          ? "Wird verarbeitet..." 
          : `${formatPrice(cart.total)} bezahlen`}
      </Button>
    </form>
  );
}
