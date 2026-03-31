"use client";

import React from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Button } from "./Button";
import { cn } from "@/utils/cn";

interface PaginationProps {
  page: number;
  setPage: (page: number) => void;
  pageSize: number;
  setPageSize: (pageSize: number) => void;
  totalPages: number;
  totalCount: number;
  showPageSizeSelector?: boolean;
  className?: string;
}

export function Pagination({
  page,
  setPage,
  pageSize,
  setPageSize,
  totalPages,
  totalCount,
  showPageSizeSelector = true,
  className,
}: PaginationProps) {
  if (totalCount === 0) return null;

  const renderPageButtons = () => {
    const buttons = [];
    const maxVisible = 5;

    let startPage = Math.max(1, page - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);

    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    // First page
    if (startPage > 1) {
      buttons.push(
        <Button
          key={1}
          variant={page === 1 ? "primary" : "ghost"}
          size="sm"
          className="w-9 h-9 p-0"
          onClick={() => setPage(1)}
        >
          1
        </Button>
      );
      if (startPage > 2) {
        buttons.push(
          <span key="dots-start" className="text-slate-400 px-1">
            ...
          </span>
        );
      }
    }

    // Page range
    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <Button
          key={i}
          variant={page === i ? "primary" : "ghost"}
          size="sm"
          className="w-9 h-9 p-0"
          onClick={() => setPage(i)}
        >
          {i}
        </Button>
      );
    }

    // Last page
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        buttons.push(
          <span key="dots-end" className="text-slate-400 px-1">
            ...
          </span>
        );
      }
      buttons.push(
        <Button
          key={totalPages}
          variant={page === totalPages ? "primary" : "ghost"}
          size="sm"
          className="w-9 h-9 p-0"
          onClick={() => setPage(totalPages)}
        >
          {totalPages}
        </Button>
      );
    }

    return buttons;
  };

  return (
    <div className={cn("flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-2 border-t border-slate-100", className)}>
      {/* Info & Page Size */}
      <div className="flex items-center gap-4 text-sm text-slate-500">
        <div className="hidden sm:block">
          Hiển thị <strong>{Math.min((page - 1) * pageSize + 1, totalCount)}</strong> -{" "}
          <strong>{Math.min(page * pageSize, totalCount)}</strong> trong số <strong>{totalCount}</strong>
        </div>

        {showPageSizeSelector && (
          <div className="flex items-center gap-2">
            <span className="whitespace-nowrap">Hiển thị:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="bg-white border border-slate-200 text-slate-700 text-xs rounded-lg focus:ring-primary focus:border-primary block p-1.5 transition-all outline-none"
            >
              {[10, 20, 50, 100].map((size) => (
                <option key={size} value={size}>
                  {size} items
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          className="w-9 h-9 p-0 border border-slate-100"
          onClick={() => setPage(1)}
          disabled={page === 1}
        >
          <ChevronsLeft className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="w-9 h-9 p-0 border border-slate-100"
          onClick={() => setPage(page - 1)}
          disabled={page === 1}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        <div className="flex items-center gap-1 mx-1">
          {renderPageButtons()}
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="w-9 h-9 p-0 border border-slate-100"
          onClick={() => setPage(page + 1)}
          disabled={page === totalPages}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="w-9 h-9 p-0 border border-slate-100"
          onClick={() => setPage(totalPages)}
          disabled={page === totalPages}
        >
          <ChevronsRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
