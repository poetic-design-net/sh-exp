"use client";

import { motion } from "framer-motion";
import { StarIcon } from "lucide-react";
import Image from "next/image";

interface Testimonial {
  author: string;
  text: string;
  image?: string;
  rating: number;
}

interface FunnelTestimonialsProps {
  testimonials: Testimonial[];
}

export function FunnelTestimonials({ testimonials }: FunnelTestimonialsProps) {
  if (!testimonials || testimonials.length === 0) return null;

  return (
    <section className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold mb-4">Was unsere Kunden sagen</h2>
          <p className="text-xl text-gray-600">Echte Erfahrungen von echten Menschen</p>
        </motion.div>
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              className="bg-gray-50 p-6 rounded-lg shadow-md"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-center mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <StarIcon key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 mb-4 italic">"{testimonial.text}"</p>
              <div className="flex items-center">
                {testimonial.image && (
                  <div className="relative w-10 h-10 rounded-full overflow-hidden mr-3">
                    <Image
                      src={testimonial.image}
                      alt={testimonial.author}
                      fill
                      sizes="40px"
                      className="object-cover"
                    />
                  </div>
                )}
                <span className="font-semibold">{testimonial.author}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
