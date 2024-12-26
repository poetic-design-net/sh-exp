"use client";

import { motion } from "framer-motion";
import { Zap } from "lucide-react";

interface Benefit {
  title: string;
  description: string;
}

interface FunnelBenefitsProps {
  benefits: Benefit[];
}

export function FunnelBenefits({ benefits }: FunnelBenefitsProps) {
  if (!benefits || benefits.length === 0) return null;

  return (
    <section className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold mb-4">Ihre Vorteile</h2>
          <p className="text-xl text-gray-600">Was Sie von unserem Produkt erwarten können</p>
        </motion.div>
        <div className="grid md:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              className="p-6 bg-gray-50 rounded-lg"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Zap className="w-12 h-12 text-yellow-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
              <p className="text-gray-600">{benefit.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
