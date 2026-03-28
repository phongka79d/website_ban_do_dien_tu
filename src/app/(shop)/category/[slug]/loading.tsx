import { ChevronRight } from "lucide-react";

export default function CategoryLoading() {
  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-32">
      <div className="container mx-auto px-4 lg:px-8 max-w-7xl animate-pulse">
        
        {/* Breadcrumb Skeleton */}
        <nav className="flex items-center gap-2 text-[13px] font-medium text-slate-300 mb-8">
          <div className="w-20 h-4 bg-slate-200 rounded"></div>
          <ChevronRight className="w-4 h-4" />
          <div className="w-24 h-4 bg-slate-200 rounded"></div>
        </nav>

        {/* Header Hero Skeleton */}
        <div className="bg-white rounded-[32px] p-8 lg:p-12 mb-8 border border-slate-100 shadow-sm relative overflow-hidden">
          <div className="w-32 h-8 bg-slate-100 rounded-lg mb-4"></div>
          <div className="w-64 h-12 bg-slate-100 rounded-2xl mb-4"></div>
          <div className="w-96 h-4 bg-slate-100 rounded"></div>
        </div>

        {/* Product Grid Skeleton (12 items) */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="h-[420px] bg-white rounded-[20px] p-3 border border-slate-100 shadow-sm flex flex-col">
              <div className="w-full aspect-square bg-slate-100 rounded-2xl mb-4"></div>
              <div className="w-full h-4 bg-slate-100 rounded mb-2"></div>
              <div className="w-2/3 h-4 bg-slate-100 rounded mb-4"></div>
              <div className="w-1/2 h-6 bg-slate-100 rounded mt-auto"></div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
