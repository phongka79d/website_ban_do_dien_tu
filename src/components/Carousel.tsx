"use client";

import React, { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Banner } from "@/types/database";
import Link from "next/link";

interface CarouselProps {
  banners: Banner[];
}

export default function Carousel({ banners }: CarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 5000, stopOnInteraction: false, stopOnMouseEnter: true }),
  ]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((index: number) => emblaApi && emblaApi.scrollTo(index), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi, onSelect]);

  if (banners.length === 0) return null;

  return (
    <div
      className="group flex flex-col gap-4 w-full"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="relative w-full overflow-hidden rounded-[40px] shadow-2xl">
        {/* Main Carousel */}
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex">
            {banners.map((banner) => (
              <div
                key={banner.id}
                className={`relative min-w-full h-[380px] md:h-[420px] overflow-hidden ${banner.bg_color || "bg-[#1a237e]"}`}
              >
                <div className="relative z-10 flex h-full flex-col md:flex-row">
                  {/* Left Side: Content */}
                  <div className="flex h-full w-full flex-col justify-center px-8 md:w-1/2 md:pl-20 md:pr-10 lg:pl-32">
                    <h2 className="text-4xl font-extrabold tracking-tight text-white md:text-5xl lg:text-6xl">
                      {banner.title.split(' ').map((word, i) => (
                        <span key={i} className="block">{word}</span>
                      ))}
                    </h2>
                    <p className="mt-4 text-base font-medium text-white/80 md:text-lg">
                      {banner.subtitle}
                    </p>
                    {banner.target_url && (
                      <div className="mt-8">
                        <Link
                          href={banner.target_url}
                          className="inline-flex items-center rounded-full bg-white px-10 py-4 text-lg font-bold text-[#1a237e] transition-all hover:scale-105 hover:shadow-xl active:scale-95"
                        >
                          Xem chi tiết
                        </Link>
                      </div>
                    )}
                  </div>

                  {/* Right Side: Image */}
                  <div className="relative flex h-full w-full items-center justify-center p-8 md:w-1/2">
                    <div className="relative h-64 w-64 transform transition-transform duration-1000 group-hover:scale-105 md:h-[320px] md:w-[320px]">
                      <img
                        src={banner.image_url}
                        alt={banner.title}
                        className="h-full w-full object-contain filter drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Buttons */}
        {banners.length > 1 && (
          <>
            <button
              onClick={scrollPrev}
              className="absolute left-6 top-1/2 z-30 -translate-y-1/2 rounded-full bg-white/10 backdrop-blur-md p-3 text-white opacity-0 transition-all hover:bg-white/20 active:scale-90 group-hover:opacity-100"
            >
              <ChevronLeft size={24} strokeWidth={3} />
            </button>
            <button
              onClick={scrollNext}
              className="absolute right-6 top-1/2 z-30 -translate-y-1/2 rounded-full bg-white/10 backdrop-blur-md p-3 text-white opacity-0 transition-all hover:bg-white/20 active:scale-90 group-hover:opacity-100"
            >
              <ChevronRight size={24} strokeWidth={3} />
            </button>
          </>
        )}
      </div>

      {/* Tabs & Progress Bars (CellphoneS Style) */}
      {banners.length > 1 && (
        <div className="flex w-full overflow-x-auto no-scrollbar gap-2 px-2 pb-2">
          {banners.map((banner, i) => (
            <button
              key={banner.id}
              onClick={() => scrollTo(i)}
              className={`relative flex-1 min-w-[120px] px-4 py-3 rounded-xl transition-all ${selectedIndex === i
                  ? "bg-white/5 shadow-[0_4px_12px_rgba(0,0,0,0.1)]"
                  : "hover:bg-white/5 opacity-60"
                }`}
            >
              <span className={`text-xs font-bold whitespace-nowrap uppercase tracking-wider ${selectedIndex === i ? "text-[#1a237e]" : "text-slate-500"
                }`}>
                {banner.title.length > 15 ? banner.title.substring(0, 15) + "..." : banner.title}
              </span>

              {/* Progress Bar Container */}
              <div className="absolute bottom-0 left-0 w-full h-[3px] bg-slate-200">
                {selectedIndex === i && (
                  <div
                    key={selectedIndex}
                    className={`h-full bg-red-600 animate-progress ${isPaused ? "pause-animation" : ""}`}
                  />
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
