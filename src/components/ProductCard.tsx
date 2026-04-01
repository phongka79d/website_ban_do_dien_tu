"use client";

import React, { useState, useEffect } from "react";
import { Star, Heart } from "lucide-react";
import { Product } from "@/types/database";
import { ProductImage } from "./common/ProductImage";
import Link from "next/link";
import { Card } from "./ui/Card";
import { Button } from "./ui/Button";
import { useWishlistStore } from "@/store/useWishlistStore";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

interface ProductCardProps {
  product: Product;
}

/**
 * Refined ProductCard component to strictly match the style.
 */
export default function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();
  const { isInWishlist, toggleWishlist, userId } = useWishlistStore();
  const [hasMounted, setHasMounted] = useState(false);
  const [heartPos, setHeartPos] = useState({ left: 0, top: 0 });
  const [isAnimating, setIsAnimating] = useState(false);
  const heartRef = React.useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const {
    id,
    name,
    price,
    original_price,
    discount_percentage,
    image_url,
    has_installment_0,
    specs,
    rating,
  } = product;

  // Tránh Hydration Mismatch bằng cách chỉ lấy trạng thái thật sau khi mount xong
  const isWishlisted = hasMounted ? isInWishlist(id) : false;

  // Get first 3 tech specs for tags
  const specTags = specs ? Object.entries(specs).slice(0, 3) : [];

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!userId) {
      router.push("/login?error=auth_required");
      return;
    }

    const wasWishlisted = isWishlisted;
    await toggleWishlist(product);

    // If adding to wishlist, trigger fly animation
    if (!wasWishlisted) {
      if (heartRef.current) {
      const rect = heartRef.current.getBoundingClientRect();
      setHeartPos({ left: rect.left, top: rect.top });
    }

    setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 800);
    }
  };

  return (
    <div className="group h-full relative">
      <Card
        variant="elevated"
        radius="xl"
        hover="none" // Custom hover on mobile to match premium feel
        className="relative flex flex-col h-full overflow-hidden border-slate-100 p-2 md:p-3 bg-white transition-all duration-300 hover:shadow-xl active:scale-[0.98]"
      >
        <Link href={`/products/${product.id}`} prefetch={false} className="block flex-1">
          {/* Badges Overlay */}
          <div className="absolute top-0 left-0 right-0 z-10 flex justify-between p-0 pointer-events-none">
            {discount_percentage && discount_percentage > 0 && (
              <div className="relative">
                <div className="bg-red-600 text-white text-[10px] md:text-[12px] font-black px-2 py-1 md:px-3 md:py-1.5 rounded-br-xl shadow-sm uppercase tracking-tighter relative z-10">
                  Giảm {discount_percentage}%
                </div>
                {/* Ribbon Fold shadow */}
                <div className="absolute top-[calc(100%-4px)] left-0 border-l-[4px] border-l-transparent border-t-[4px] border-t-red-800 z-0"></div>
              </div>
            )}
            {has_installment_0 && (
              <div className="bg-[#e2eeff] text-[#0060ff] text-[9px] md:text-[11px] font-bold px-2 py-1 md:px-3 md:py-1.5 rounded-bl-2xl">
                Trả góp 0%
              </div>
            )}
          </div>

          {/* Image Container */}
          <div className="relative aspect-square w-full mb-3 flex items-center justify-center p-2 md:p-4">
            <ProductImage
              src={image_url}
              alt={name}
              width={300}
              height={300}
              className="max-h-[95%] max-w-[95%] object-contain transition-transform duration-500 group-hover:scale-110"
            />
          </div>

          {/* Improved Tech Specs - Tag Style */}
          <div className="flex flex-wrap gap-1.5 mb-3">
             {specTags.map(([key, value], idx) => (
               <div 
                 key={idx} 
                 className="bg-slate-100 text-slate-600 text-[10px] md:text-[11px] font-bold px-2 py-1 rounded-md transition-all duration-300 group-hover:bg-rose-50 group-hover:text-rose-600 border border-transparent group-hover:border-rose-100"
               >
                 {String(value)}
               </div>
             ))}
          </div>

          {/* Content */}
          <div className="flex flex-col flex-1 gap-2 px-1">
            <h3 className="line-clamp-2 text-[13px] md:text-[15px] font-bold text-slate-900 leading-snug h-[36px] md:h-[45px]">
              {name}
            </h3>

            {/* Pricing Section */}
            <div className="flex items-center gap-2">
              <span className="text-[15px] md:text-[18px] font-black text-red-600">
                {price.toLocaleString("vi-VN")}₫
              </span>
              {original_price && (
                <span className="text-[11px] md:text-[13px] text-slate-400 line-through font-medium opacity-70">
                  {original_price.toLocaleString("vi-VN")}₫
                </span>
              )}
            </div>

            {/* Installment Detail Box - Premium Style */}
            {has_installment_0 && (
              <div className="bg-[#f7f2ff] text-[#8e44e1] text-[10px] md:text-[11px] font-bold px-2 py-1.5 rounded-lg border border-[#f0e5ff]">
                Trả góp 0% lãi suất, tối đa 12 tháng
              </div>
            )}
          </div>
        </Link>

        {/* Improved Footer: Rating & Favorite */}
        <div className="mt-auto pt-4 flex items-center justify-between gap-2 px-1">
          <div className="flex items-center gap-1 shrink-0 bg-slate-50 px-2 py-1 rounded-full border border-slate-100">
            <Star className="fill-yellow-400 text-yellow-400" size={12} />
            <span className="text-[12px] font-black text-slate-700">{rating || "4.9"}</span>
          </div>

          <button
            ref={heartRef}
            onClick={handleToggleWishlist}
            className={`flex items-center gap-1.5 font-bold text-[12px] transition-all active:scale-90 ${isWishlisted ? "text-red-500" : "text-blue-500 hover:text-blue-600"
              }`}
          >
            <Heart size={18} className={isWishlisted ? "fill-red-500 text-red-500" : "text-blue-500"} />
            <span className="inline-block">{isWishlisted ? "Đã thích" : "Yêu thích"}</span>
          </button>
        </div>
      </Card>

      {/* Fly Animation Heart */}
      <AnimatePresence>
        {isAnimating && (
          <motion.div
            initial={{
              position: "fixed",
              left: heartPos.left,
              top: heartPos.top,
              scale: 1,
              opacity: 1,
              zIndex: 9999
            }}
            animate={{
              left: document.getElementById("user-menu-target")?.getBoundingClientRect().left || "50%",
              top: document.getElementById("user-menu-target")?.getBoundingClientRect().top || 20,
              scale: 0.3,
              opacity: 0,
            }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="pointer-events-none"
          >
            <Heart size={24} className="fill-red-500 text-red-500" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
