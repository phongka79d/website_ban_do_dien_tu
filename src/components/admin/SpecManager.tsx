import React from "react";

interface Spec {
  key: string;
  value: string;
}

interface SpecManagerProps {
  specs: Spec[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  onUpdate: (index: number, field: "key" | "value", value: string) => void;
}

export const SpecManager: React.FC<SpecManagerProps> = ({ specs, onAdd, onRemove, onUpdate }) => (
  <div className="space-y-4">
    <label className="text-sm font-bold text-slate-700 uppercase tracking-wider flex justify-between">
      Thông số kỹ thuật
      <span className="text-[10px] text-slate-400 normal-case font-normal">Thêm các thuộc tính như CPU, RAM, Pin...</span>
    </label>
    
    <div className="space-y-3">
      {specs.map((spec, index) => (
        <div key={index} className="flex gap-3 group">
          <input
            type="text"
            placeholder="Tên (VD: RAM)"
            className="flex-1 p-3 rounded-xl border border-slate-200 focus:border-primary outline-none transition-all bg-slate-50/50"
            value={spec.key}
            onChange={(e) => onUpdate(index, "key", e.target.value)}
          />
          <input
            type="text"
            placeholder="Giá trị (VD: 16GB)"
            className="flex-[2] p-3 rounded-xl border border-slate-200 focus:border-primary outline-none transition-all bg-slate-50/50"
            value={spec.value}
            onChange={(e) => onUpdate(index, "value", e.target.value)}
          />
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="p-3 text-slate-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
    
    <button
      type="button"
      onClick={onAdd}
      className="text-sm font-bold text-primary hover:text-primary-dark transition-colors flex items-center gap-1"
    >
      + Thêm thông số khác
    </button>
  </div>
);
