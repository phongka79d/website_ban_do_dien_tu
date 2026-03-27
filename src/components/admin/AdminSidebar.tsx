"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Settings, 
  LogOut, 
  ChevronRight,
  Store,
  Grid,
  Tags,
  Image as ImageIcon
} from "lucide-react";

export function AdminSidebar() {
  const pathname = usePathname();

  const menuItems = [
    { 
      name: "Dashboard", 
      icon: <LayoutDashboard size={20} />, 
      href: "/admin" 
    },
    { 
      name: "Quản lý Sản phẩm", 
      icon: <Package size={20} />, 
      href: "/admin/products" 
    },
    { 
      name: "Danh mục", 
      icon: <Grid size={20} />, 
      href: "/admin/categories" 
    },
    { 
      name: "Thương hiệu", 
      icon: <Tags size={20} />, 
      href: "/admin/brands" 
    },
    { 
      name: "Banner Carousel", 
      icon: <ImageIcon size={20} />, 
      href: "/admin/banners" 
    },
    { 
      name: "Đơn hàng", 
      icon: <ShoppingCart size={20} />, 
      href: "/admin/orders" 
    },
    { 
      name: "Khách hàng", 
      icon: <Users size={20} />, 
      href: "/admin/users" 
    },
    { 
      name: "Cài đặt", 
      icon: <Settings size={20} />, 
      href: "/admin/settings" 
    },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white/80 backdrop-blur-md border-r border-slate-100 flex flex-col z-50">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/30">
            <Store size={24} />
          </div>
          <div>
            <h2 className="font-black text-slate-900 text-xl tracking-tight leading-none">Antigravity</h2>
            <p className="text-[10px] font-black uppercase tracking-widest text-primary mt-1">Admin Panel</p>
          </div>
        </div>

        <nav className="space-y-1.5">
          {menuItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between p-4 rounded-xl transition-all duration-300 group ${
                  isActive 
                    ? "bg-slate-50 text-primary font-bold shadow-sm" 
                    : "text-slate-400 hover:bg-slate-50 hover:text-slate-600"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`transition-transform duration-300 ${isActive ? "scale-110" : "group-hover:scale-110"}`}>
                    {item.icon}
                  </span>
                  <span className="text-[14px] leading-none">{item.name}</span>
                </div>
                {isActive && <ChevronRight size={16} className="opacity-50" />}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto p-6 border-t border-slate-50">
        <Link 
          href="/"
          className="flex items-center gap-3 p-4 rounded-xl text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all duration-300 group"
        >
          <LogOut size={20} className="transition-transform group-hover:-translate-x-1" />
          <span className="text-[14px] font-bold">Quay lại Shop</span>
        </Link>
      </div>
    </aside>
  );
}
