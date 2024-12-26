"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import type { Product } from "@/types/product";

interface FunnelProductDetailsProps {
  product: Product;
}

export function FunnelProductDetails({ product }: FunnelProductDetailsProps) {
  if (!product.description) return null;

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12">
          <motion.div 
            className="space-y-6"
            initial={{ x: -50, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold">Produktdetails</h2>
            <div 
              className="prose max-w-none prose-p:my-4 prose-p:leading-relaxed" 
              dangerouslySetInnerHTML={{ __html: product.description }} 
            />
          </motion.div>
          <div className="space-y-4">
            {(product.avifImages?.slice(1) || product.images.slice(1)).map((image: string, index: number) => (
              <motion.div
                key={index}
                className="relative w-full aspect-[4/3] rounded-lg shadow-md overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
              >
                <Image
                  src={image}
                  alt={`${product.name} - Bild ${index + 2}`}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                  priority={index === 0}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
