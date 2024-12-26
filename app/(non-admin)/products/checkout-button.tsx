import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createCheckoutSession } from "@/services/checkout-client";
import { PaymentMethod } from "@/services/payment-processors/types";

interface CheckoutButtonProps {
  productId: string;
  paymentMethod?: PaymentMethod;
  className?: string;
  children?: React.ReactNode;
}

export function CheckoutButton({
  productId,
  paymentMethod = "stripe",
  className,
  children,
}: CheckoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckout = async () => {
    try {
      setIsLoading(true);
      const session = await createCheckoutSession({
        productId,
        paymentMethod,
      });

      // Redirect to checkout page
      window.location.href = session.checkoutUrl;
    } catch (error) {
      console.error("Checkout error:", error);
      // You might want to show an error toast here
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleCheckout}
      disabled={isLoading}
      className={className}
    >
      {isLoading ? "Loading..." : children || "Buy Now"}
    </Button>
  );
}
