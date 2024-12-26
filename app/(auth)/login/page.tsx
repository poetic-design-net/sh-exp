'use client';

import { SignInForm } from "@/components/auth/sign-in-form";
import Image from "next/image";
import { useState } from "react";
import { SignUpForm } from "@/components/auth/sign-up-form";

export default function LoginPage() {
  const [showSignUp, setShowSignUp] = useState(false);

  return (
    <div className="flex min-h-screen">
      {/* Left side - Image */}
      <div className="hidden lg:block lg:w-1/3 relative">
        <Image
          src="/static/images/intensiventbildung_ready.webp"
          alt="Stefan Hiene Portrait"
          fill
          style={{ objectFit: 'cover' }}
          priority
          className="brightness-90"
        />
        <div className="absolute inset-0 bg-black/30" /> {/* Overlay for better text contrast */}
        <div className="absolute bottom-10 left-10 text-white">
          <h2 className="text-4xl font-bold mb-2">Willkommen zurück</h2>
          <p className="text-lg opacity-90">Melde dich an und starte deine Reise</p>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-2/3 flex items-center justify-center p-8 sm:p-12 bg-gray-50">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              {showSignUp ? 'Erstelle deinen Account' : 'Anmelden'}
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              {showSignUp 
                ? 'Bereits registriert? Dann melde dich an' 
                : 'Noch kein Account? Dann registriere dich jetzt'}
            </p>
          </div>

          <div className="mt-8">
            {showSignUp ? (
              <SignUpForm onShowLogin={() => setShowSignUp(false)} />
            ) : (
              <SignInForm onShowSignUp={() => setShowSignUp(true)} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
