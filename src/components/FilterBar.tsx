"use client";

import React, { useRef, useState, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Button } from "./ui/Button";
import { cn } from "@/utils/cn";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { SORT_OPTIONS } from "@/utils/productSort";

/**
 * Client-side FilterBar that updates URL search params.
 * Now with interactive scroll arrows for mobile overflow.
 */
export default function FilterBar() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  const activeValue = searchParams.get("filter") || "all";

  // Function to check scroll position and toggle arrows
  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftArrow(scrollLeft > 10);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, []);

  const handleScroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = direction === "left" ? -200 : 200;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const handleFilterClick = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (value === "all") {
      params.delete("filter");
    } else {
      params.set("filter", value);
    }
    
    // Reset page if filtering
    params.delete("page");
    replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="relative group/filter -mx-4">
      {/* Left Arrow Button */}
      {showLeftArrow && (
        <button
          onClick={() => handleScroll("left")}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center bg-white/90 backdrop-blur-md rounded-full shadow-lg border border-slate-100 text-slate-800 transition-all hover:bg-white active:scale-95"
          aria-label="Scroll left"
        >
          <ChevronLeft size={24} />
          <div className="absolute left-full top-0 bottom-0 w-8 bg-gradient-to-r from-white/60 to-transparent pointer-events-none" />
        </button>
      )}

      {/* Main Scroll Container */}
      <div 
        ref={scrollRef}
        onScroll={checkScroll}
        className="flex flex-nowrap gap-3 items-center overflow-x-auto overflow-y-clip py-8 px-8 no-scrollbar scroll-smooth"
      >
        {SORT_OPTIONS.map((option) => {
          const isActive = activeValue === option.value;
          return (
            <Button
              key={option.value}
              variant={isActive ? "primary" : "soft"}
              size="sm"
              radius="full"
              onClick={() => handleFilterClick(option.value)}
              className={cn(
                "whitespace-nowrap px-6 border-2 transition-all shrink-0",
                isActive ? "border-primary shadow-md" : "border-transparent"
              )}
            >
              {option.name}
            </Button>
          );
        })}
      </div>

      {/* Right Arrow Button */}
      {showRightArrow && (
        <button
          onClick={() => handleScroll("right")}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center bg-white/90 backdrop-blur-md rounded-full shadow-lg border border-slate-100 text-slate-800 transition-all hover:bg-white active:scale-95"
          aria-label="Scroll right"
        >
          <ChevronRight size={24} />
          <div className="absolute right-full top-0 bottom-0 w-8 bg-gradient-to-l from-white/60 to-transparent pointer-events-none" />
        </button>
      )}
    </div>
  );
}
