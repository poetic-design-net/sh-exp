"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface CountdownTimerProps {
  startDate: Date;
  endDate: Date;
  onExpire?: () => void;
}

export function CountdownTimer({ startDate, endDate, onExpire }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const start = new Date(startDate);
      const end = new Date(endDate);

      // Check if we're within the active period
      if (now < start) {
        setIsActive(false);
        return null;
      }

      if (now > end) {
        setIsActive(false);
        onExpire?.();
        return null;
      }

      setIsActive(true);
      const difference = end.getTime() - now.getTime();
      
      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000)
      };
    };

    // Initial calculation
    const initialTime = calculateTimeLeft();
    if (initialTime) {
      setTimeLeft(initialTime);
    }

    // Only set up the interval if we're in the active period
    if (isActive) {
      const timer = setInterval(() => {
        const newTime = calculateTimeLeft();
        if (newTime) {
          setTimeLeft(newTime);
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [startDate, endDate, onExpire, isActive]);

  // Don't render if not active
  if (!isActive) {
    return null;
  }

  const timeBlocks = [
    { key: 'days', label: 'Tage' },
    { key: 'hours', label: 'Stunden' },
    { key: 'minutes', label: 'Minuten' },
    { key: 'seconds', label: 'Sekunden' }
  ];

  return (
    <motion.div 
      className="flex flex-wrap items-center justify-center gap-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {timeBlocks.map(({ key, label }) => (
        <div key={key} className="flex flex-col items-center">
          <div className="bg-white/20 backdrop-blur-sm px-4 py-3 rounded-xl min-w-[80px]">
            <span className="text-3xl font-bold text-cyan-300">
              {timeLeft[key as keyof typeof timeLeft].toString().padStart(2, '0')}
            </span>
          </div>
          <span className="text-sm mt-2 text-white/80">{label}</span>
        </div>
      ))}
    </motion.div>
  );
}
