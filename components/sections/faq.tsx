"use client";

import { useState } from 'react';
import { Plus, Minus, ArrowUpRight } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQProps {
  id?: string;
  title: string;
  subtitle: string;
  faqs: FAQItem[];
  ctaText: string;
  ctaLink: string;
  registerTitle: string;
  registerCtaText: string;
  registerCtaLink: string;
  backgroundImage?: string;
}

export function FAQ({
  id = "faq",
  title,
  subtitle,
  faqs,
  registerTitle,
  registerCtaText,
  registerCtaLink,
  backgroundImage
}: FAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section 
      id={id}
      className="w-full bg-gradient-to-b from-[#68AAC5] via-[#70B3CC] to-[#77BBD7]"
    >
      <div className="max-w-[1440px] mx-auto px-5 md:px-16 lg:px-24 py-10 md:py-16 lg:py-24">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-40">
          {/* Left Column */}
          <div className="flex flex-col gap-6 rounded-3xl">
            <h2 className="text-4xl lg:text-[80px] text-[#153441] font-bold capitalize leading-[1.2] lg:leading-[100px] lg:w-[317px]">{title}</h2>
            <p className="text-xl text-[#153441] leading-6">{subtitle}</p>
          </div>

          {/* Right Column */}
          <div className="flex-1">
            <div className="grid grid-cols-1 gap-0">
              {faqs.map((faq, index) => (
                <div key={index} className="border-b border-[#153441]/30">
                  <button 
                    onClick={() => toggleFAQ(index)}
                    className="w-full text-left py-8"
                  >
                    <div className="flex justify-between items-start">
                      <h3 className="flex-1 text-xl text-[#153441] font-bold leading-6">{faq.question}</h3>
                      <div className="w-6 h-6 flex items-center justify-center transition-transform duration-200">
                        {openIndex === index ? (
                          <Minus className="w-4 h-4 text-[#153441]" />
                        ) : (
                          <Plus className="w-4 h-4 text-[#153441]" />
                        )}
                      </div>
                    </div>
                  </button>
                  <div 
                    className="grid transition-[grid-template-rows] duration-200 ease-in-out"
                    style={{
                      gridTemplateRows: openIndex === index ? '1fr' : '0fr'
                    }}
                  >
                    <div className="overflow-hidden">
                      <p className="text-xl text-[#153441] leading-6 pb-5">{faq.answer}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Registration Section */}
        <div 
          className="w-full h-[392px] mx-auto mt-24 p-10 rounded-3xl flex flex-col lg:flex-row justify-between relative overflow-hidden"
          style={{
            backgroundImage: backgroundImage ? `linear-gradient(to right, rgba(21, 52, 65, 0.8), rgba(21, 52, 65, 0.5)), url(${backgroundImage})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <h3 className="text-2xl lg:text-4xl text-white font-bold  leading-[1.2] lg:leading-[48px] w-full lg:w-6/12">
            {registerTitle}
          </h3>
          <button className="w-full xl:w-auto p-1 bg-cyan-300 rounded-full flex items-center self-end">
            <div className="p-4 bg-cyan-950 rounded-full">
              <ArrowUpRight className="w-6 h-6 text-cyan-300" />
            </div>
            <a href={registerCtaLink} className="flex-1 xl:flex-none px-6 py-4">
              <span className="text-black text-xl font-bold leading-normal">
                {registerCtaText}
              </span>
            </a>
          </button>
        </div>
      </div>
    </section>
  );
}
