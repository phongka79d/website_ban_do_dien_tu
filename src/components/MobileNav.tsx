"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, 
  LayoutGrid, 
  ShoppingCart, 
  User, 
  Heart 
} from "lucide-react";
import { motion } from "framer-motion";
import { useCartStore } from "@/store/useCartStore";

export default function MobileNav() {
  const pathname = usePathname();
  const { getTotalItems } = useCartStore();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const navItems = [
    { icon: <Home size={22} />, label: "Trang chủ", href: "/" },
    { icon: <LayoutGrid size={22} />, label: "Danh mục", href: "/products" },
    { icon: <ShoppingCart size={22} />, label: "Giỏ hàng", href: "/cart", badge: true },
    { icon: <Heart size={22} />, label: "Yêu thích", href: "/wishlist" },
    { icon: <User size={22} />, label: "Tôi", href: "/profile" },
  ];

  // Hide Bottom Nav on Admin pages
  if (pathname?.startsWith("/admin")) return null;
  return (
    <div className="fixed bottom-0 left-0 right-0 z-[60] block border-t border-slate-100 bg-white/80 pb-safe backdrop-blur-lg md:hidden">
      <nav className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className="relative flex flex-col items-center gap-1 px-3 py-1 transition-all active:scale-95"
            >
              <div 
                className={`transition-colors duration-300 ${
                  isActive ? "text-primary scale-110" : "text-slate-500"
                }`}
              >
                {item.icon}
                {item.badge && mounted && getTotalItems() > 0 && (
                  <motion.span 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -right-0 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-secondary text-[9px] font-bold text-white ring-1 ring-white"
                  >
                    {getTotalItems()}
                  </motion.span>
                )}
              </div>
              <span 
                className={`text-[10px] font-medium transition-colors duration-300 ${
                  isActive ? "text-primary" : "text-slate-500"
                }`}
              >
                {item.label}
              </span>
              {isActive && (
                <motion.div 
                  layoutId="active-pill"
                  className="absolute -bottom-1 h-0.5 w-6 rounded-full bg-primary"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
