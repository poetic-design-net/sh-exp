"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/contexts/cart-context";
import type { Funnel } from "@/types/funnel";
import type { Product } from "@/types/product";
import { FunnelHero } from "./sections/funnel-hero";
import { FunnelExpiredOverlay } from "./sections/funnel-expired-overlay";
import { FunnelProblemSolution } from "./sections/funnel-problem-solution";
import { FunnelBenefits } from "./sections/funnel-benefits";
import { FunnelProductDetails } from "./sections/funnel-product-details";
import { FunnelTestimonials } from "./sections/funnel-testimonials";
import { FunnelFAQ } from "./sections/funnel-faq";
import { FunnelUpsells } from "./sections/funnel-upsells";
import { FunnelTrustBadges } from "./sections/funnel-trust-badges";
import { FunnelCheckout } from "./sections/funnel-checkout";

interface SimpleFunnelProps {
  funnel: Funnel;
  products: Product[];
}

export function SimpleFunnel({ funnel, products }: SimpleFunnelProps) {
  const { addToCart, removeFromCart, cart } = useCart();
  const [isExpired, setIsExpired] = useState(false);

  // Find main product and upsell products
  const mainProduct = products.find(p => p.id === funnel.products.main);
  const upsellProducts = products.filter(p => 
    funnel.products.upsells.includes(p.id)
  );

  useEffect(() => {
    if (funnel.settings.countdown) {
      const checkExpiration = () => {
        const now = new Date();
        const startDate = new Date(funnel.settings.countdown!.startDate);
        const endDate = new Date(funnel.settings.countdown!.endDate);
        
        // Check if current time is within the action period
        const isWithinPeriod = now >= startDate && now <= endDate;
        setIsExpired(!isWithinPeriod);
      };

      // Initial check
      checkExpiration();

      // Set up interval to check every second
      const timer = setInterval(checkExpiration, 1000);

      return () => clearInterval(timer);
    }
  }, [funnel.settings.countdown]);

  const isInCart = (productId: string) => {
    return cart.items.some(item => item.productId === productId);
  };

  const handleAddToCart = (productId: string, isUpsell: boolean = false) => {
    if (isExpired) return;
    
    const product = products.find(p => p.id === productId);
    if (product) {
      const discount = isUpsell ? funnel.settings.upsellDiscount : funnel.settings.mainProductDiscount;
      const discountedPrice = product.price * (1 - (discount || 0) / 100);
      
      addToCart({
        ...product,
        price: discountedPrice,
      });
    }
  };

  if (!mainProduct) return null;

  return (
    <div className="min-h-screen bg-white relative">
      {/* Expired Overlay */}
      <FunnelExpiredOverlay 
        isExpired={isExpired}
        redirectUrl={funnel.settings.countdown?.redirectUrl}
      />

      {/* Hero Section */}
      <FunnelHero
        mainProduct={mainProduct}
        mainProductDiscount={funnel.settings.mainProductDiscount}
        isExpired={isExpired}
        countdownStartDate={funnel.settings.countdown?.startDate ? new Date(funnel.settings.countdown.startDate) : undefined}
        countdownEndDate={funnel.settings.countdown?.endDate ? new Date(funnel.settings.countdown.endDate) : undefined}
        onAddToCart={handleAddToCart}
        onExpire={() => setIsExpired(true)}
      />

      {/* Problem & Solution Section */}
      {funnel.content.problemSolution && (
        <FunnelProblemSolution
          problems={funnel.content.problemSolution.problems}
          solution={funnel.content.problemSolution.solution}
        />
      )}

      {/* Benefits Section */}
      {funnel.content.benefits && (
        <FunnelBenefits benefits={funnel.content.benefits} />
      )}

      {/* Product Details Section */}
      <FunnelProductDetails product={mainProduct} />

      {/* Social Proof Section */}
      {funnel.content.testimonials && (
        <FunnelTestimonials testimonials={funnel.content.testimonials} />
      )}

      {/* FAQ Section */}
      {funnel.content.faq && (
        <FunnelFAQ faqs={funnel.content.faq} />
      )}

      {/* Upsell Section */}
      {upsellProducts.length > 0 && (
        <FunnelUpsells
          products={upsellProducts}
          upsellDiscount={funnel.settings.upsellDiscount}
          isExpired={isExpired}
          onAddToCart={handleAddToCart}
          onRemoveFromCart={removeFromCart}
          isInCart={isInCart}
        />
      )}

      {/* Trust Badges Section */}
      <FunnelTrustBadges />

      {/* Checkout Section */}
      <FunnelCheckout
        productId={mainProduct.id}
        isExpired={isExpired}
      />
    </div>
  );
}
