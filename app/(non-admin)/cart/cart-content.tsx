'use client';

import { useSigninCheck } from "reactfire";
import { useCart } from "@/contexts/cart-context";
import { CartItem } from "@/components/cart/cart-item";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { createCheckoutSession } from "@/services/payments";
import { toast } from "@/components/ui/use-toast";

export default function CartContent() {
  const { cart, clearCart } = useCart();
  const { data: signInCheckResult } = useSigninCheck();

  const handleCheckout = async () => {
    if (!signInCheckResult?.signedIn) {
      toast({
        title: "Bitte anmelden",
        description: "Du musst angemeldet sein, um einen Kauf abzuschließen",
        variant: "destructive",
      });
      return;
    }

    try {
      // Create a checkout session with all cart items
      const productIds = cart.items.map(item => ({
        id: item.productId,
        quantity: item.quantity
      }));
      
      await createCheckoutSession(productIds, signInCheckResult.user.uid);
      clearCart();
      
      toast({
        title: "Checkout gestartet",
        description: "Du wirst zur Zahlungsseite weitergeleitet",
      });
    } catch (error) {
      console.error("Checkout error:", error);
      toast({
        title: "Checkout fehlgeschlagen",
        description: error instanceof Error ? error.message : "Ein Fehler ist aufgetreten",
        variant: "destructive",
      });
    }
  };

  if (cart.items.length === 0) {
    return (
      <div className="container max-w-4xl py-12">
        <h1 className="text-3xl font-bold mb-8">Warenkorb</h1>
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">Dein Warenkorb ist leer</p>
          <Button asChild>
            <a href="/products">Produkte ansehen</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-12">
      <h1 className="text-3xl font-bold mb-8">Warenkorb</h1>
      
      <div className="divide-y">
        {cart.items.map((item) => (
          <CartItem key={item.productId} item={item} />
        ))}
      </div>

      <div className="mt-8 space-y-4">
        <div className="flex justify-between items-center text-lg font-medium">
          <span>Gesamtsumme</span>
          <span>{formatPrice(cart.total)}</span>
        </div>

        <div className="flex justify-end space-x-4">
          <Button
            variant="outline"
            onClick={clearCart}
          >
            Warenkorb leeren
          </Button>
          <Button
            onClick={handleCheckout}
            disabled={!signInCheckResult?.signedIn}
          >
            Zur Kasse
          </Button>
        </div>

        {!signInCheckResult?.signedIn && (
          <p className="text-sm text-muted-foreground text-right">
            Bitte melde dich an, um die Bestellung abzuschließen
          </p>
        )}
      </div>
    </div>
  );
}
