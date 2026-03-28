"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface AuthCardProps {
  /** Nội dung bên trong Card */
  children: React.ReactNode;
  /** Nếu có, hiển thị nút Quay lại trỏ tới href này */
  backHref?: string;
  /** Điều kiện hiển thị nút Quay lại (mặc định: true nếu backHref được cung cấp) */
  showBack?: boolean;
  /** Độ rộng tối đa, default "max-w-md" */
  maxWidth?: string;
}

/**
 * AuthCard — Glassmorphism wrapper dùng chung cho tất cả Auth pages.
 * Bao gồm: gradient background, card mờ, decorative blobs và nút Quay lại tuỳ chọn.
 */
export default function AuthCard({
  children,
  backHref,
  showBack = true,
  maxWidth = "max-w-md",
}: AuthCardProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-slate-50 to-secondary/20 px-4 py-12">
      <div className={`w-full ${maxWidth}`}>
        <div className="relative overflow-hidden rounded-3xl border border-white/40 bg-white/60 p-8 shadow-2xl backdrop-blur-xl md:p-10">
          {/* Decorative blobs */}
          <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-primary/10 blur-2xl" />
          <div className="absolute -bottom-4 -left-4 h-24 w-24 rounded-full bg-secondary/10 blur-2xl" />

          {/* Back button */}
          {backHref && showBack && (
            <Link
              href={backHref}
              className="absolute left-6 top-6 z-10 flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-primary transition-colors"
            >
              <ArrowLeft size={14} /> Quay lại
            </Link>
          )}

          {children}
        </div>
      </div>
    </div>
  );
}
