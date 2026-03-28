import React from "react";
import Link from "next/link";

/**
 * Custom 404 page.
 * Header and Footer are now provided by the Root Layout,
 * ensuring no duplication across different route groups.
 */
export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center p-8 text-center bg-slate-50">
      <h1 className="text-9xl font-black text-slate-200">404</h1>
      <h2 className="mt-4 text-2xl font-bold text-slate-800 tracking-tight">Không tìm thấy trang này</h2>
      <p className="mt-2 text-slate-500 font-medium max-w-md">
        Opps! Trang không tồn tại hoặc đã bị di dời.
      </p>
      <Link
        href="/"
        prefetch={false}
        className="mt-8 rounded-full bg-primary px-10 py-4 font-black text-white shadow-xl shadow-primary/20 transition-all hover:scale-105 hover:shadow-2xl active:scale-95 uppercase tracking-widest text-xs"
      >
        Quay lại trang chủ
      </Link>
    </main>
  );
}
