"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Clock, Award, Zap } from "lucide-react";

export function FunnelTrustBadges() {
  const badges = [
    { icon: ShieldCheck, text: "Sichere Bezahlung" },
    { icon: Clock, text: "24/7 Support" },
    { icon: Award, text: "Qualitätsgarantie" },
    { icon: Zap, text: "Schnelle Lieferung" }
  ];

  return (
    <section className="py-8 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {badges.map((badge, index) => (
            <motion.div
              key={index}
              className="flex flex-col items-center text-center"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <badge.icon className="w-8 h-8 mb-2 text-gray-600" />
              <span className="text-sm font-medium">{badge.text}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
