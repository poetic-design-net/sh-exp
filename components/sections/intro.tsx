'use client';

import React, { useState, useEffect } from 'react';
import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

interface IntroProps {
  id?: string;
  title: string;
  stats: {
    value: string;
    description: string;
  };
  features: {
    title: string;
    backTitle: string;
    backSubtitle: string;
    backDescription: string;
    bgImage?: string;
  }[];
  programOverview?: {
    title: string;
    subtitle: string;
    description: string;
    buttonText: string;
    buttonLink: string;
  };
}

const Intro: React.FC<IntroProps> = ({ 
  id = "intro",
  title,
  stats,
  features,
  programOverview
}) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1280);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const topRowFeatures = features.slice(0, 3);
  const bottomRowFeatures = features.slice(3);

  const CardFace = ({ 
    title, 
    bgImage, 
    isBack = false,
    backTitle,
    backSubtitle,
    backDescription 
  }: { 
    title: string; 
    bgImage?: string; 
    isBack?: boolean;
    backTitle?: string;
    backSubtitle?: string;
    backDescription?: string;
  }) => (
    <div 
      className={`
        absolute inset-0 w-full h-full rounded-3xl
        transition-all duration-700 ease-in-out
        ${isBack ? '[transform:rotateY(180deg)]' : ''}
        ${bgImage && !isBack ? 'bg-cover bg-center' : 'bg-cyan-800'}
        [backface-visibility:hidden]
      `}
      style={bgImage && !isBack ? { backgroundImage: `url("${bgImage}")` } : undefined}
    >
      {isBack ? (
        <div className="p-8 md:p-10 lg:p-12 h-full flex flex-col justify-between">
          <div className="text-white/90 text-xl font-medium">
            {backSubtitle || "Entdecke"}
          </div>
          <div>
            <h3 className="text-white text-2xl md:text-3xl font-bold mb-4">
              {backTitle || title}
            </h3>
            <p className="text-white/80 text-lg">
              {backDescription || "Erfahre mehr über unsere maßgeschneiderten Lösungen und wie wir Ihnen helfen können."}
            </p>
          </div>
        </div>
      ) : (
        <div className="h-full flex flex-col justify-end p-6 md:p-8 lg:p-10">
          {bgImage && (
            <div className="absolute inset-0 bg-gradient-to-t from-cyan-900/90 via-cyan-900/30 to-cyan-900/50 rounded-3xl" />
          )}
          <div className="text-white text-[32px] md:text-[36px] lg:text-[40px] font-bold capitalize leading-[40px] relative">
            {title}
          </div>
        </div>
      )}
    </div>
  );

  const Card = ({ feature }: { feature: IntroProps['features'][0] }) => (
    <div className="relative w-full h-[380px] md:h-[410px] lg:h-[440px] group [perspective:1500px]">
      <div className="relative w-full h-full transition-all duration-700 ease-in-out [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">
        <CardFace 
          title={feature.title} 
          bgImage={feature.bgImage}
        />
        <CardFace 
          title={feature.title}
          backTitle={feature.backTitle}
          backSubtitle={feature.backSubtitle}
          backDescription={feature.backDescription}
          isBack 
        />
      </div>
    </div>
  );

  return (
    <section id={id} className="w-full bg-cyan-950">
      <div className="max-w-[1440px] mx-auto px-5 md:px-16 lg:px-24 py-10 md:py-16 lg:py-24 flex flex-col justify-start items-start gap-10 md:gap-16 lg:gap-24">
        {/* Title */}
        <h2 className="self-stretch text-white text-[32px] md:text-[36px] lg:text-[40px] font-bold leading-[40px]">
          {title}
        </h2>

        {/* All Cards Container */}
        <div className="self-stretch grid grid-cols-1 md:grid-cols-2 lg:grid-cols-none lg:flex lg:flex-col gap-3">
          {/* Top Row */}
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="order-1 md:col-span-3 lg:flex-1">
              {topRowFeatures[0] && <Card feature={topRowFeatures[0]} />}
            </div>

            <div className="order-2 md:col-span-3 lg:w-[550px]">
              {topRowFeatures[1] && <Card feature={topRowFeatures[1]} />}
            </div>

            <div className="order-5 sm:order-3 md:col-span-6 lg:flex-1">
              {topRowFeatures[2] && <Card feature={topRowFeatures[2]} />}
            </div>
          </div>

          {/* Bottom Row */}
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="order-4 md:col-span-3 lg:flex-1">
              {bottomRowFeatures[0] && <Card feature={bottomRowFeatures[0]} />}
            </div>

            {/* Stats Card */}
            <div className="order-3 sm:order-5 w-full md:col-span-6 lg:w-[550px] h-[380px] md:h-[410px] lg:h-[440px] py-14 md:px-10 lg:px-12 rounded-3xl flex flex-col justify-between items-center">
              <div className="self-stretch flex flex-col justify-start items-center gap-3">
                <div className="self-stretch text-center bg-gradient-to-br from-cyan-100 via-cyan-400 to-cyan-700 text-transparent bg-clip-text text-[48px] md:text-[64px] lg:text-[80px] font-bold capitalize leading-[48px] md:leading-[80px] lg:leading-[100px]">
                  {stats.value}
                </div>
                <div className="self-stretch text-center bg-gradient-to-br from-cyan-100 via-cyan-400 to-cyan-700 text-transparent bg-clip-text text-[32px] md:text-[36px] lg:text-[40px] font-bold capitalize leading-[40px] md:leading-[44px] lg:leading-[48px]">
                  {stats.description}
                </div>
              </div>
              <button className="px-4 py-2 rounded-3xl border border-white flex justify-center items-center gap-1 hover:bg-white/10 transition-colors">
                <span className="text-white text-[20px] font-bold leading-[24px]">
                  Mehr erfahren
                </span>
              </button>
            </div>

            <div className="order-6 md:col-span-6 lg:flex-1">
              {bottomRowFeatures[1] && <Card feature={bottomRowFeatures[1]} />}
            </div>
          </div>
        </div>

        {/* Program Overview Section */}
        {programOverview && programOverview.buttonLink && (
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24 flex flex-col items-center gap-6 sm:gap-8 lg:gap-10">
            <h2 className="text-center text-white text-2xl sm:text-3xl lg:text-4xl font-bold">
              {programOverview.title}
            </h2>
            <div className="text-center text-cyan-300 text-4xl sm:text-6xl lg:text-8xl font-bold capitalize">
              {programOverview.subtitle}
            </div>
            <p className="max-w-2xl text-center text-white text-lg sm:text-xl lg:text-2xl">
              {programOverview.description}
            </p>
            <Link href={programOverview.buttonLink} className="w-full sm:w-auto">
              <button
                className="w-full p-1 bg-cyan-300 rounded-full flex items-center disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity relative"
              >
                <div className="p-4 bg-cyan-950 rounded-full">
                  <ArrowUpRight className="w-6 h-6 text-cyan-300" />
                </div>
                <span className="flex-1 text-center px-6 py-4 text-cyan-950 text-xl font-bold leading-normal" style={{ paddingRight: isMobile ? 'calc(2rem + 32px)' : '1.5rem' }}>
                  {programOverview.buttonText}
                </span>
              </button>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default Intro;
