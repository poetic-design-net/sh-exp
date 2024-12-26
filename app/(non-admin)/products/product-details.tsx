"use client"

import { useMemo, useState } from "react";
import Link from "next/link";
import { useFirestore, useFirestoreCollectionData } from "reactfire";
import { collection, query, where } from "firebase/firestore";
import { Product } from "@/types/product";
import { Category } from "@/types/category";
import { formatPrice, cleanHtml } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/cart-context";
import { useToast } from "@/components/ui/use-toast";

interface ProductDetailsProps {
  product: Product;
  category?: Category;
}

export function ProductDetails({ product, category }: ProductDetailsProps) {
  const firestore = useFirestore();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  // Query memberships that this product grants
  const membershipsQuery = useMemo(() => {
    return query(
      collection(firestore, "memberships"),
      where("productIds", "array-contains", product.id),
      where("isActive", "==", true)
    );
  }, [firestore, product.id]);

  const { data: memberships } = useFirestoreCollectionData(membershipsQuery, {
    idField: "id",
  });

  const handleAddToCart = async () => {
    setIsLoading(true);
    addToCart(product);
    // Add a small delay to show the loading state
    await new Promise(resolve => setTimeout(resolve, 500));
    setIsLoading(false);
    
    // Show success toast with checkout link
    toast({
      title: "Produkt hinzugefügt!",
      description: (
        <div className="flex items-center justify-between">
          <span>Das Produkt wurde in den Warenkorb gelegt.</span>
          <Link 
            href="/checkout" 
            className="ml-4 text-sm font-medium text-green-700 hover:text-green-800 hover:underline"
          >
            Zur Kasse →
          </Link>
        </div>
      ),
      className: "bg-green-50 border-green-200 text-green-800",
      duration: 5000, // Show for 5 seconds
    });
  };

  // Helper function to determine stock status
  const getStockStatus = () => {
    if (product.stockStatus === 'instock' || product.stock > 0 || (product.stockQuantity !== undefined && product.stockQuantity > 0)) {
      const quantity = product.stockQuantity ?? product.stock ?? 0;
      return {
        available: true,
        text: quantity > 0 ? `${quantity} in stock` : 'In stock'
      };
    }
    if (product.stockStatus === 'onbackorder') {
      return {
        available: true,
        text: 'Available on backorder'
      };
    }
    return {
      available: false,
      text: 'Out of stock'
    };
  };

  const stockStatus = getStockStatus();

  return (
    <div className="grid md:grid-cols-2 gap-8">
      {/* Product Images */}
      <div className="space-y-4">
        <div className="relative aspect-square">
          <img
            src={product.images[0] || "/static/assets/fallback-image.png"}
            alt={product.name}
            className="absolute inset-0 w-full h-full object-cover rounded-lg"
          />
        </div>
        {product.images.length > 1 && (
          <div className="grid grid-cols-4 gap-2">
            {product.images.slice(1).map((image, index) => (
              <div key={image} className="relative aspect-square">
                <img
                  src={image}
                  alt={`${product.name} image ${index + 2}`}
                  className="absolute inset-0 w-full h-full object-cover rounded-lg"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="space-y-6">
        <div>
          {category && (
            <Link
              href={`/categories/${category.slug}`}
              className="text-sm text-muted-foreground hover:text-primary"
            >
              {category.name}
            </Link>
          )}
          <h1 className="text-3xl font-bold mt-2">{product.name}</h1>
          <p className="text-2xl font-bold text-primary mt-4">
            {formatPrice(product.price)}
          </p>
        </div>

        <div className="prose max-w-none">
          <p>{cleanHtml(product.description)}</p>
        </div>

        {memberships && memberships.length > 0 && (
          <div className="bg-primary/5 p-4 rounded-lg">
            <h3 className="font-medium mb-2">This product includes:</h3>
            <ul className="space-y-2">
              {memberships.map((membership) => (
                <li key={membership.id} className="flex items-start">
                  <span className="text-primary mr-2">✓</span>
                  <div>
                    <span className="font-medium">{membership.name}</span>
                    <p className="text-sm text-muted-foreground">
                      {cleanHtml(membership.description)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Duration: {membership.duration} days
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <span className="font-medium">Availability:</span>
            <span className={stockStatus.available ? "text-green-600" : "text-red-600"}>
              {stockStatus.text}
            </span>
          </div>

          <div className="flex">
            <Button
              onClick={handleAddToCart}
              disabled={isLoading || !stockStatus.available}
              size="sm"
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Wird hinzugefügt...
                </span>
              ) : (
                "In den Warenkorb"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
