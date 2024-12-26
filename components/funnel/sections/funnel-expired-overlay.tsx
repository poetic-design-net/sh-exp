"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

interface FunnelExpiredOverlayProps {
  isExpired: boolean;
  redirectUrl?: string;
}

export function FunnelExpiredOverlay({ isExpired, redirectUrl }: FunnelExpiredOverlayProps) {
  return (
    <AnimatePresence>
      {isExpired && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white p-8 rounded-lg max-w-md mx-4 text-center"
          >
            <h2 className="text-2xl font-bold mb-4">Diese Aktion ist leider abgelaufen</h2>
            <p className="text-gray-600 mb-6">
              Das Angebot ist nicht mehr verfügbar. Besuchen Sie unsere Produktseite für aktuelle Angebote.
            </p>
            {redirectUrl && (
              <Link
                href={redirectUrl}
                className="inline-block px-6 py-3 bg-black text-white rounded-full hover:bg-gray-800 transition-colors"
              >
                Zum Produkt
                <ArrowRight className="w-5 h-5 ml-2 inline-block" />
              </Link>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
