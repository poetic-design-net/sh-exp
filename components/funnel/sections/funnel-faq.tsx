"use client";

import { motion } from "framer-motion";

interface FAQ {
  question: string;
  answer: string;
}

interface FunnelFAQProps {
  faqs: FAQ[];
}

export function FunnelFAQ({ faqs }: FunnelFAQProps) {
  if (!faqs || faqs.length === 0) return null;

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-3xl mx-auto px-4">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold mb-4">Häufig gestellte Fragen</h2>
          <p className="text-xl text-gray-600">Alles was Sie wissen müssen</p>
        </motion.div>
        <div className="space-y-6">
          {faqs.map((item, index) => (
            <motion.div
              key={index}
              className="bg-white rounded-lg shadow-md p-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <h3 className="text-xl font-semibold mb-2">{item.question}</h3>
              <p className="text-gray-600">{item.answer}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
