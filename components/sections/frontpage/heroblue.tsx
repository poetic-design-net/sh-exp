"use client"

import dynamic from 'next/dynamic'
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { useInView } from "framer-motion"
import { useRef } from "react"
import { ArrowDownRight } from 'lucide-react'

interface HeroContent {
  title: string
  titleThin: string
  since: string
  description: string[]
}

interface HeroProps {
  content?: HeroContent
  className?: string
}

const defaultContent: HeroContent = {
  title: "Transformiere",
  titleThin:"dein Leben",
  since: "2010",
  description: [
    "Stefan Hiene ist dein Guide für ganzheitliches",
    "Training, persönliche Transformation und",
    "nachhaltiges Wachstum."
  ]
}

// Separate the animated arrow into a client component
const AnimatedArrow = dynamic(() => Promise.resolve(() => {
  const ctaArrowButtonClasses = "p-4 bg-cyan-300 rounded-full flex justify-center items-center hover:bg-cyan-200 transition-all cursor-pointer";
  
  return (
    <motion.div
      animate={{ 
        y: [0, 10, 0],
        opacity: [1, 0.5, 1]
      }}
      transition={{ 
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      className={ctaArrowButtonClasses}
    >
      <ArrowDownRight className="w-6 h-6 text-cyan-950" />
    </motion.div>
  );
}), { ssr: false })

export default function Hero({ 
  content = defaultContent,
  className 
}: HeroProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.4,
        ease: "easeOut"
      }
    }
  }

  return (
    <motion.section 
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={containerVariants}
      className={cn(
        "relative bg-[#68aac5] dark:bg-gray-900 overflow-hidden transition-colors duration-200",
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
      <div className="absolute inset-0 bg-gradient-to-r from-[#68aac5]/50 via-transparent dark:from-gray-900 dark:via-gray-900 transition-colors duration-200" />

      <div className="relative h-full container mx-auto px-4 flex flex-col justify-center">
        <motion.div 
          variants={itemVariants}
          className="absolute left-0 bottom-12 hidden md:block"
          style={{ zIndex: 2 }}
        >
          <img 
            src="/static/images/intensiventbildung_ready.webp"
            alt="Stefan Hiene Portrait"
            className="w-3/5 opacity-70 h-auto object-cover hidden rounded-xl"
          />
        </motion.div>

        <motion.div className="relative z-10 max-w-4xl mx-auto space-y-4">
          <motion.div variants={itemVariants} className="ml-auto text-center">
            <motion.span className="text-center text-cyan-300 text-base font-bold leading-tight lg:text-2xl lg:max-w-3xl block">
              Seit
            </motion.span>
            <motion.span className="text-center text-cyan-300 text-base font-bold leading-tight lg:text-2xl lg:max-w-3xl block pb-4">
              {content.since}
            </motion.span>
            <motion.p className="relative text-center text-white text-base font-normal leading-tight lg:text-2xl lg:max-w-3xl dark:text-gray-300">
              {content.description.map((line, index) => (
                <motion.span key={index} className="block">
                  {line}
                </motion.span>
              ))}
            </motion.p>
          </motion.div>
          
          <motion.div variants={itemVariants} className="text-center mb-16">
            <motion.h1 className="font-heading text-cyan-100/90 sm:text-cyan-950 font-bold text-4xl sm:text-5xl lg:text-8xl block dark:text-cyan-100/90">
              {content.title}
            </motion.h1>
            <motion.h1 className="font-heading text-cyan-100/80 sm:text-cyan-950 text-4xl sm:text-5xl lg:text-8xl block dark:text-cyan-100/80">
              {content.titleThin}
            </motion.h1>
          </motion.div>
        </motion.div>

        <motion.div variants={itemVariants} className="relative mx-auto">
          <div className="mt-8">
            <div className="w-20 h-20 flex items-center justify-center relative">
              <div className="absolute z-10 inset-0 animate-spinSlow [animation-direction:reverse]">
                <div className="w-full h-full rounded-full dark:border-white transition-colors duration-200" />
              </div>
              <AnimatedArrow />
            </div>
          </div>       
        </motion.div>
      </div>
    </motion.section>
  )
}
