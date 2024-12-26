"use client";

import { CartItem as CartItemType } from "@/types/cart";
import { useCart } from "@/contexts/cart-context";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { useProduct } from "@/hooks/use-products";
import Image from "next/image";

interface CartItemProps {
  item: CartItemType;
}

export function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeFromCart } = useCart();
  
  // Automatisches Laden und Cachen der Produktdaten
  const { data: product } = useProduct(item.productId);

  // Nutze die aktuellsten Produktdaten (z.B. für aktuelle Preise)
  const currentPrice = product?.price ?? item.price;
  // Verwende AVIF wenn verfügbar, sonst fallback auf WebP
  const currentImage = product?.avifImages?.[0] ?? product?.images[0] ?? item.avifImage ?? item.image;
  const currentName = product?.name ?? item.name;

  return (
    <div className="flex items-start gap-4 py-4">
      {currentImage && (
        <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md">
          <Image
            src={currentImage}
            alt={currentName}
            fill
            sizes="64px"
            className="object-cover"
          />
        </div>
      )}
      <div className="flex flex-1 flex-col">
        <div className="flex justify-between">
          <h3 className="text-sm font-medium">{currentName}</h3>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-muted-foreground hover:text-foreground -mr-2"
            onClick={() => removeFromCart(item.productId)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-4 h-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </Button>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          {formatPrice(currentPrice)}
        </p>
        <div className="flex items-center mt-2">
          <Button
            variant="outline"
            size="icon"
            className="h-6 w-6"
            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
            disabled={item.quantity <= 1}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-3 h-3"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 12h-15"
              />
            </svg>
          </Button>
          <span className="w-8 text-center text-sm">{item.quantity}</span>
          <Button
            variant="outline"
            size="icon"
            className="h-6 w-6"
            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-3 h-3"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </svg>
          </Button>
          <span className="ml-auto font-medium">
            {formatPrice(currentPrice * item.quantity)}
          </span>
        </div>
      </div>
    </div>
  );
}
