import React from "react";
import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Admin Sidebar */}
      <aside className="w-64 bg-slate-900 text-white p-6 sticky top-0 h-screen overflow-y-auto">
        <div className="mb-8">
          <Link href="/" className="text-2xl font-black italic text-primary">
            QuizLM <span className="text-white not-italic">Admin</span>
          </Link>
        </div>
        
        <nav className="flex flex-col gap-4">
          <Link href="/admin" className="p-3 rounded-lg hover:bg-slate-800 transition-colors font-medium">
            Thống kê
          </Link>
          <Link href="/admin/products/new" className="p-3 rounded-lg bg-primary text-white font-bold shadow-lg shadow-primary/20">
            Thêm sản phẩm
          </Link>
          <Link href="/products" className="p-3 rounded-lg hover:bg-slate-800 transition-colors text-slate-400">
            Xem cửa hàng →
          </Link>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
