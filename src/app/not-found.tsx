import React from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

/**
 * Custom 404 page to handle broken carousel links gracefully.
 * This prevents the Router Initialization loop by providing a stable 404 UI.
 */
export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex flex-1 flex-col items-center justify-center p-8 text-center">
        <h1 className="text-9xl font-black text-slate-200">404</h1>
        <h2 className="mt-4 text-2xl font-bold text-slate-800">Không tìm thấy trang này</h2>
        <p className="mt-2 text-slate-500 max-w-md">
          Opps! Trang không tồn tại.
        </p>
        <Link
          href="/"
          className="mt-8 rounded-full bg-primary px-8 py-3 font-bold text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
        >
          Quay lại trang chủ
        </Link>
      </main>
      <Footer />
    </div>
  );
}
