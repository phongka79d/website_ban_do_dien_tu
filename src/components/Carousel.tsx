"use client";

import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface BannerItem {
  id: number;
  title: string;
  subtitle: string;
  image: string;
  color: string;
}

const BANNERS: BannerItem[] = [
  {
    id: 1,
    title: "iPhone 15 Pro Max",
    subtitle: "Titanium siêu bền. Chip A17 Pro đỉnh cao.",
    image: "https://cdn2.cellphones.com.vn/insecure/rs:fill:690:300/q:90/plain/https://cellphones.com.vn/media/catalog/product/i/p/iphone-15-pro-max_3.png",
    color: "bg-gradient-to-r from-slate-900 to-slate-800",
  },
  {
    id: 2,
    title: "Galaxy S24 Series",
    subtitle: "Quyền năng AI. Ưu đãi đến 10 triệu đồng.",
    image: "https://cdn2.cellphones.com.vn/insecure/rs:fill:690:300/q:90/plain/https://cellphones.com.vn/media/catalog/product/s/s/ss-s24-ultra-xam-2_1.png",
    color: "bg-gradient-to-r from-indigo-900 to-blue-900",
  },
  {
    id: 3,
    title: "Mở bán MacBook M3",
    subtitle: "Hiệu năng bứt phá. Trẻ trung sáng tạo.",
    image: "https://cdn2.cellphones.com.vn/insecure/rs:fill:690:300/q:90/plain/https://cellphones.com.vn/media/catalog/product/m/a/macbook-air-m3-13-inch-silver.png",
    color: "bg-gradient-to-r from-secondary/80 to-primary/80",
  },
];

export default function Carousel() {
  const [current, setCurrent] = useState(0);

  const next = () => setCurrent((curr) => (curr === BANNERS.length - 1 ? 0 : curr + 1));
  const prev = () => setCurrent((curr) => (curr === 0 ? BANNERS.length - 1 : curr - 1));

  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [current]);

  return (
    <div className="group relative w-full overflow-hidden rounded-3xl border border-white/20 shadow-2xl">
      <div 
        className="flex transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {BANNERS.map((banner) => (
          <div 
            key={banner.id} 
            className={`relative min-w-full h-80 md:h-[400px] flex items-center px-12 md:px-24 ${banner.color}`}
          >
            {/* Content */}
            <div className="z-10 w-full md:w-1/2 space-y-4">
              <h2 className="text-4xl md:text-6xl font-black text-white leading-tight">
                {banner.title}
              </h2>
              <p className="text-lg text-white/80 font-medium">
                {banner.subtitle}
              </p>
              <button className="mt-6 rounded-full bg-white px-8 py-3 font-bold text-slate-900 transition-all hover:scale-105 active:scale-95 shadow-lg">
                Xem chi tiết
              </button>
            </div>

            {/* Image (Right Side) */}
            <div className="absolute right-0 top-0 h-full w-full md:w-1/2 flex items-center justify-end p-8 md:p-12">
               <div className="relative h-64 w-64 md:h-80 md:w-80 transition-transform duration-700 hover:scale-110">
                  <img src={banner.image} alt={banner.title} className="h-full w-full object-contain filter drop-shadow-2xl" />
                  {/* Decorative Glow */}
                  <div className="absolute inset-0 bg-primary/20 blur-3xl -z-10 rounded-full"></div>
               </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Buttons */}
      <button 
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 backdrop-blur-md p-2 text-white opacity-0 transition-all hover:bg-white/20 group-hover:opacity-100"
      >
        <ChevronLeft size={32} />
      </button>
      <button 
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 backdrop-blur-md p-2 text-white opacity-0 transition-all hover:bg-white/20 group-hover:opacity-100"
      >
        <ChevronRight size={32} />
      </button>

      {/* Indicators */}
      <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2">
        {BANNERS.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-2 rounded-full transition-all ${
              current === i ? "w-8 bg-white" : "w-2 bg-white/40"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
