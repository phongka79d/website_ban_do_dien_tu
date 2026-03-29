"use client";

import React from "react";
import { Minus, Plus, Trash2 } from "lucide-react";
import { CartItem as CartItemType } from "@/types/database";
import { useCartStore } from "@/store/useCartStore";
import { ProductImage } from "@/components/common/ProductImage";

interface CartItemProps {
  item: CartItemType;
}

export default function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeItem } = useCartStore();
  const product = item.products;

  if (!product) return null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
  };

  return (
    <div className="flex gap-4 py-4 border-b border-slate-100 last:border-0 group animate-in slide-in-from-right-4 duration-300">
      {/* Product Image */}
      <div className="relative w-24 h-24 rounded-2xl bg-slate-50 overflow-hidden border border-slate-100 shrink-0">
        <ProductImage
          src={product.image_url}
          alt={product.name}
          width={96}
          height={96}
          className="object-contain p-2 w-full h-full"
        />
      </div>

      {/* Product Details */}
      <div className="flex flex-col flex-1 min-w-0">
        <div className="flex justify-between items-start gap-2">
          <h4 className="text-[13px] font-bold text-slate-800 line-clamp-2 leading-snug">
            {product.name}
          </h4>
          <button 
            onClick={() => removeItem(item.id)}
            className="text-slate-400 hover:text-red-500 transition-colors p-1"
          >
            <Trash2 size={16} />
          </button>
        </div>

        <div className="mt-2 flex items-center justify-between">
          <div className="text-sm font-black text-primary">
            {formatPrice(product.price)}
          </div>

          {/* Quantity Controls */}
          <div className="flex items-center bg-slate-100 rounded-lg p-1">
            <button
              onClick={() => updateQuantity(item.id, item.quantity - 1)}
              className="p-1 text-slate-500 hover:text-slate-900 transition-colors"
            >
              <Minus size={14} />
            </button>
            <span className="w-8 text-center text-xs font-black text-slate-900">
              {item.quantity}
            </span>
            <button
              onClick={() => updateQuantity(item.id, item.quantity + 1)}
              className="p-1 text-slate-500 hover:text-slate-900 transition-colors"
            >
              <Plus size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
