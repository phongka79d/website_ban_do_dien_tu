import React from "react";
import BannerManager from "@/components/admin/BannerManager";
import { Image as ImageIcon } from "lucide-react";

export default function BannersPage() {
  return (
    <div className="p-8 md:p-12 min-h-screen">
      <div className="max-w-[1400px] mx-auto space-y-12">
        {/* Title Section */}
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-[24px] bg-primary/10 flex items-center justify-center text-primary shadow-inner">
            <ImageIcon size={32} />
          </div>
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Banner Carousel</h1>
            <p className="text-slate-400 font-bold mt-1 uppercase tracking-widest text-[12px]">Quản lý slideshow trang chủ</p>
          </div>
        </div>

        {/* Manager Component */}
        <BannerManager />
      </div>
    </div>
  );
}
