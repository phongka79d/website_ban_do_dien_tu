"use client";

import React from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-slate-50/50">
      <AdminSidebar />

      {/* Main Content Area - Offset by sidebar width (w-64 = 16rem = 256px) */}
      <main className="flex-1 p-8 overflow-y-auto ml-64">
        <div className="max-w-5xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
