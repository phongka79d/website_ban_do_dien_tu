import React from "react";

interface AdminInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const AdminInput: React.FC<AdminInputProps> = ({ label, ...props }) => (
  <div className="space-y-2">
    <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">{label}</label>
    <input
      {...props}
      className={`w-full p-4 rounded-xl border border-slate-200 focus:border-primary outline-none transition-all bg-slate-50/50 focus:bg-white ${props.className || ""}`}
    />
  </div>
);
