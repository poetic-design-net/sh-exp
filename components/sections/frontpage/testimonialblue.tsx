"use client"

import dynamic from 'next/dynamic'
import { motion, useScroll, useTransform } from "framer-motion"
import { useRef, useState, useEffect } from "react"
import { useTheme } from "next-themes"

// Static content that doesn't depend on client-side features
const testimonials = [
  {
    quote: "Mit meiner Expertise in Intensiventbildung und jahrelanger Erfahrung helfe ich Menschen dabei, ihre persönlichen und beruflichen Ziele zu erreichen.",
    author: "Stefan Hiene",
    role: "Experte für Intensiventbildung"
  },
  {
    quote: "Durch die Deprogrammierung alter Muster und Glaubenssätze erschaffen wir gemeinsam neue Wege zu deinem authentischen Selbst.",
    author: "Stefan Hiene",
    role: "Meister der Deprogrammierung"
  }
];

// Server/Fallback component
function TestimonialStatic() {
  return (
    <section className="relative overflow-hidden bg-cyan-950" style={{ height: "100vh" }}>
      <div className="absolute inset-0">
        <div 
          className="absolute inset-0 bg-center bg-no-repeat bg-cover"
          style={{ backgroundImage: "url('/static/images/stefanhiene_bg_section.webp')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-950/90 via-cyan-900/80 to-cyan-950/90" />
      </div>
      
      <div className="max-w-[1440px] mx-auto px-5 md:px-16 lg:px-24 h-full relative">
        <div className="absolute top-1/4 right-0 w-full lg:w-1/2">
          <div className="backdrop-blur-sm bg-cyan-900/20 rounded-3xl p-8 md:p-12 border border-cyan-800/20">
            <h2 className="font-heading tracking-tight text-4xl max-w-lg mb-12 text-cyan-100">
              {testimonials[0].quote}
            </h2>
            <div className="text-cyan-200">
              <p className="tracking-tight text-xl font-bold mb-1">{testimonials[0].author}</p>
              <p className="tracking-tight text-sm text-cyan-300">{testimonials[0].role}</p>
            </div>
          </div>
        </div>

        <div className="absolute bottom-1/4 left-0 w-full lg:w-1/2">
          <div className="backdrop-blur-sm bg-cyan-900/20 rounded-3xl p-8 md:p-12 border border-cyan-800/20">
            <h2 className="font-heading tracking-tight text-3xl max-w-lg mb-8 text-cyan-100">
              {testimonials[1].quote}
            </h2>
            <div className="text-cyan-200">
              <p className="tracking-tight text-xl font-bold mb-1">{testimonials[1].author}</p>
              <p className="tracking-tight text-sm text-cyan-300">{testimonials[1].role}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Dynamic animated component
const AnimatedTestimonial = dynamic(() => 
  import('framer-motion').then(mod => {
    const { motion, useScroll, useTransform } = mod;
    
    return function AnimatedTestimonialInner() {
      const ref = useRef(null);
      const { theme } = useTheme();
      
      const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "end start"]
      });

      const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "15%"]);
      const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);
      const secondQuoteOpacity = useTransform(
        scrollYProgress, 
        [0.3, 0.4, 0.7, 0.8],
        [0, 1, 1, 0]
      );

      return (
        <motion.section 
          ref={ref}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative overflow-hidden bg-cyan-950"
          style={{ height: "100vh" }}
        >
          <motion.div 
            className="absolute inset-0"
            style={{ y: backgroundY }}
          >
            <div 
              className="absolute inset-0 bg-center bg-no-repeat bg-cover"
              style={{ backgroundImage: "url('/static/images/stefanhiene_bg_section.webp')" }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-950/90 via-cyan-900/80 to-cyan-950/90" />
          </motion.div>
          
          <div className="max-w-[1440px] mx-auto px-5 md:px-16 lg:px-24 h-full relative">
            <motion.div 
              className="absolute top-1/4 right-0 w-full lg:w-1/2"
              style={{ opacity }}
            >
              <div className="backdrop-blur-sm bg-cyan-900/20 rounded-3xl p-8 md:p-12 border border-cyan-800/20">
                <h2 className="font-heading tracking-tight text-4xl max-w-lg mb-12 text-cyan-100">
                  {testimonials[0].quote}
                </h2>
                <div className="text-cyan-200">
                  <p className="tracking-tight text-xl font-bold mb-1">{testimonials[0].author}</p>
                  <p className="tracking-tight text-sm text-cyan-300">{testimonials[0].role}</p>
                </div>
              </div>
            </motion.div>

            <motion.div 
              className="absolute bottom-1/4 left-0 w-full lg:w-1/2"
              style={{ opacity: secondQuoteOpacity }}
            >
              <div className="backdrop-blur-sm bg-cyan-900/20 rounded-3xl p-8 md:p-12 border border-cyan-800/20">
                <h2 className="font-heading tracking-tight text-3xl max-w-lg mb-8 text-cyan-100">
                  {testimonials[1].quote}
                </h2>
                <div className="text-cyan-200">
                  <p className="tracking-tight text-xl font-bold mb-1">{testimonials[1].author}</p>
                  <p className="tracking-tight text-sm text-cyan-300">{testimonials[1].role}</p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.section>
      );
    };
  }),
  { ssr: false, loading: () => <TestimonialStatic /> }
);

export function Testimonial() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <TestimonialStatic />;
  }

  return <AnimatedTestimonial />;
}
