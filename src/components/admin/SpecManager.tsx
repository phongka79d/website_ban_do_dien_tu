import React, { useState, useRef, useEffect } from "react";
import { COMMON_SPECS, SPEC_VALUE_SUGGESTIONS } from "@/constants/spec-suggestions";
import { Button } from "../ui/Button";
import { Plus, X } from "lucide-react";

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


export const SpecManager: React.FC<SpecManagerProps> = ({ specs, onAdd, onRemove, onUpdate }) => {
  const [activeKeySuggestion, setActiveKeySuggestion] = useState<number | null>(null);
  const [activeValueSuggestion, setActiveValueSuggestion] = useState<number | null>(null);
  const suggestionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target as Node)) {
        setActiveKeySuggestion(null);
        setActiveValueSuggestion(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="space-y-4">
      <label className="text-sm font-bold text-slate-700 uppercase tracking-wider flex justify-between">
        Thông số kỹ thuật
        <span className="text-[10px] text-slate-400 normal-case font-normal">Tự động gợi ý giá trị dựa trên tên thông số</span>
      </label>

      <div className="space-y-3" ref={suggestionRef}>
        {specs.map((spec, index) => (
          <div key={index} className="flex gap-3 group relative">
            {/* Key Input */}
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Tên (VD: RAM)"
                className="w-full p-3 rounded-xl border border-slate-200 focus:border-primary outline-none transition-all bg-slate-50/50"
                value={spec.key}
                onFocus={() => {
                  setActiveKeySuggestion(index);
                  setActiveValueSuggestion(null);
                }}
                onChange={(e) => {
                  onUpdate(index, "key", e.target.value);
                  setActiveKeySuggestion(index);
                }}
              />
              
              {activeKeySuggestion === index && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-2xl z-[100] max-h-48 overflow-y-auto animate-in fade-in zoom-in duration-200">
                  <div className="p-3 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/50 border-b border-slate-50">Gợi ý tên</div>
                  {COMMON_SPECS.filter(s => 
                    !spec.key || s.toLowerCase().includes(spec.key.toLowerCase())
                  ).map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      className="w-full text-left p-3 hover:bg-slate-50 text-[13px] font-bold text-slate-600 border-b border-slate-50 last:border-0"
                      onClick={() => {
                        onUpdate(index, "key", suggestion);
                        setActiveKeySuggestion(null);
                      }}
                    >
                      {suggestion}
                    </button>
                  ))}
                  {COMMON_SPECS.filter(s => 
                    !spec.key || s.toLowerCase().includes(spec.key.toLowerCase())
                  ).length === 0 && (
                    <div className="p-3 text-[12px] text-slate-400 italic">Nhấn để nhập tên mới...</div>
                  )}
                </div>
              )}
            </div>
            
            {/* Value Input */}
            <div className="flex-[2] relative">
              <input
                type="text"
                placeholder="Giá trị (VD: 16GB)"
                className="w-full p-3 rounded-xl border border-slate-200 focus:border-primary outline-none transition-all bg-slate-50/50"
                value={spec.value}
                onFocus={() => {
                  setActiveValueSuggestion(index);
                  setActiveKeySuggestion(null);
                }}
                onChange={(e) => {
                  onUpdate(index, "value", e.target.value);
                  setActiveValueSuggestion(index);
                }}
              />

              {activeValueSuggestion === index && (
                (() => {
                  const normalizedKey = spec.key.trim();
                  // Tìm key trong dữ liệu gợi ý (không phân biệt hoa thường)
                  const suggestionKey = Object.keys(SPEC_VALUE_SUGGESTIONS).find(
                    k => k.toLowerCase() === normalizedKey.toLowerCase()
                  );
                  const suggestions = suggestionKey ? SPEC_VALUE_SUGGESTIONS[suggestionKey] : null;

                  if (!suggestions) return null;

                  return (
                    <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-2xl z-[100] max-h-48 overflow-y-auto animate-in fade-in zoom-in duration-200">
                      <div className="p-3 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/50 border-b border-slate-50">Gợi ý cho {spec.key}</div>
                      {suggestions.filter(v => 
                        !spec.value || v.toLowerCase().includes(spec.value.toLowerCase())
                      ).map((suggestion) => (
                        <button
                          key={suggestion}
                          type="button"
                          className="w-full text-left p-3 hover:bg-slate-50 text-[13px] font-bold text-slate-600 border-b border-slate-50 last:border-0"
                          onClick={() => {
                            onUpdate(index, "value", suggestion);
                            setActiveValueSuggestion(null);
                          }}
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  );
                })()
              )}
            </div>
            
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => onRemove(index)}
              className="text-slate-400 hover:text-red-500"
            >
              <X size={16} />
            </Button>
          </div>
        ))}
      </div>

      <Button
        type="button"
        variant="light"
        onClick={onAdd}
        radius="xl"
        leftIcon={<Plus size={14} />}
        className="px-4 py-2.5 text-[12px] w-auto h-auto"
      >
        THÊM THÔNG SỐ KHÁC
      </Button>
    </div>
  );
};
