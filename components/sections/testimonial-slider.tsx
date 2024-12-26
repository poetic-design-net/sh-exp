import React, { useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface TestimonialSliderProps {
  title: string;
  items: {
    name: string;
    quote: string;
    image: string;
  }[];
}

const TestimonialSlider: React.FC<TestimonialSliderProps> = ({
  title,
  items,
}) => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [direction, setDirection] = useState(0); // -1 for left, 1 for right
  const [imageError, setImageError] = useState<Record<number, boolean>>({});

  const getFallbackImage = (index: number) => {
    // Use fallback-image.png only for the first testimonial
    if (index === 0) {
      return '/static/assets/fallback-image.png';
    }
    // Use numbered avatars for all other testimonials
    const avatarNumber = (index % 5) + 1;
    return `/avatars/${avatarNumber.toString().padStart(2, '0')}.png`;
  };

  const handlePrevTestimonial = () => {
    setDirection(-1);
    setCurrentTestimonial((prev) => 
      prev === 0 ? items.length - 1 : prev - 1
    );
  };

  const handleNextTestimonial = () => {
    setDirection(1);
    setCurrentTestimonial((prev) => 
      prev === items.length - 1 ? 0 : prev + 1
    );
  };

  return (
    <div className="w-full flex flex-col xl:flex-row justify-between items-center xl:items-end gap-10 xl:gap-40">
      {/* Satisfied Clients */}
      <div className="w-full xl:w-auto flex flex-col justify-start items-center xl:items-start gap-12">
        <h2 className="text-cyan-950 text-5xl xl:text-7xl font-bold  leading-10 text-center xl:text-left">
          {title}
        </h2>
        <div className="flex justify-start items-start gap-3">
          <button 
            onClick={handlePrevTestimonial}
            className="hidden xl:block p-4 bg-cyan-950/50 rounded-full hover:bg-cyan-950/60 transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-cyan-950" />
          </button>
          <button 
            onClick={handleNextTestimonial}
            className="hidden xl:block p-4 bg-cyan-950 rounded-full hover:bg-cyan-950/90 transition-colors"
          >
            <ArrowRight className="w-6 h-6 text-cyan-300" />
          </button>
        </div>
      </div>

      {/* Testimonial Card */}
      <div className="w-full flex flex-col justify-between items-end">
        {/* Dots */}
        <div className="hidden xl:flex w-full justify-end items-center py-4 mb-12 gap-2">
          {items.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setDirection(index > currentTestimonial ? 1 : -1);
                setCurrentTestimonial(index);
              }}
              className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                index === currentTestimonial ? 'bg-cyan-950' : 'bg-cyan-950/30'
              }`}
            />
          ))}
        </div>

        {/* Testimonial Content */}
        <div className="w-full relative min-h-[450px] xl:min-h-[250px]">
          <div 
            key={currentTestimonial}
            className="w-full flex flex-col xl:flex-row justify-start items-center xl:items-start gap-6 py-8"
            style={{
              opacity: 0,
              animation: 'fadeSlide 500ms forwards'
            } as React.CSSProperties}
          >
            <div className="w-48 h-48 flex-shrink-0 relative rounded-full overflow-hidden bg-zinc-300">
              <img
                src={imageError[currentTestimonial] ? getFallbackImage(currentTestimonial) : items[currentTestimonial].image}
                alt={items[currentTestimonial].name}
                className="w-full h-full object-cover"
                onError={() => {
                  setImageError(prev => ({
                    ...prev,
                    [currentTestimonial]: true
                  }));
                }}
              />
            </div>
            <div className="flex-1 flex flex-col justify-start items-center xl:items-start gap-5 max-w-[600px]">
              <h3 className="text-cyan-950 text-3xl xl:text-4xl font-bold capitalize leading-10 text-center xl:text-left">
                {items[currentTestimonial].name}
              </h3>
              <p className="text-cyan-950 text-xl xl:text-2xl leading-tight xl:leading-relaxed text-center xl:text-left">
                {items[currentTestimonial].quote}
              </p>
              {/* Mobile Dots */}
              <div className="xl:hidden w-full flex justify-center items-center py-8 gap-2">
                {items.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setDirection(index > currentTestimonial ? 1 : -1);
                      setCurrentTestimonial(index);
                    }}
                    className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                      index === currentTestimonial ? 'bg-cyan-950' : 'bg-cyan-950/30'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestimonialSlider;
