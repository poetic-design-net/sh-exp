"use client";

import Link from "next/link";
import { Product } from "@/types/product";
import { Card } from "@/components/ui/card";
import { formatPrice, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";
import { useRef } from "react";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, FreeMode, Mousewheel } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/free-mode';

interface ProductGridProps {
  products: Product[];
  className?: string;
}

export default function ProductGrid({ products, className }: ProductGridProps) {
  const navigationPrevRef = useRef<HTMLButtonElement>(null);
  const navigationNextRef = useRef<HTMLButtonElement>(null);

  return (
    <div className="relative space-y-4 mt-8">
      <div className="absolute right-12 -top-20 flex gap-2 z-10">
        <Button
          variant="outline"
          size="icon"
          ref={navigationPrevRef}
          className="h-14 w-14 rounded-full bg-white hover:bg-gray-100 transition-all swiper-button-disabled:opacity-50 swiper-button-disabled:cursor-not-allowed"
        >
          <ArrowLeftIcon className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          ref={navigationNextRef}
          className="h-14 w-14 rounded-full bg-white hover:bg-gray-100 transition-all swiper-button-disabled:opacity-50 swiper-button-disabled:cursor-not-allowed"
        >
          <ArrowRightIcon className="h-4 w-4" />
        </Button>
      </div>

      <div className="relative -mx-4">
        <Swiper
          modules={[Navigation, FreeMode, Mousewheel]}
          spaceBetween={16}
          slidesPerView={4}
          freeMode={{
            enabled: true,
            momentum: true,
            momentumRatio: 0.25,
            momentumVelocityRatio: 0.5
          }}
          mousewheel={{
            forceToAxis: true,
            sensitivity: 1
          }}
          navigation={{
            prevEl: navigationPrevRef.current,
            nextEl: navigationNextRef.current,
          }}
          breakpoints={{
            320: {
              slidesPerView: 1,
              spaceBetween: 16
            },
            640: {
              slidesPerView: 2,
              spaceBetween: 16
            },
            768: {
              slidesPerView: 3,
              spaceBetween: 16
            },
            1024: {
              slidesPerView: 4,
              spaceBetween: 16
            }
          }}
          onBeforeInit={(swiper) => {
            // @ts-ignore
            swiper.params.navigation.prevEl = navigationPrevRef.current;
            // @ts-ignore
            swiper.params.navigation.nextEl = navigationNextRef.current;
          }}
          className={cn("px-4 py-1 select-none cursor-grab active:cursor-grabbing min-h-[450px]", className)}
        >
          {products.map((product) => (
            <SwiperSlide key={product.id} className="min-w-[250px] min-h-[450px]">
              <Link href={`/products/${product.slug}`} className="block h-full">
                <Card className="overflow-hidden h-full hover:shadow-lg transition-shadow">
                  <div className="relative aspect-square">
                    {product.images[0] ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="absolute inset-0 w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "/static/assets/fallback-image.png";
                        }}
                      />
                    ) : (
                      <img
                        src="/static/assets/fallback-image.png"
                        alt="Placeholder"
                        className="absolute inset-0 w-full h-full object-cover blur-3xl opacity-50"
                      />
                    )}
                    {product.isSubscription && (
                      <div className="absolute top-2 right-2 bg-primary text-primary-foreground px-2 py-1 rounded-md text-xs font-medium">
                        Abo
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-4 break-words hyphens-auto">
                      {product.name}
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-lg">
                          {formatPrice(product.price)}
                        </span>
                        {product.stock <= 5 && product.stock > 0 && (
                          <span className="text-sm text-orange-500">
                            Nur noch {product.stock}
                          </span>
                        )}
                      </div>
                      {product.isSubscription && product.subscription && (
                        <div className="text-sm text-muted-foreground">
                          {product.subscription.period === 'month' ? 'Monatlich' : 
                           product.subscription.period === 'year' ? 'Jährlich' : 
                           `Alle ${product.subscription.period}`}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              </Link>
            </SwiperSlide>
          ))}
        </Swiper>
        <div className="absolute right-0 top-0 bottom-0 w-32 pointer-events-none bg-gradient-to-l from-white via-white to-transparent" />
      </div>
    </div>
  );
}
