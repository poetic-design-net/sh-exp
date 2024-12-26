"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, ArrowUpRight, Facebook, Instagram, Youtube } from 'lucide-react';
import { NavigationConfig } from '@/types/landing-page';
import { MobileMenu } from './mobile-menu';
import { Telegram } from '@/components/ui/icons/telegram';

interface HeroProps {
  id?: string;
  titleBold: string;
  titleNormal: string;
  subtitle: string;
  description: string;
  backgroundImage: string;
  ctaText: string;
  ctaLink: string;
  topBannerText?: string;
  navigation?: NavigationConfig;
}

function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    timestamp: Date.now()
  });

  useEffect(() => {
    const targetDate = new Date('2024-12-31T23:59:59');

    const calculateTimeLeft = () => {
      const now = new Date();
      const difference = targetDate.getTime() - now.getTime();
      
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
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, []);

  const timeBlocks = [
    { label: 'Tage', value: timeLeft.days },
    { label: 'Stunden', value: timeLeft.hours },
    { label: 'Minuten', value: timeLeft.minutes },
    { label: 'Sekunden', value: timeLeft.seconds }
  ];

  return (
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
  );
}

export function Hero({
  id = "hero",
  titleBold,
  titleNormal,
  subtitle,
  description,
  backgroundImage,
  ctaText,
  ctaLink,
  topBannerText,
  navigation
}: HeroProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const [showBanner, setShowBanner] = useState(true);
  const heroRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (!heroRef.current || !navRef.current) return;
          
          const heroRect = heroRef.current.getBoundingClientRect();
          const currentScrollY = window.scrollY;
          
          if (currentScrollY < lastScrollY) {
            setShowBanner(true);
          } else if (currentScrollY > lastScrollY && currentScrollY > 50) {
            setShowBanner(false);
          }
          
          lastScrollY = currentScrollY;
          
          // Make nav sticky when hero section is about to leave viewport
          setIsSticky(heroRect.bottom <= 80); // 80px = nav height (64px) + top spacing (16px)
          
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const socialButtonClasses = "p-2 bg-white/30 rounded-full flex justify-center items-center backdrop-blur-sm hover:bg-white/40 transition-all cursor-pointer";
  const ctaArrowButtonClasses = "p-4 bg-cyan-300 rounded-full flex justify-center items-center hover:bg-cyan-200 transition-all cursor-pointer";
  const ctaLinkClasses = "px-8 py-4 bg-white rounded-full flex justify-center items-center hover:bg-opacity-90 transition-all";
  const ctaTextClasses = "text-cyan-950 text-xl font-bold leading-normal whitespace-nowrap";
  const navLinkClasses = "text-white text-xl font-medium leading-normal hover:text-cyan-200 transition-colors cursor-pointer";

  return (
    <>
      {navigation && (
        <MobileMenu 
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
          navigation={navigation}
        />
      )}

      <div id={id} ref={heroRef} className="min-h-[100vh] relative bg-[#68aac5] flex flex-col">
        {/* Background Image */}
        <div 
          className="absolute bottom-0 left-0 w-full h-[100vh] lg:h-full lg:w-1/2 lg:right-0 lg:left-auto z-0 bg-cover sm:bg-contain"
          style={{
            backgroundImage: `url(${backgroundImage})`,
            backgroundPosition: 'right bottom',
            backgroundRepeat: 'no-repeat',
            filter: 'grayscale(100%)'
          }}
        />  

        {/* Mobile dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#68aac5]/50 via-cyan-600/80 to-cyan-950 lg:hidden z-0" />

        {/* Desktop gradient overlay */}
        <div className="absolute inset-0 hidden lg:block bg-gradient-to-r from-[#68aac5]/50 via-transparent z-0" />

        {/* Top Banner */}
        {topBannerText && (
          <div 
            className={`
              relative w-full px-4 py-3 bg-cyan-300 flex justify-center items-center gap-1 z-10
              transition-all duration-300 ease-in-out
              ${showBanner ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full'}
            `}
          >
            <div className="text-center text-cyan-950 text-sm font-bold leading-tight">
              {topBannerText}
            </div>
          </div>
        )}

        {/* Mobile Header */}
        <div className="relative w-full px-5 py-3 flex justify-between items-center lg:hidden z-10">
        <div className="flex items-center">
              <Image 
                src="/static/assets/logo.webp"
                alt="Stefan Hiene Logo"
                width={40}
                height={40}
                className="mr-3"
              />
              <div className="text-2xl font-semibold tracking-tighter text-white/90 mr-6">
                StefanHiene
              </div>
            </div>
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-3 bg-white/30 rounded-full flex justify-center items-center"
          >
            <Menu className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Desktop Header - Hidden on Mobile */}
        <div className="relative hidden lg:block px-6 z-10">
          <div className="flex items-center pt-8">
            <div className="flex items-center">
              <Image 
                src="/static/assets/logo.webp"
                alt="Stefan Hiene Logo"
                width={40}
                height={40}
                className="mr-3"
              />
              <div className="text-2xl font-semibold tracking-tighter text-white/90 mr-6">
                StefanHiene
              </div>
            </div>
            {navigation?.settings?.showSocialLinks && (
              <div className="flex gap-3">
                <div className={socialButtonClasses}>
                  <Facebook className="w-4 h-4 text-white" />
                </div>
                <div className={socialButtonClasses}>
                  <Instagram className="w-4 h-4 text-white" />
                </div>
                <div className={socialButtonClasses}>
                  <Youtube className="w-4 h-4 text-white" />
                </div>
                <div className={socialButtonClasses}>
                  <Telegram className="w-4 h-4 text-white" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="relative flex-grow flex flex-col justify-center md:justify-center items-center z-10">
          <div className="max-w-[1440px] w-full mx-auto flex flex-col h-full flex-grow">
            <div className="px-5 flex flex-col items-center gap-10 lg:items-start md:px-16 lg:pr-24 flex-grow">
              <div className="flex flex-col justify-center items-center gap-4 lg:items-start flex-grow">
                {/* Subtitle with CTA Button for Desktop */}
                <div className="w-full flex flex-col lg:flex-row lg:items-center lg:gap-12">
                  <div className="relative text-center text-cyan-300 text-base lg:w-6/12 font-bold leading-tight lg:text-2xl lg:text-left italic">
                    
                    "{subtitle}"

                  </div>
                  {/* CTA Buttons - Desktop Only */}
                  <div className="hidden lg:flex items-center gap-1">
                    <div className={ctaArrowButtonClasses}>
                      <ArrowUpRight className="w-6 h-6 text-cyan-950" />
                    </div>
                    <Link href={ctaLink} className={ctaLinkClasses}>
                      <div className={ctaTextClasses}>{ctaText}</div>
                    </Link>
                  </div>
                </div>

                {/* Title with specific styling */}
                <div className="text-center lg:text-left">
                  <div>
                    <span className="text-cyan-100/90 sm:text-cyan-950 font-bold text-4xl sm:text-5xl lg:text-8xl block">
                      {titleBold}
                    </span>
                    <span className="text-cyan-100/80 sm:text-cyan-950 text-4xl sm:text-5xl lg:text-8xl block">
                      {titleNormal}
                    </span>
                  </div>
                </div>

                <div className="text-center text-white text-base font-normal leading-tight lg:text-2xl lg:text-left lg:max-w-3xl">
                  {description}
                </div>

                {/* Countdown Timer */}
                <CountdownTimer />
              </div>

              {/* CTA Buttons - Mobile Only */}
              <div className="flex items-center gap-1 lg:hidden mt-auto mb-8">
                <div className={ctaArrowButtonClasses}>
                  <ArrowUpRight className="w-6 h-6 text-cyan-950" />
                </div>
                <Link href={ctaLink} className={ctaLinkClasses}>
                  <div className={ctaTextClasses}>{ctaText}</div>
                </Link>
              </div>
            </div>
          </div>
        </div>

      {/* Navigation - Desktop Only */}
      {navigation?.desktopItems && (
          <div 
            ref={navRef}
            style={{ transform: `(${isSticky ? '0' : '0'})` }}
            className={`hidden lg:flex h-16 bg-black/20 backdrop-blur-md rounded-full items-center whitespace-nowrap z-20 transition-transform duration-200 ${
              isSticky 
                ? 'fixed top-8 left-1/2 -translate-x-1/2' 
                : 'absolute bottom-8 left-1/2 -translate-x-1/2'
            }`}
          >
            <div className="pl-10 pr-2 flex items-center gap-10">
              {navigation.desktopItems.map((item) => (
                <Link 
                  key={item.id} 
                  href={item.href}
                  className={navLinkClasses}
                  target={item.target}
                >
                  {item.label}
                </Link>
              ))}
              <Link href="#register" className="px-6 py-2 bg-cyan-300/90 backdrop-blur-sm rounded-full flex justify-center items-center gap-1 hover:bg-cyan-200 transition-all cursor-pointer">
                <div className={ctaTextClasses}>Platz reservieren</div>
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
