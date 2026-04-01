"use client";

import React from "react";
import { Search, Plus } from "lucide-react";
import { Button } from "../ui/Button";

interface AdminManagerShellProps {
  /** Giá trị ô tìm kiếm */
  searchTerm: string;
  /** Callback khi người dùng gõ */
  onSearch: (value: string) => void;
  /** Placeholder cho ô tìm kiếm */
  searchPlaceholder?: string;
  /** Callback khi bấm nút "Thêm mới" (Tùy chọn) */
  onAdd?: () => void;
  /** Nhãn nút thêm mới (Tùy chọn) */
  addLabel?: string;
  /** Đang tải dữ liệu */
  loading: boolean;
  /** Không có kết quả (sau khi filter) */
  isEmpty: boolean;
  /** Icon hiển thị ở empty state */
  emptyIcon?: React.ReactNode;
  /** Text hiển thị ở empty state */
  emptyText?: string;
  /** Nội dung chính (list/grid items) */
  children: React.ReactNode;
}

/**
 * AdminManagerShell — Shell layout dùng chung cho các trang CRUD Admin.
 */
export default function AdminManagerShell({
  searchTerm,
  onSearch,
  searchPlaceholder = "Tìm kiếm...",
  onAdd,
  addLabel,
  loading,
  isEmpty,
  emptyIcon,
  emptyText = "Không tìm thấy dữ liệu nào",
  children,
}: AdminManagerShellProps) {
  return (
    <div className="space-y-6">
      {/* Header: Search + Add Button */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <input
            type="text"
            placeholder={searchPlaceholder}
            className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-100 bg-white shadow-sm focus:border-primary outline-none transition-all placeholder:text-slate-300 font-bold text-[14px]"
            value={searchTerm}
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>

        {onAdd && addLabel && (
          <Button
            onClick={onAdd}
            size="default"
            leftIcon={<Plus size={18} />}
            className="w-full md:w-auto"
          >
            {addLabel}
          </Button>
        )}
      </div>

      {/* Loading spinner */}
      {loading && (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Content (list/grid) */}
      {!loading && !isEmpty && children}

      {/* Empty state */}
      {!loading && isEmpty && (
        <div className="text-center py-20 bg-slate-50/50 rounded-[32px] border-2 border-dashed border-slate-100">
          {emptyIcon && (
            <div className="mx-auto mb-4 text-slate-200">{emptyIcon}</div>
          )}
          <p className="text-slate-400 font-bold">{emptyText}</p>
        </div>
      )}
    </div>
  );
}
