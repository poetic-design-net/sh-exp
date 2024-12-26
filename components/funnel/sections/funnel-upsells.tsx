"use client";

import { motion } from "framer-motion";
import { Clock, ArrowRight, X } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/types/product";

interface FunnelUpsellsProps {
  products: Product[];
  upsellDiscount: number;
  isExpired: boolean;
  onAddToCart: (productId: string, isUpsell: boolean) => void;
  onRemoveFromCart: (productId: string) => void;
  isInCart: (productId: string) => boolean;
}

export function FunnelUpsells({ 
  products, 
  upsellDiscount, 
  isExpired,
  onAddToCart, 
  onRemoveFromCart,
  isInCart 
}: FunnelUpsellsProps) {
  if (!products || products.length === 0) return null;

  return (
    <section className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold mb-4">
            Exklusive Zusatzangebote
          </h2>
          <p className="text-xl text-gray-600 mb-4">
            Spare {upsellDiscount}% beim Kauf dieser Produkte
          </p>
          <div className="inline-flex items-center bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full">
            <Clock className="w-4 h-4 mr-2" />
            Limitiertes Angebot - Nur für kurze Zeit
          </div>
        </motion.div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product, index) => {
            const discountedPrice = product.price * (1 - upsellDiscount / 100);
            const productInCart = isInCart(product.id);
            
            return (
              <motion.div
                key={product.id}
                className="bg-white rounded-lg shadow-lg overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                {product.images[0] && (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-4">{product.name}</h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-2xl font-bold text-green-600">
                        {formatPrice(discountedPrice)}
                      </span>
                      <span className="text-sm line-through text-gray-400 ml-2">
                        {formatPrice(product.price)}
                      </span>
                    </div>
                    <motion.button
                      onClick={() => productInCart 
                        ? onRemoveFromCart(product.id) 
                        : onAddToCart(product.id, true)
                      }
                      className={`px-4 py-2 rounded-lg transition-colors flex items-center ${
                        productInCart 
                          ? 'bg-red-500 hover:bg-red-600 text-white' 
                          : 'bg-black hover:bg-gray-800 text-white'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      disabled={isExpired}
                    >
                      {productInCart ? (
                        <>
                          Entfernen
                          <X className="w-4 h-4 ml-2" />
                        </>
                      ) : (
                        <>
                          Hinzufügen
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
