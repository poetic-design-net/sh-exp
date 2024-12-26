"use client";

import { ComponentType, LandingPageComponent } from '@/types/landing-page';
import { Hero } from '@/components/sections/hero';
import { FAQ } from '@/components/sections/faq';
import TestimonialSlider from '@/components/sections/testimonial-slider-wrapper';
import Intro from '@/components/sections/intro';
import Register from '@/components/sections/register';
import { Footer } from '@/components/sections/footer';

// Only include components that exist in the project
const components: Partial<Record<ComponentType, React.ComponentType<any>>> = {
  hero: Hero,
  faq: FAQ,
  testimonials: TestimonialSlider,
  intro: Intro,
  register: Register,
  footer: Footer,
};

interface ComponentMapperProps {
  component: LandingPageComponent;
}

export function ComponentMapper({ component }: ComponentMapperProps) {
  const Component = components[component.type];
  
  if (!Component) {
    // Skip rendering if component type is not implemented
    console.warn(`Component type "${component.type}" not implemented`);
    return null;
  }

  return <Component {...component.props} />;
}
