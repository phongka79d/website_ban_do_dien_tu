"use client";

import React, { useEffect, useRef, useState, Suspense } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Banner } from "@/types/database";
import { Button, buttonVariants } from "./ui/Button";
import { cn } from "@/utils/cn";
import { ProductImage } from "./common/ProductImage";

const AUTOPLAY_DELAY = 5000;

interface CarouselProps {
  banners: Banner[];
}

/**
 * ARCHITECTURAL CAROUSEL (Attempt 4.22)
 * - Optimized for Next.js 16 Activity/Keep-Alive with Suspense.
 * - Disables prefetching (prefetch={false}) to avoid router initialization loops.
 * - Uses native scroll-snap for maximum durability during restoration.
 */
export default function Carousel({ banners }: CarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const totalBanners = banners.length;

  const handleScroll = () => {
    const container = containerRef.current;
    if (!container) return;
    const slideWidth = container.offsetWidth;
    if (slideWidth === 0) return;
    const newIndex = Math.round(container.scrollLeft / slideWidth);
    if (newIndex !== selectedIndex) {
      setSelectedIndex(newIndex);
    }
  };

  const scrollTo = (index: number) => {
    const container = containerRef.current;
    if (!container) return;
    const normalizedIndex = (index + totalBanners) % totalBanners;
    const slideWidth = container.offsetWidth;
    container.scrollTo({ left: slideWidth * normalizedIndex, behavior: "smooth" });
  };

  useEffect(() => {
    if (totalBanners <= 1 || isPaused) return;

    const timer = setInterval(() => {
      const container = containerRef.current;
      if (container && container.offsetParent !== null) {
        const slideWidth = container.offsetWidth;
        const currentIndex = Math.round(container.scrollLeft / slideWidth);
        const nextIndex = (currentIndex + 1) % totalBanners;
        container.scrollTo({ left: slideWidth * nextIndex, behavior: "smooth" });
      }
    }, AUTOPLAY_DELAY);

    return () => clearInterval(timer);
  }, [totalBanners, isPaused]);

  if (banners.length === 0) return null;

  return (
    <div
      className="group flex flex-col gap-4 w-full"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      <div className="relative w-full overflow-hidden rounded-[30px] md:rounded-[40px] shadow-lg md:shadow-2xl">
        <div
          ref={containerRef}
          onScroll={handleScroll}
          className="flex w-full overflow-x-auto snap-x snap-mandatory no-scrollbar touch-pan-x scroll-smooth"
          style={{ scrollBehavior: "auto" }}
        >
          {banners.map((banner) => (
            <div
              key={banner.id}
              className={`relative w-full shrink-0 h-[360px] md:h-[420px] overflow-hidden snap-center snap-always ${banner.bg_color || "bg-[#1a237e]"}`}
            >
              <div className="relative z-10 flex h-full flex-col md:flex-row">
                {/* Content Side (Left) - Balanced spacing */}
                <div className="flex h-[40%] md:h-full w-full flex-col justify-center px-8 md:px-12 md:w-1/2 lg:pl-24">
                  <h2 className="text-xl md:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-[1.2]">
                    {banner.title}
                  </h2>
                  <p className="mt-2 text-[10px] md:text-sm font-medium text-white/60 max-w-[240px] md:max-w-md line-clamp-2 md:line-clamp-none">
                    {banner.subtitle}
                  </p>

                  {banner.target_url && (
                    <div className="mt-4 md:mt-8">
                      <Link
                        href={banner.target_url}
                        prefetch={false}
                        className={cn(
                          buttonVariants({ variant: "soft", size: "sm", radius: "xl" }),
                          "md:py-4 md:px-8 bg-white/10 backdrop-blur-xl border border-white/20 text-white hover:bg-white/20 hover:border-white/30"
                        )}
                      >
                        <span className="font-bold">Xem</span>
                        <ChevronRight size={14} className="md:size-4 transition-transform group-hover/btn:translate-x-1" />
                      </Link>
                    </div>
                  )}
                </div>

                {/* Image Side (Right) - Occupies 60% on mobile */}
                <div className="relative flex h-[60%] md:h-full w-full md:w-1/2 bg-black/10 overflow-hidden">
                  <div className="relative h-full w-full">
                    <ProductImage
                      src={banner.image_url}
                      alt={banner.title}
                      width={800}
                      height={500}
                      priority={true}
                      className="h-full w-full object-cover filter drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] transform scale-100 group-hover:scale-110 transition-transform duration-1000"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Dots indicators for Mobile only */}
        {banners.length > 1 && (
          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5 md:hidden z-30">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => scrollTo(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  selectedIndex === i ? "w-6 bg-white" : "w-1.5 bg-white/40"
                }`}
              />
            ))}
          </div>
        )}

        {banners.length > 1 && (
          <>
            <Button
              variant="soft"
              size="icon"
              radius="full"
              onClick={() => scrollTo(selectedIndex - 1)}
              className="absolute left-6 top-1/2 z-30 hidden md:flex -translate-y-1/2 bg-white/5 backdrop-blur-md border border-white/10 text-white opacity-0 transition-all hover:bg-white/20 group-hover:opacity-100"
            >
              <ChevronLeft size={24} strokeWidth={2.5} />
            </Button>
            <Button
              variant="soft"
              size="icon"
              radius="full"
              onClick={() => scrollTo(selectedIndex + 1)}
              className="absolute right-6 top-1/2 z-30 hidden md:flex -translate-y-1/2 bg-white/5 backdrop-blur-md border border-white/10 text-white opacity-0 transition-all hover:bg-white/20 group-hover:opacity-100"
            >
              <ChevronRight size={24} strokeWidth={2.5} />
            </Button>
          </>
        )}
      </div>

      {/* Tabs indicators for PC only */}
      {banners.length > 1 && (
        <div className="hidden md:flex w-full overflow-x-auto no-scrollbar gap-2 px-2 pb-2">
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

              <div className="absolute bottom-0 left-0 w-full h-[3px] bg-slate-200">
                {selectedIndex === i && (
                  <div
                    key={`progress-${selectedIndex}`}
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
