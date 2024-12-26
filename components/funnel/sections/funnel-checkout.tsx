"use client";

import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";
import { CheckoutForm } from "@/components/checkout/checkout-form";

interface FunnelCheckoutProps {
  productId: string;
  isExpired: boolean;
}

export function FunnelCheckout({ productId, isExpired }: FunnelCheckoutProps) {
  if (isExpired) return null;

  return (
    <>
      {/* Checkout Section */}
      <motion.section 
        className="max-w-2xl mx-auto px-4 py-16"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-3xl font-bold text-center mb-8">
            Jetzt bestellen
          </h2>
          <CheckoutForm productId={productId} />
        </div>
      </motion.section>

      {/* Money Back Guarantee */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <ShieldCheck className="w-16 h-16 mx-auto mb-4 text-green-600" />
            <h2 className="text-2xl font-bold mb-4">100% Zufriedenheitsgarantie</h2>
            <p className="text-gray-600">
              Wenn Sie nicht vollständig zufrieden sind, erhalten Sie Ihr Geld zurück. Kein Wenn und Aber.
            </p>
          </motion.div>
        </div>
      </section>
    </>
  );
}
