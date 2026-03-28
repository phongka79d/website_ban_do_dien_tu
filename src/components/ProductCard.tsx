"use client";

import { Star, Heart } from "lucide-react";
import { Product } from "@/types/database";
import { ProductImage } from "./common/ProductImage";
import Link from "next/link";

interface ProductCardProps {
  product: Product;
}

/**
 * Refined ProductCard component to strictly match the "CellphoneS" style.
 * Uses slate-900 for text and precise spacing for a professional feel.
 */
export default function ProductCard({ product }: ProductCardProps) {
  const {
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

  // Get first 3 tech specs for tags
  const specTags = specs ? Object.entries(specs).slice(0, 3) : [];

  return (
    <Link href={`/products/${product.id}`} prefetch={false} className="group relative flex flex-col h-full overflow-hidden rounded-[20px] border border-slate-100 bg-white p-3 shadow-[0_4px_12px_rgba(0,0,0,0.05)] transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer">

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

        {/* Footer info: Rating & Favorite */}
        <div className="mt-auto pt-3 flex items-center justify-between border-t border-slate-50">
          <div className="flex items-center gap-0.5">
            <Star className="fill-yellow-400 text-yellow-400" size={12} />
            <span className="text-[13px] font-bold text-slate-700">{rating || "4.9"}</span>
          </div>
          <button 
            onClick={(e) => { e.preventDefault(); /* TODO: Handle Favorite logic here */ }}
            className="flex items-center gap-1 hover:brightness-110 transition-all"
          >
            <Heart size={16} className="text-[#4486e1]" />
            <span className="text-[11px] font-bold text-[#4486e1]">Yêu thích</span>
          </button>
        </div>
      </div>
    </Link>
  );
}
