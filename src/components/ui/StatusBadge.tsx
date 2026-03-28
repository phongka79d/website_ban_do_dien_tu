"use client";

import React from "react";
import { CheckCircle2, XCircle } from "lucide-react";

interface StatusBadgeProps {
  /** true = Active, false = Inactive */
  active: boolean;
  activeLabel?: string;
  inactiveLabel?: string;
  /** @default "sm" */
  size?: "sm" | "md";
}

/**
 * StatusBadge — Badge trạng thái Active/Inactive dùng chung trong Admin.
 */
export default function StatusBadge({
  active,
  activeLabel = "Active",
  inactiveLabel = "Inactive",
  size = "sm",
}: StatusBadgeProps) {
  const iconSize = size === "sm" ? 10 : 12;
  const textCls = size === "sm" ? "text-[10px]" : "text-[11px]";
  const paddingCls = size === "sm" ? "px-2 py-1" : "px-3 py-1.5";

  if (active) {
    return (
      <span className={`flex items-center gap-1 bg-green-500/20 backdrop-blur-md text-green-500 ${paddingCls} rounded-full ${textCls} font-black uppercase tracking-widest`}>
        <CheckCircle2 size={iconSize} />
        {activeLabel}
      </span>
    );
  }

  return (
    <span className={`flex items-center gap-1 bg-slate-500/20 backdrop-blur-md text-slate-400 ${paddingCls} rounded-full ${textCls} font-black uppercase tracking-widest`}>
      <XCircle size={iconSize} />
      {inactiveLabel}
    </span>
  );
}
