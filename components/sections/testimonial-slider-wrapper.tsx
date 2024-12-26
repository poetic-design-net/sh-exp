'use client';

import TestimonialSlider from './testimonial-slider';

interface TestimonialSliderWrapperProps {
  title: string;
  items: {
    name: string;
    quote: string;
    image: string;
  }[];
}

const TestimonialSliderWrapper: React.FC<TestimonialSliderWrapperProps> = ({ title, items }) => {
  return <TestimonialSlider title={title} items={items} />;
};

export default TestimonialSliderWrapper;
