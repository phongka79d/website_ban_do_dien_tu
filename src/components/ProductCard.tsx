"use client";

import React from "react";

interface ProductCardProps {
  name: string;
  price: number;
  oldPrice?: number;
  image: string;
  description: string;
}

/**
 * Standardized ProductCard component with QuizLM aesthetics.
 * Simplified by removing the 'featured' attribute in favor of a Carousel.
 */
export default function ProductCard({
  name,
  price,
  oldPrice,
  image,
  description,
}: ProductCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/20 bg-white/40 p-5 backdrop-blur-md transition-all duration-300 hover:bg-white/60 hover:shadow-xl">
      <div className="relative aspect-square overflow-hidden rounded-xl bg-accent/50">
        <img
          src={image}
          alt={name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {oldPrice && (
          <div className="absolute top-2 left-2 rounded-full bg-primary px-3 py-1 text-xs font-bold text-white">
            -{Math.round(((oldPrice - price) / oldPrice) * 100)}%
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-col gap-2">
        <h3 className="line-clamp-1 text-lg font-bold text-slate-900 group-hover:text-primary transition-colors">
          {name}
        </h3>
        <p className="line-clamp-2 text-sm text-slate-600">
          {description}
        </p>

        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-xl font-black text-primary">
            {price.toLocaleString("vi-VN")}₫
          </span>
          {oldPrice && (
            <span className="text-sm text-slate-400 line-through">
              {oldPrice.toLocaleString("vi-VN")}₫
            </span>
          )}
        </div>

        <button className="mt-4 w-full rounded-full bg-secondary py-2 text-sm font-bold text-white transition-all hover:bg-primary active:scale-95">
          Khám phá ngay
        </button>
      </div>
    </div>
  );
}
