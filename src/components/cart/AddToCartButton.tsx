"use client";

import React, { useState, useRef } from "react";
import { ShoppingBag, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Product } from "@/types/database";
import { useCartStore } from "@/store/useCartStore";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/utils/supabase/client";
import { motion, AnimatePresence } from "framer-motion";

interface AddToCartButtonProps {
  product: Product;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "soft";
  className?: string;
  showIcon?: boolean;
  label?: string;
  quantity?: number;
  onSuccess?: (itemId: string) => void;
  leftIcon?: React.ReactNode;
}

export function AddToCartButton({ 
  product, 
  variant = "primary", 
  className = "", 
  showIcon = true,
  label = "Thêm vào giỏ",
  quantity = 1,
  onSuccess,
  leftIcon
}: AddToCartButtonProps) {
  const router = useRouter();
  const { addItem } = useCartStore();
  const [isAdding, setIsAdding] = useState(false);
  const [isFlying, setIsFlying] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const supabase = createClient();

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsAdding(true);
    
    // Check if user is logged in
    if (!supabase) {
      setIsAdding(false);
      return;
    }
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      setIsAdding(false);
      const returnUrl = encodeURIComponent(window.location.pathname + window.location.search);
      router.push(`/login?error=auth_required&returnTo=${returnUrl}`);
      return;
    }

    try {
      const itemId = await addItem(product, quantity);
      
      // Kích hoạt hiệu ứng bay
      setIsFlying(true);
      
      // Gọi callback thành công (nếu có) để nhảy sang trang checkout
      if (onSuccess && itemId) {
        onSuccess(itemId);
      }
      
      // Tự động tắt element bay sau khi hoàn tất animation
      setTimeout(() => {
        setIsFlying(false);
      }, 1000);

    } catch (error) {
      console.error("Add to cart error:", error);
    } finally {
      setIsAdding(false);
    }
  };

  // Tính toán tọa độ bay (Flying path)
  const getFlyAnimation = () => {
    const target = document.getElementById("cart-icon-target");
    if (!target || !buttonRef.current) return {};

    const targetRect = target.getBoundingClientRect();
    const buttonRect = buttonRef.current.getBoundingClientRect();

    return {
      x: targetRect.left - buttonRect.left + (targetRect.width / 2) - 20,
      y: targetRect.top - buttonRect.top + (targetRect.height / 2) - 20,
      scale: 0.1,
      opacity: 0,
      rotate: 360
    };
  };

  return (
    <div className="relative inline-block w-full">
      <Button
        ref={buttonRef}
        variant={variant}
        className={`relative font-black uppercase tracking-widest text-[13px] rounded-2xl transition-all active:scale-95 ${className}`}
        onClick={handleAddToCart}
        disabled={isAdding || (product.stock_quantity === 0)}
        leftIcon={isAdding ? <Loader2 className="animate-spin" size={20} /> : (leftIcon || (showIcon && <ShoppingBag size={20} />))}
      >
        {isAdding ? "Đang xử lý..." : (product.stock_quantity === 0 ? "Hết hàng" : label)}
      </Button>

      {/* Hiệu ứng Flying Item */}
      <AnimatePresence>
        {isFlying && (
          <motion.div
            initial={{ x: 0, y: 0, scale: 1, opacity: 1, rotate: 0 }}
            animate={getFlyAnimation()}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="fixed z-[9999] pointer-events-none"
            style={{
              left: buttonRef.current?.getBoundingClientRect().left,
              top: buttonRef.current?.getBoundingClientRect().top,
              width: 40,
              height: 40,
            }}
          >
            <div className="w-full h-full bg-primary rounded-full flex items-center justify-center shadow-2xl border-2 border-white overflow-hidden">
               {/* eslint-disable-next-line @next/next/no-img-element */}
               <img 
                src={product.image_url || "/placeholder.png"} 
                alt="flying item" 
                className="w-full h-full object-cover"
               />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
