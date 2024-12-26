import { ReactNode } from 'react';

interface LandingPageLayoutProps {
  children: ReactNode;
}

export default function LandingPageLayout({ children }: LandingPageLayoutProps) {
  return (
    <div className="landing-page w-full max-w-[1920px] shadow-2xl mx-auto">
      {children}
    </div>
  );
}

export const metadata = {
  title: 'Stefan Hiene | Intensive Development',
  description: 'Join the journey of deep transformation with Stefan Hiene. A unique blend of personal growth, mindfulness, and professional development.',
};
