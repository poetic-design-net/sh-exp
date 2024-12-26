'use client';

import { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Keyboard, Mousewheel, FreeMode } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import Image from 'next/image';
import 'swiper/css';
import 'swiper/css/free-mode';

const services = [
  {
    id: 1,
    number: '01.',
    title: 'Transformation & Heilung',
    description: 'Entdecke den Weg zur persönlichen Transformation und ganzheitlichen Heilung durch bewährte Methoden und tiefgreifende Praktiken.',
    image: '/static/images/intensiventbildung_ready.webp'
  },
  {
    id: 2,
    number: '02.',
    title: 'Krypto & Web3',
    description: 'Tauche ein in die Welt der dezentralen Technologien und entdecke die transformative Kraft der Blockchain-Revolution.'
  },
  {
    id: 3,
    number: '03.',
    title: 'Spiritualität',
    description: 'Erkunde spirituelle Praktiken und Weisheitslehren für ein tieferes Verständnis deines wahren Selbst.'
  },
  {
    id: 4,
    number: '04.',
    title: 'Philosophie & Bewusstsein',
    description: 'Erweitere dein Bewusstsein durch philosophische Erkenntnisse und zeitlose Weisheiten.'
  }
];

export default function ServiceCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [swiper, setSwiper] = useState<SwiperType | null>(null);

  const goToSlide = (index: number) => {
    swiper?.slideTo(index);
  };

  return (
    <section className="relative overflow-hidden transition-colors duration-200 py-12">
      <div className="absolute top-0 left-0 w-1/3 h-full bg-white dark:bg-cyan-950 z-10" />
      
      <div className="container relative mx-auto px-8 md:px-24">
        <div className="flex flex-wrap -m-4">
          <div className="w-full lg:w-1/3 p-4 relative z-20 ">
            <div className="flex flex-col justify-end items-start h-full py-12">
              <h1 className="tracking-tight font-heading font-semibold text-7xl mb-4 bg-gradient-to-br from-slate-400 via-slate-600 to-slate-800  dark:from-cyan-100 dark:via-cyan-400 dark:to-cyan-700 text-transparent bg-clip-text">
                Entdecke <span className="font-semibold">dein volles Potenzial</span>
              </h1>
              <p className="tracking-tight text-xl leading-relaxed text-gray-700 dark:text-gray-300 mb-6 max-w-md">
                Wir begleiten dich auf deiner Reise zu persönlichem Wachstum, 
                spiritueller Entwicklung und ganzheitlicher Transformation.
              </p>
              <div className="flex items-center gap-2 mb-8">
                {services.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-500 ease-out ${
                      activeIndex === index 
                        ? 'bg-cyan-400 dark:bg-white w-8' 
                        : 'bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600'
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
              <a 
                href="#" 
                className="border border-gray-900 hover:border-current mt-auto dark:bg-white h-14 text-gray-900  dark:text-gray-900  hover:text-white rounded-full px-5 py-3 inline-flex items-center justify-center gap-2 tracking-tight hover:bg-cyan-600 dark:hover:bg-cyan-500 focus:bg-cyan-500 focus:ring-4 focus:ring-orange-200 dark:focus:ring-cyan-800 transition duration-200"
              >
                <span className="text-lg font-bold tracking-tight">
                  Entdecke alle Angebote
                </span>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="16" 
                  height="16" 
                  viewBox="0 0 16 16" 
                  fill="none"
                >
                  <path 
                    d="M14 6.66669H7.33333C4.38781 6.66669 2 9.0545 2 12V13.3334M14 6.66669L10 10.6667M14 6.66669L10 2.66669" 
                    stroke="currentColor"
                    strokeWidth="1.5" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                </svg>
              </a>
            </div>
          </div>
          <div className="w-full lg:w-2/3 p-4">
            <div className="relative" style={{ height: '700px' }}>
              <div className="absolute left-0 top-0 h-full w-full">
                <Swiper
                  modules={[Keyboard, Mousewheel, FreeMode]}
                  slidesPerView="auto"
                  keyboard={{ enabled: true }}
                  mousewheel={{
                    forceToAxis: true,
                    sensitivity: 0.5,
                    thresholdDelta: 50,
                    thresholdTime: 50
                  }}
                  freeMode={{
                    enabled: true,
                    momentum: true,
                    momentumRatio: 0.25,
                    momentumVelocityRatio: 0.5
                  }}
                  onSwiper={setSwiper}
                  onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
                  className="h-full !overflow-visible"
                  slideToClickedSlide={true}
                  centeredSlides={false}
                  initialSlide={0}
                  spaceBetween={10}
                  allowTouchMove={true}
                  watchSlidesProgress={true}
                  slidesOffsetBefore={100}
                  slidesOffsetAfter={100}
                  loop={false}
                >
                  {services.map((service, index) => (
                    <SwiperSlide 
                      key={service.id} 
                      style={{ width: '400px' }}
                    >
                      <div 
                        className={`h-full border rounded-3xl border-gray-200 dark:border-cyan-950 p-12 transition-all duration-500 ease-out ${
                          activeIndex === index 
                            ? 'scale-[1.0] shadow-xl bg-white dark:bg-cyan-900  z-10 relative' 
                            : 'scale-95 opacity-70 bg-gray-50 dark:bg-gray-900/50'
                        }`}
                      >
                        <div className="flex flex-col justify-between h-full">
                          <div className="flex items-center justify-between">
                            <p className={`tracking-tight font-semibold transition-all duration-500 ease-out ${
                              activeIndex === index ? 'text-black dark:text-white scale-110' : 'text-gray-500 dark:text-gray-400'
                            }`}>
                              {service.number}
                            </p>
                            <a 
                              href="#" 
                              className="text-coolGray-50 dark:text-gray-100 bg-slate-400 p-4 rounded-full hover:text-gray-800 dark:hover:text-gray-200 transition duration-200"
                            >
                              <svg 
                                xmlns="http://www.w3.org/2000/svg" 
                                width="16" 
                                height="16" 
                                viewBox="0 0 16 16" 
                                fill="none"
                              >
                                <path 
                                  d="M14 6.66699H7.33333C4.38781 6.66699 2 9.05481 2 12.0003V13.3337M14 6.66699L10 10.667M14 6.66699L10 2.66699" 
                                  stroke="currentColor" 
                                  strokeWidth="1.5" 
                                  strokeLinecap="round" 
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </a>
                          </div>
                          {service.image && (
                            <div className="relative w-full h-48 my-6 rounded-lg overflow-hidden">
                              <Image
                                src={service.image}
                                alt={service.title}
                                fill
                                className="object-cover"
                                priority
                                sizes="(max-width: 400px) 100vw, 400px"
                              />
                            </div>
                          )}
                          <div>
                            <h2 className={`font-heading tracking-tight text-2xl font-semibold mb-4 transition-all duration-500 ease-out ${
                              activeIndex === index ? 'text-black dark:text-white scale-105' : 'text-gray-700 dark:text-gray-300'
                            }`}>
                              {service.title}
                            </h2>
                            <p className="tracking-tight text-gray-700 dark:text-gray-300">
                              {service.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
