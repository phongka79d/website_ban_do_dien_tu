import React, { forwardRef } from "react";

interface AdminInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  icon?: React.ReactNode;
}

export const AdminInput = forwardRef<HTMLInputElement, AdminInputProps>(
  ({ label, error, icon, ...props }, ref) => (
    <div className="space-y-2">
      <div className="flex justify-between items-center px-1">
        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest leading-none">
          {label}
        </label>
        {error && (
          <span className="text-[10px] font-bold text-rose-500 animate-in fade-in slide-in-from-right-2 duration-300">
            {error}
          </span>
        )}
      </div>
      <div className="relative group">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors duration-300">
            {icon}
          </div>
        )}
        <input
          {...props}
          ref={ref}
          className={`w-full ${icon ? "pl-11" : "pl-4"} p-4 rounded-2xl border ${
            error ? "border-rose-200 bg-rose-50/30" : "border-slate-100 bg-slate-50/50"
          } focus:border-primary outline-none transition-all focus:bg-white text-[14px] font-bold placeholder:text-slate-300 ${
            props.className || ""
          }`}
        />
      </div>
    </div>
  )
);

AdminInput.displayName = "AdminInput";

