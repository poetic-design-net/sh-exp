"use client";

import { FC } from 'react';
import Link from 'next/link';
import { NavigationConfig } from '@/types/landing-page';
import { X } from 'lucide-react';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  navigation: NavigationConfig;
}

export const MobileMenu: FC<MobileMenuProps> = ({ isOpen, onClose, navigation }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#68aac5] z-50 lg:hidden">
      {/* Header */}
      <div className="relative w-full px-5 py-3 flex justify-between items-center">
        <div className="text-white text-2xl font-black underline leading-loose">
          SH
        </div>
        <button
          onClick={onClose}
          className="p-3 bg-white/30 rounded-full flex justify-center items-center"
        >
          <X className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Navigation Links */}
      <div className="px-5 pt-10">
        <nav className="space-y-6">
          {navigation.mobileItems.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              onClick={onClose}
              className="block text-white text-2xl font-bold hover:text-cyan-300 transition-colors"
              target={item.target}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* CTA Button */}
        <div className="mt-10">
          <Link
            href="/get-started"
            className="w-full px-8 py-4 bg-white rounded-full flex justify-center items-center hover:bg-opacity-90 transition-all"
            onClick={onClose}
          >
            <span className="text-cyan-950 text-xl font-bold leading-normal">
              Platz reservieren
            </span>
          </Link>
        </div>

        {/* Social Links */}
        {navigation.settings.showSocialLinks && (
          <div className="mt-10 flex justify-center space-x-6">
            <Link
              href="#"
              className="text-white hover:text-cyan-300 transition-colors"
            >
              Facebook
            </Link>
            <Link
              href="#"
              className="text-white hover:text-cyan-300 transition-colors"
            >
              Instagram
            </Link>
            <Link
              href="#"
              className="text-white hover:text-cyan-300 transition-colors"
            >
              LinkedIn
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
