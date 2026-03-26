import React from "react";

interface AdminToggleProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export const AdminToggle: React.FC<AdminToggleProps> = ({ label, checked, onChange }) => (
  <div className="flex items-center gap-4 h-full pt-8">
    <label className="relative inline-flex items-center cursor-pointer">
      <input 
        type="checkbox" 
        className="sr-only peer" 
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
      <span className="ml-3 text-sm font-bold text-slate-700">{label}</span>
    </label>
  </div>
);
