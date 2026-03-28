"use client";

import React from "react";
import { X } from "lucide-react";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";

interface AdminActionModalProps {
  /** Trạng thái mở/đóng của modal */
  isOpen: boolean;
  /** Callback khi đóng modal */
  onClose: () => void;
  /** Tiêu đề hiển thị trong modal */
  title: string;
  /**
   * Độ rộng tối đa của modal.
   * @default "max-w-lg"
   */
  maxWidth?: string;
  /** Nội dung (form, fields, ...) */
  children: React.ReactNode;
}

/**
 * AdminActionModal — Scaffold modal dùng chung cho Create/Edit trong Admin.
 * Bao gồm: overlay, card, nút đóng, tiêu đề.
 * Phần form content truyền qua `children`.
 */
export default function AdminActionModal({
  isOpen,
  onClose,
  title,
  maxWidth = "max-w-lg",
  children,
}: AdminActionModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Modal Card */}
      <Card
        variant="elevated"
        radius="2xl"
        className={`relative w-full ${maxWidth} p-10 animate-in zoom-in duration-300 border border-white overflow-hidden max-h-[90vh] overflow-y-auto`}
      >
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute right-8 top-8 z-50 text-slate-300 hover:text-slate-600"
        >
          <X size={24} />
        </Button>
 
        <h2 className="text-2xl font-black text-slate-900 mb-8 tracking-tight">
          {title}
        </h2>
 
        {children}
      </Card>
    </div>
  );
}
