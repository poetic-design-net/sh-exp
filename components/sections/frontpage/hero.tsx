"use client"

import { motion, useScroll, useTransform } from "framer-motion"
import { cn } from "@/lib/utils"
import { useInView } from "framer-motion"
import { useRef, useEffect } from "react"

interface HeroContent {
  title: string
  since: string
  description: string[]
}

interface HeroProps {
  content?: HeroContent
  className?: string
}

const defaultContent: HeroContent = {
  title: "Transformiere dein Leben",
  since: "2010",
  description: [
    "Stefan Hiene ist dein Guide für ganzheitliches",
    "Training, persönliche Transformation und",
    "nachhaltiges Wachstum."
  ]
}

export default function Hero({ 
  content = defaultContent,
  className 
}: HeroProps) {
  const ref = useRef(null)
  const contentRef = useRef(null)
  const isInView = useInView(ref, { once: false })
  
  // Scroll-based animations
  const { scrollY } = useScroll()
  const contentY = useTransform(scrollY, [0, 300], [0, -50])
  const contentOpacity = useTransform(scrollY, [0, 300], [1, 0])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  }

  // Scroll reveal animation for content below
  const scrollRevealVariants = {
    hidden: { y: 100, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  }

  return (
    <>
      <motion.section 
        ref={ref}
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className={cn(
          "relative bg-coolGray-50 dark:bg-gray-900 overflow-hidden min-h-screen transition-colors duration-200",
          className
        )}
        style={{
          backgroundImage: 'url(/static/images/stefanhiene_rechts.webp)',
          backgroundPosition: 'bottom right',
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'contain',
          height: '100vh'
        }}
      >
        {/* Gradient overlay */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="absolute inset-0 bg-gradient-to-r from-coolGray-50 via-coolGray-50/95 to-transparent dark:from-gray-900 dark:via-gray-900 transition-colors duration-200" 
        />

        {/* Main container */}
        <div className="relative h-full container mx-auto px-4 flex flex-col justify-center">
          {/* Left image - Now fixed position without scroll animations */}
          <motion.div 
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="absolute left-0 bottom-12 hidden md:block"
            style={{ zIndex: 2 }}
          >
            <img 
              src="/static/images/intensiventbildung_ready.webp"
              alt="Stefan Hiene Portrait"
              className="w-3/5 opacity-70 h-auto object-cover hidden rounded-xl"
            />
          </motion.div>

          {/* Content - with scroll animations */}
          <motion.div 
            ref={contentRef}
            style={{ y: contentY, opacity: contentOpacity }}
            variants={containerVariants}
            className="relative z-10 max-w-4xl mx-auto"
          >
            {/* Main title */}
            <motion.div 
              variants={itemVariants}
              className="ml-auto text-center"
            >
              <motion.span 
                variants={itemVariants}
                className="block mb-1 text-xs text-gray-600 dark:text-gray-400"
              >
                Seit
              </motion.span>
              <motion.span 
                variants={itemVariants}
                className="block mb-3 text-xs text-gray-600 dark:text-gray-400"
              >
                {content.since}
              </motion.span>
              <motion.p 
                variants={itemVariants}
                className="text-gray-600 dark:text-gray-300"
              >
                {content.description.map((line, index) => (
                  <motion.span
                    key={index}
                    variants={itemVariants}
                    className="block"
                  >
                    {line}
                  </motion.span>
                ))}
              </motion.p>
            </motion.div>
            <motion.div 
              variants={itemVariants}
              className="text-center mb-16"
            >
              <motion.h1 
                variants={itemVariants}
                className="font-heading text-5xl md:text-7xl lg:text-8xl tracking-tighter text-gray-900 dark:text-white"
              >
                {content.title}
              </motion.h1>
            </motion.div>
          </motion.div>

          {/* Bottom image with arrow */}
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ 
              y: isInView ? 0 : 50, 
              opacity: isInView ? 1 : 0 
            }}
            transition={{ duration: 0.8 }}
            className="relative mx-auto"
          >
            {/* Arrow decoration */}
            <div className="w-20 h-20 flex items-center justify-center">
              <div className="absolute z-10 inset-0 animate-spinSlow [animation-direction:reverse]">
                <div className="w-full h-full rounded-full border-2 border-gray-900 dark:border-white transition-colors duration-200" />
              </div>
              <motion.svg
                animate={{ 
                  y: [0, 10, 0],
                  opacity: [1, 0.5, 1]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="relative w-6 h-6 text-gray-900 dark:text-white transition-colors duration-200 z-10"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                />
              </motion.svg>
            </div>

            {/* Bottom image */}
            <img 
              src="/static/images/intensiventbildung_ready.webp"
              alt="Stefan Hiene Training"
              className="w-full h-auto rounded-lg hidden"
            />
          </motion.div>
        </div>
      </motion.section>

      {/* Scroll-triggered content wrapper */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.3 }}
        variants={scrollRevealVariants}
        className="relative z-10"
      >
        {/* This div will wrap any content below the hero section */}
        <div className="bg-white dark:bg-gray-900 relative z-10 transition-colors duration-200">
          {/* Content below hero will automatically get the roll-up animation */}
        </div>
      </motion.div>
    </>
  )
}
