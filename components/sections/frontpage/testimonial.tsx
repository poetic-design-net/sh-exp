"use client"

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { useTheme } from "next-themes";

export const Testimonial = () => {
  const ref = useRef(null);
  const { theme } = useTheme();
  
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  // Parallax-Effekt für den Hintergrund
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);
  
  // Text-Animation beim Scrollen
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "-15%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.9, 1], [0, 0.7, 0, 0]);
  
  // Second quote animation based on scroll - smoother transitions
  const secondQuoteOpacity = useTransform(
    scrollYProgress, 
    [0, 0.35, 0.45, 0.7, 0.85], // Extended range for smoother fade
    [0, 0, 1, 1, 0]
  );
  const secondQuoteY = useTransform(
    scrollYProgress, 
    [0, 0.35, 0.45], // Extended range for smoother movement
    ["30px", "30px", "0px"] // Reduced movement distance
  );
  
  // Dynamische Textfarbe basierend auf Scroll-Position und Theme
  const textColor = useTransform(
    scrollYProgress,
    [0, 0.5, 0.6, 0.7],
    [
      "rgb(255, 255, 255)",
      "rgb(255, 255, 255)",
      theme === 'dark' ? "rgb(255, 255, 255)" : "rgb(120, 120, 120)",
      theme === 'dark' ? "rgb(255, 255, 255)" : "rgb(0, 0, 0)"
    ]
  );

  return (
    <section 
      ref={ref}
      className="px-8 md:px-40 py-44 relative overflow-hidden"
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
        <div className="absolute inset-0 bg-black/50 dark:bg-black/70" />
      </motion.div>
      
      {/* Original quote */}
      <motion.div 
        className="w-full lg:w-1/2 ml-auto relative z-10"
        style={{ y: textY, opacity }}
      >
        <motion.h1 
          className="font-heading tracking-tight text-4xl max-w-lg mb-12"
          style={{ color: textColor }}
        >
          "Mit meiner Expertise in Intensiventbildung und jahrelanger Erfahrung helfe ich Menschen dabei, 
          ihre persönlichen und beruflichen Ziele zu erreichen."
        </motion.h1>
        <motion.div style={{ color: textColor }}>
          <p className="tracking-tight text-xl font-semibold mb-1">Stefan Hiene</p>
          <p className="tracking-tight text-sm">Experte für Intensiventbildung</p>
        </motion.div>
      </motion.div>

      {/* Second quote that appears on scroll */}
      <motion.div 
        className="absolute bottom-44 left-8 md:left-40 w-full lg:w-1/3 z-10 text-white"
        style={{ 
          opacity: secondQuoteOpacity,
          y: secondQuoteY
        }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <motion.h2 
          className="font-heading tracking-tight text-3xl max-w-lg mb-8"
        >
          "Durch die Deprogrammierung alter Muster und Glaubenssätze erschaffen wir gemeinsam neue Wege zu deinem authentischen Selbst."
        </motion.h2>
        <motion.div>
          <p className="tracking-tight text-xl font-semibold mb-1">Stefan Hiene</p>
          <p className="tracking-tight text-sm">Meister der Deprogrammierung</p>
        </motion.div>
      </motion.div>
    </section>
  );
};
