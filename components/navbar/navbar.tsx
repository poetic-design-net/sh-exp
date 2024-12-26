"use client";

import { NavbarMobile } from "@/components/navbar/navbar-mobile";
import { NavbarUserLinks } from "@/components/navbar/navbar-user-links";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { FC } from "react";
import { Menu, ArrowUpRight, Facebook, Instagram, Youtube } from 'lucide-react';
import { Telegram } from '@/components/ui/icons/telegram';

const socialButtonClasses = "p-2 bg-white/30 rounded-full flex justify-center items-center backdrop-blur-sm hover:bg-white/40 transition-all cursor-pointer";

const NavbarContent = () => (
  <div className="flex items-center flex-shrink-0">
    <Link href="/" className="flex items-center">
      <div className="relative w-[40px] h-[40px]">
        <img 
          src="/static/assets/logo.webp"
          alt="Stefan Hiene Logo"
          className="w-full h-full object-contain"
        />
      </div>
      <div className="text-2xl font-semibold tracking-tighter ml-3 mr-6">
        StefanHiene
      </div>
    </Link>

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
  </div>
);

export const NavBar: FC = () => {
  return (
    <nav className="w-full bg-background/80 backdrop-blur-sm relative">
      {/* Added max-width and better spacing control */}
      <div className="max-w-[1400px] w-full mx-auto hidden lg:flex items-center px-8 p-4">
        {/* Left section with logo and social icons */}
        <div className="flex-shrink-0">
          <NavbarContent />
        </div>

        {/* Spacer to push user links to the right */}
        <div className="flex-grow" />

        {/* Right section with fixed width for user links */}
        <div className="flex-shrink-0">
          <NavbarUserLinks />
        </div>
        
        {/* Mobile menu - hidden on desktop */}
        <div className="grow lg:hidden flex justify-end">
          <NavbarMobile />
        </div>
      </div>
    </nav>
  );
};
