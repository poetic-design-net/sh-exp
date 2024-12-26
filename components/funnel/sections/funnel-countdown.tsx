"use client";

import { useState, useEffect } from 'react';
import { FunnelExpiredOverlay } from './funnel-expired-overlay';

interface CountdownProps {
  startDate: Date;
  endDate: Date;
  redirectUrl?: string;
}

export function FunnelCountdown({ startDate, endDate, redirectUrl }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    timestamp: Date.now()
  });
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const difference = endDate.getTime() - now.getTime();
      
      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ 
          days, 
          hours, 
          minutes, 
          seconds,
          timestamp: Date.now()
        });
      } else {
        setIsExpired(true);
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [endDate]);

  const timeBlocks = [
    { label: 'Tage', value: timeLeft.days },
    { label: 'Stunden', value: timeLeft.hours },
    { label: 'Minuten', value: timeLeft.minutes },
    { label: 'Sekunden', value: timeLeft.seconds }
  ];

  return (
    <>
      <div className="flex gap-4 mt-6" key={timeLeft.timestamp}>
        {timeBlocks.map(({ label, value }) => (
          <div key={`${label}-${timeLeft.timestamp}`} className="flex flex-col items-center">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center mb-2">
              <span className="text-white text-2xl font-bold">
                {value.toString().padStart(2, '0')}
              </span>
            </div>
            <span className="text-white/80 text-sm">{label}</span>
          </div>
        ))}
      </div>
      <FunnelExpiredOverlay isExpired={isExpired} redirectUrl={redirectUrl} />
    </>
  );
}
