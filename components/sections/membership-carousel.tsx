'use client';

import { useRef } from 'react';
import type { Membership } from '@/types/membership';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, FreeMode, Mousewheel } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/free-mode';

interface MembershipCarouselProps {
  memberships: Membership[];
}

export default function MembershipCarousel({ memberships = [] }: MembershipCarouselProps) {
  const swiperRef = useRef<SwiperType>();

  if (!memberships.length) {
    return null;
  }

  return (
    <section className="py-12 w-full md:py-24 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap -mx-4 items-center mb-8">
          <div className="w-full md:w-1/2 px-4 mb-8 md:mb-0">
            <h1 className="font-heading text-6xl md:text-10xl tracking-tighter">Mitgliedschaften</h1>
          </div>
          <div className="w-full md:w-1/2 px-4">
            <div className="flex items-center justify-end">
              <button 
                onClick={() => swiperRef.current?.slidePrev()}
                className="inline-flex h-16 sm:h-18 w-16 sm:w-18 mr-8 items-center justify-center text-black dark:text-white/90 hover:text-white hover:bg-black border border-black dark:border-white rounded-full transition duration-200"
              >
                <svg width="27" height="27" viewBox="0 0 27 27" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10.7051 7.12817L4.15732 13.6759L10.7051 20.2237" stroke="currentColor" strokeWidth="1.61806" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"></path>
                  <path d="M22.4941 13.6759H4.33949" stroke="currentColor" strokeWidth="1.61806" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"></path>
                </svg>
              </button>
              <button 
                onClick={() => swiperRef.current?.slideNext()}
                className="inline-flex h-16 sm:h-18 w-16 sm:w-18 items-center justify-center dark:text-white/90 hover:text-white hover:bg-black border border-black dark:border-white rounded-full transition duration-200"
              >
                <svg width="27" height="27" viewBox="0 0 27 27" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16.2949 7.12817L22.8427 13.6759L16.2949 20.2237" stroke="currentColor" strokeWidth="1.61806" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"></path>
                  <path d="M4.50586 13.6759H22.6605" stroke="currentColor" strokeWidth="1.61806" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        <div className="relative -mx-4">
          <Swiper
            modules={[Navigation, FreeMode, Mousewheel]}
            spaceBetween={40}
            slidesPerView="auto"
            freeMode={{
              enabled: true,
              momentum: true,
              momentumRatio: 0.25,
              momentumVelocityRatio: 0.5
            }}
            mousewheel={{
              forceToAxis: true,
              sensitivity: 0.5,
              thresholdDelta: 50,
              thresholdTime: 50
            }}
            onBeforeInit={(swiper) => {
              swiperRef.current = swiper;
            }}
            className="!overflow-visible"
          >
            {memberships.map((membership) => (
              <SwiperSlide 
                key={membership.id} 
                className="first:ml-4 !w-[calc(50%-4rem)]"
              >
                <div className="group block">
                  <div className="relative mb-6 rounded-3xl overflow-hidden">
                    <div className="block aspect-video bg-gray-100"></div>
                    <div className="absolute left-0 top-0 h-full w-full group-hover:bg-opacity-10 group-hover:bg-black transition duration-200"></div>
                  </div>
                  <div className="max-w-xs sm:max-w-md">

                    <h4 className="text-3xl sm:text-4xl tracking-tight mb-6">{membership.name}</h4>
                    <p className="max-w-sm mb-6">{membership.description}</p>
                    <ul className="space-y-2">
                      {membership.features?.map((feature, index) => (
                        <li key={index} className="flex items-center text-sm">
                          <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                          </svg>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        <div className="text-center mt-12">
          <a className="group inline-flex items-center leading-none font-medium pb-2 border-b-2 border-black" href="/auth/login">
            <span className="mr-4">Jetzt Mitglied werden</span>
            <span className="group-hover:rotate-45 transform transition duration-100">
              <svg width="11" height="11" viewBox="0 0 11 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9.5 1.5L1.5 9.5" stroke="black" strokeWidth="1.3" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"></path>
                <path d="M9.5 8.83571V1.5H2.16429" stroke="black" strokeWidth="1.3" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"></path>
              </svg>
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
