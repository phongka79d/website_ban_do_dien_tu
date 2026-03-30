import React, { forwardRef } from "react";

interface AdminSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  placeholder?: string;
  options: { value: string; label: string }[];
  error?: string;
}

export const AdminSelect = forwardRef<HTMLSelectElement, AdminSelectProps>(
  ({ label, options, error, ...props }, ref) => (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest leading-none">
          {label}
        </label>
        {error && (
          <span className="text-[10px] font-bold text-rose-500 animate-in fade-in slide-in-from-right-2 duration-300">
            {error}
          </span>
        )}
      </div>
      <select
        {...props}
        ref={ref}
        className={`w-full p-4 rounded-2xl border ${
          error ? "border-rose-200 bg-rose-50/30" : "border-slate-100 bg-slate-50/50"
        } focus:border-primary outline-none transition-all focus:bg-white text-[14px] font-medium appearance-none cursor-pointer ${
          props.className || ""
        }`}
      >
        <option value="" disabled>
          {props.placeholder || `Chọn ${label.toLowerCase()}`}
        </option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
);

AdminSelect.displayName = "AdminSelect";

