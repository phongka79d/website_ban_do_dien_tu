import React from "react";
import { PackageX } from "lucide-react";

export default function OrdersPage() {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col items-center justify-center py-32 px-4 text-center animate-in fade-in zoom-in-95 duration-500 h-full min-h-[500px]">
      <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6 ring-8 ring-slate-50/50">
        <PackageX size={48} className="text-slate-300" />
      </div>
      <h2 className="text-xl font-black text-slate-800 mb-2">Chưa có đơn hàng nào</h2>
      <p className="text-slate-500 text-sm max-w-sm">
        Bạn tuyệt vời đến mức chưa cần phải mua đồ điện tử ở đây. Hãy khám phá ngay các deal giảm giá chấn động hôm nay nhé!
      </p>
    </div>
  );
}
