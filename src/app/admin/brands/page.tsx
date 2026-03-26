import React from "react";
import BrandManager from "@/components/admin/BrandManager";

export default function AdminBrandsPage() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header>
        <h1 className="text-[32px] font-black text-slate-900 tracking-tight leading-tight">
          Quản lý <span className="text-primary italic">Thương hiệu</span>
        </h1>
        <p className="text-slate-500 text-[14px] font-medium mt-1">
          Quản lý các nhãn hàng sản phẩm.
        </p>
      </header>

      <BrandManager />
    </div>
  );
}
