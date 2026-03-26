import React from "react";
import CategoryManager from "@/components/admin/CategoryManager";

export default function AdminCategoriesPage() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header>
        <h1 className="text-[32px] font-black text-slate-900 tracking-tight leading-tight">
          Quản lý <span className="text-primary italic">Danh mục</span>
        </h1>
        <p className="text-slate-500 text-[14px] font-medium mt-1">
          Quản lý các nhóm sản phẩm trong hệ thống.
        </p>
      </header>

      <CategoryManager />
    </div>
  );
}
