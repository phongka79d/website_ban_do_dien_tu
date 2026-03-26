import React from "react";

interface AdminSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  placeholder?: string;
  options: { value: string; label: string }[];
}

export const AdminSelect: React.FC<AdminSelectProps> = ({ label, options, ...props }) => (
  <div className="space-y-2">
    <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">{label}</label>
    <select
      {...props}
      className="w-full p-4 rounded-xl border border-slate-200 focus:border-primary outline-none transition-all bg-slate-50/50 focus:bg-white"
    >
      <option value="" disabled>{props.placeholder || `Chọn ${label.toLowerCase()}`}</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  </div>
);
