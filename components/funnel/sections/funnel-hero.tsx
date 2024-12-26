"use client";

import { motion } from "framer-motion";
import { ArrowRight, Clock, ShieldCheck, Award } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/types/product";
import { CountdownTimer } from "../countdown-timer";

interface FunnelHeroProps {
  mainProduct: Product;
  mainProductDiscount: number;
  isExpired: boolean;
  countdownStartDate?: Date;
  countdownEndDate?: Date;
  onAddToCart: (productId: string) => void;
  onExpire: () => void;
}

export function FunnelHero({
  mainProduct,
  mainProductDiscount,
  isExpired,
  countdownStartDate,
  countdownEndDate,
  onAddToCart,
  onExpire
}: FunnelHeroProps) {
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const mainProductDiscountedPrice = mainProduct.price * (1 - (mainProductDiscount || 0) / 100);

  return (
    <section className="py-24 bg-gradient-to-b from-black to-gray-900 text-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div 
            className="space-y-6"
            {...fadeIn}
          >
            <h1 className="text-5xl font-bold mb-6">{mainProduct.name}</h1>
            <p className="text-xl mb-8">{mainProduct.shortDescription}</p>

            {/* Countdown Section */}
            {countdownStartDate && countdownEndDate && !isExpired && (
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8">
                <h3 className="text-xl font-semibold mb-4 text-cyan-300">
                  🔥 Limitiertes Angebot - Nur für kurze Zeit!
                </h3>
                <CountdownTimer
                  startDate={countdownStartDate}
                  endDate={countdownEndDate}
                  onExpire={onExpire}
                />
              </div>
            )}

            <div className="flex flex-col space-y-4 mb-8">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <span className="text-3xl font-bold text-cyan-300">
                    {formatPrice(mainProductDiscountedPrice)}
                  </span>
                  <span className="text-xl line-through text-gray-400">
                    {formatPrice(mainProduct.price)}
                  </span>
                </div>
                {mainProductDiscount > 0 && (
                  <span className="bg-cyan-300 text-black px-3 py-1 rounded-full text-sm font-medium">
                    {mainProductDiscount}% Rabatt
                  </span>
                )}
              </div>
              <motion.button
                onClick={() => onAddToCart(mainProduct.id)}
                className="px-6 py-3 bg-cyan-300 text-black rounded-full hover:bg-cyan-200 transition-colors inline-flex items-center justify-center font-bold"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={isExpired}
              >
                Jetzt zum Aktionspreis sichern
                <ArrowRight className="w-5 h-5 ml-2" />
              </motion.button>
            </div>
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                Limitiertes Angebot
              </div>
              <div className="flex items-center">
                <ShieldCheck className="w-4 h-4 mr-1" />
                Sichere Bezahlung
              </div>
              <div className="flex items-center">
                <Award className="w-4 h-4 mr-1" />
                Qualitätsgarantie
              </div>
            </div>
          </motion.div>
          <motion.div 
            className="relative"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            {mainProduct.images[0] && (
              <img
                src={mainProduct.images[0]}
                alt={mainProduct.name}
                className="w-full rounded-lg shadow-xl"
              />
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
