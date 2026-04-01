"use client";

import React, { useEffect } from "react";
import { AlertTriangle, Info, CheckCircle2, X } from "lucide-react";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: "danger" | "info" | "success";
  loading?: boolean;
  children?: React.ReactNode;
  showConfirm?: boolean;
}

/**
 * A premium, reusable Confirmation Modal component.
 * Features smooth transitions, backdrop blur, and multiple theme types.
 */
export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Xác nhận",
  cancelText = "Hủy bỏ",
  type = "danger",
  loading = false,
  children,
  showConfirm = true,
}: ConfirmationModalProps) {
  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const themes = {
    danger: {
      icon: <AlertTriangle className="text-red-500" size={32} />,
      button: "bg-red-500 hover:bg-red-600 shadow-red-200",
      bg: "bg-red-50",
    },
    info: {
      icon: <Info className="text-blue-500" size={32} />,
      button: "bg-blue-500 hover:bg-blue-600 shadow-blue-200",
      bg: "bg-blue-50",
    },
    success: {
      icon: <CheckCircle2 className="text-emerald-500" size={32} />,
      button: "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200",
      bg: "bg-emerald-50",
    },
  };

  const currentTheme = themes[type];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-md scale-100 transform overflow-hidden rounded-[32px] bg-white p-8 shadow-2xl transition-all border border-white">

        {/* Content */}
        <div className="flex flex-col items-center text-center">
          <div className={`mb-6 flex h-20 w-20 items-center justify-center rounded-3xl ${currentTheme.bg}`}>
            {currentTheme.icon}
          </div>

          <h3 className="mb-2 text-2xl font-black tracking-tight text-slate-900">
            {title}
          </h3>

          <p className="mb-6 text-slate-500 leading-relaxed font-medium">
            {message}
          </p>

          {children && (
            <div className="w-full mb-10 text-left animate-in fade-in slide-in-from-bottom-2 duration-500">
              {children}
            </div>
          )}

          {/* Actions */}
          <div className="flex w-full flex-col gap-3">
            {showConfirm && (
              <button
                onClick={onConfirm}
                disabled={loading}
                className={`w-full rounded-2xl py-4 text-base font-black text-white shadow-lg transition-all hover:scale-[1.02] active:scale-95 disabled:grayscale disabled:scale-100 cursor-pointer ${currentTheme.button}`}
              >
                {loading ? "ĐANG XỬ LÝ..." : confirmText.toUpperCase()}
              </button>
            )}
            <button
              onClick={onClose}
              disabled={loading}
              className="w-full rounded-2xl py-4 text-base font-bold text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-all cursor-pointer"
            >
              {cancelText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
