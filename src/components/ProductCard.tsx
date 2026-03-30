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
  const [isAnimating, setIsAnimating] = React.useState(false);
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
    promotion_text,
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
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 800);
    }
  };

  return (
    <div className="group h-full relative">
      <Card
        variant="elevated"
        radius="xl"
        hover="scale"
        className="relative flex flex-col h-full overflow-hidden border-slate-100 p-3"
      >
        <Link href={`/products/${product.id}`} prefetch={false} className="block flex-1">
          {/* Badges Overlay */}
          <div className="absolute top-0 left-0 right-0 z-10 flex justify-between p-0 pointer-events-none">
            {discount_percentage && discount_percentage > 0 ? (
              <div className="bg-red-600 text-white text-[11px] font-black px-2 py-1 rounded-br-xl rounded-tl-[19px] uppercase tracking-tighter">
                Giảm {discount_percentage}%
              </div>
            ) : <div />}
            {has_installment_0 && (
              <div className="bg-[#f2f7ff] text-[#4486e1] text-[10px] font-bold px-2 py-1 rounded-bl-xl rounded-tr-[19px]">
                Trả góp 0%
              </div>
            )}
          </div>

          {/* Image Container */}
          <div className="relative aspect-square w-full mb-3 flex items-center justify-center p-2">
            <ProductImage
              src={image_url}
              alt={name}
              width={300}
              height={300}
              className="max-h-[85%] max-w-[85%] object-contain transition-transform duration-500 group-hover:scale-105"
            />
          </div>

          {/* Content */}
          <div className="flex flex-col flex-1 gap-1.5 px-1">
            <h3 className="line-clamp-2 text-[14px] font-bold text-slate-900 leading-[1.4] h-[39.2px]">
              {name}
            </h3>

            {/* Pricing */}
            <div className="flex flex-wrap items-baseline gap-2 mt-1">
              <span className="text-[16px] font-black text-red-600">
                {price.toLocaleString("vi-VN")}₫
              </span>
              {original_price && (
                <span className="text-[12px] text-slate-400 line-through font-medium">
                  {original_price.toLocaleString("vi-VN")}₫
                </span>
              )}
            </div>

            {/* Spec Tags */}
            <div className="flex flex-wrap gap-1 mt-1">
              {specTags.map(([key, value], index) => (
                <span key={index} className="text-[10px] px-2 py-0.5 rounded-md border border-slate-200 text-slate-600 font-medium bg-slate-50/50">
                  {String(value)}
                </span>
              ))}
            </div>

            {/* Promotion Bar */}
            {promotion_text && (
              <div className="mt-2 rounded-md bg-[#f2f7ff] px-2 py-1.5 border border-[#e5f0ff]">
                <p className="text-[10px] text-[#4486e1] font-bold line-clamp-1">
                  {promotion_text}
                </p>
              </div>
            )}

            {/* Installment Detail Box */}
            {has_installment_0 && (
              <div className="mt-1 rounded-md bg-slate-50 px-2 py-2 border border-slate-100">
                <p className="text-[10px] text-slate-600 leading-tight">
                  Trả góp 0% - 0đ phụ thu - 0đ trả trước - kỳ hạn đến 6 tháng
                </p>
              </div>
            )}
          </div>
        </Link>

        {/* Footer info: Rating & Favorite row (outside Link but inside Card) */}
        <div className="mt-auto pt-3 flex items-center justify-between border-t border-slate-50 gap-2 px-1">
          <div className="flex items-center gap-0.5 shrink-0">
            <Star className="fill-yellow-400 text-yellow-400" size={12} />
            <span className="text-[13px] font-bold text-slate-700">{rating || "4.9"}</span>
          </div>

          <div className="flex items-center gap-1 overflow-hidden">
            <Button
              ref={heartRef}
              variant="ghost"
              size="sm"
              onClick={handleToggleWishlist}
              leftIcon={<Heart size={14} className={isWishlisted ? "fill-red-500 text-red-500" : "text-[#4486e1]"} />}
              className={`${isWishlisted ? "text-red-500" : "text-[#4486e1]"} font-bold text-[10px] h-8 px-2 min-w-0`}
            >
              <span className="hidden sm:inline">{isWishlisted ? "Đã thích" : "Yêu thích"}</span>
            </Button>
          </div>
        </div>
      </Card>

      {/* Fly Animation Heart */}
      <AnimatePresence>
        {isAnimating && (
          <motion.div
            initial={{ 
              position: "fixed",
              left: heartRef.current?.getBoundingClientRect().left,
              top: heartRef.current?.getBoundingClientRect().top,
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
