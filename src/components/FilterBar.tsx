"use client";

import React from "react";

const FILTERS = ["Tất cả", "Sắp tới", "Đang hot", "Khuyến mãi", "Giá tốt"];

/**
 * Minimalist filter bar with pill-shaped buttons.
 */
export default function FilterBar() {
  return (
    <div className="flex flex-wrap gap-3 overflow-x-auto py-4 no-scrollbar">
      {FILTERS.map((filter, index) => (
        <button
          key={filter}
          className={`whitespace-nowrap rounded-full px-6 py-2 text-sm font-semibold transition-all border-2 ${
            index === 0
              ? "bg-primary border-primary text-white"
              : "bg-white/50 border-white/20 text-slate-600 hover:bg-white hover:border-secondary hover:text-secondary"
          }`}
        >
          {filter}
        </button>
      ))}
    </div>
  );
}
