"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Settings,
  ShoppingBag,
  ChevronRight,
  Tags,
  Layers
} from "lucide-react";

export function AdminSidebar() {
  const pathname = usePathname();

  const menuItems = [
    {
      label: "Tổng quan",
      href: "/admin",
      icon: <LayoutDashboard size={20} />,
      isActive: pathname === "/admin"
    },
    {
      label: "Quản lý sản phẩm",
      href: "/admin/products",
      icon: <Package size={20} />,
      isActive: pathname === "/admin/products"
    },
    {
      label: "Danh mục",
      href: "#",
      icon: <Layers size={20} />,
      isActive: false,
      disabled: true
    },
    {
      label: "Thương hiệu",
      href: "#",
      icon: <Tags size={20} />,
      isActive: false,
      disabled: true
    },
  ];

  return (
    <aside className="w-72 bg-slate-900 text-white p-6 sticky top-0 h-screen overflow-y-auto flex flex-col shadow-2xl">
      <div className="mb-10 px-2">
        <Link href="/" className="text-2xl font-black italic text-primary flex items-center gap-2">
          QuizLM <span className="text-white not-italic text-lg opacity-80 lowercase">admin</span>
        </Link>
      </div>

      <div className="space-y-1 flex-1">
        {menuItems.map((item, index) => (
          <Link
            key={index}
            href={item.href}
            className={`
              flex items-center justify-between p-3.5 rounded-2xl transition-all duration-300 group
              ${item.isActive
                ? "bg-primary text-white shadow-lg shadow-primary/30"
                : "text-slate-400 hover:bg-slate-800 hover:text-white"}
              ${item.disabled ? "opacity-40 cursor-not-allowed" : ""}
            `}
          >
            <div className="flex items-center gap-3">
              <span className={`${item.isActive ? "scale-110" : "group-hover:scale-110"} transition-transform`}>
                {item.icon}
              </span>
              <span className="font-bold text-[14px]">{item.label}</span>
            </div>
            {!item.disabled && <ChevronRight size={14} className={`opacity-0 group-hover:opacity-100 transition-opacity ${item.isActive ? "opacity-100" : ""}`} />}
          </Link>
        ))}
      </div>

      <div className="mt-auto pt-6 border-t border-slate-800">
        <Link
          href="/"
          className="flex items-center gap-3 p-4 rounded-2xl bg-slate-800/50 text-slate-300 hover:bg-slate-800 hover:text-white transition-all font-bold text-sm"
        >
          <ShoppingBag size={20} />
          Xem cửa hàng
        </Link>
      </div>
    </aside>
  );
}
