"use client";

import React, { useEffect } from "react";
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: "success" | "error" | "warning";
  buttonText?: string;
}

/**
 * A reusable Notification Modal for success/error alerts.
 * Replaces native browser alerts with a premium UI.
 */
export default function NotificationModal({
  isOpen,
  onClose,
  title,
  message,
  type = "success",
  buttonText = "Đóng",
}: NotificationModalProps) {
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
    success: {
      icon: <CheckCircle2 className="text-emerald-500" size={40} />,
      button: "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200",
      bg: "bg-emerald-50",
    },
    error: {
      icon: <XCircle className="text-red-500" size={40} />,
      button: "bg-red-500 hover:bg-red-600 shadow-red-200",
      bg: "bg-red-50",
    },
    warning: {
      icon: <AlertCircle className="text-amber-500" size={40} />,
      button: "bg-amber-500 hover:bg-amber-600 shadow-amber-200",
      bg: "bg-amber-50",
    },
  };

  const currentTheme = themes[type];

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-sm scale-100 transform overflow-hidden rounded-[40px] bg-white p-10 shadow-2xl transition-all border border-white animate-in zoom-in duration-300">
        <div className="flex flex-col items-center text-center">
          <div className={`mb-8 flex h-24 w-24 items-center justify-center rounded-full ${currentTheme.bg}`}>
            {currentTheme.icon}
          </div>
          
          <h3 className="mb-3 text-2xl font-black tracking-tight text-slate-900">
            {title}
          </h3>
          
          <p className="mb-10 text-slate-500 leading-relaxed font-bold">
            {message}
          </p>

          <button
            onClick={onClose}
            className={`w-full rounded-2xl py-4 text-base font-black text-white shadow-lg transition-all hover:scale-[1.02] active:scale-95 cursor-pointer ${currentTheme.button}`}
          >
            {buttonText.toUpperCase()}
          </button>
        </div>
      </div>
    </div>
  );
}
