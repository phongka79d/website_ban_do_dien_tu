"use client";

import { useEditor, EditorContent, Extension } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import { Color } from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Link as LinkIcon,
  Unlink,
  Undo,
  Redo,
  Type,
  Palette,
  Type as FontSizeIcon,
  ChevronDown
} from "lucide-react";
import React, { useEffect, useMemo } from "react";

// --- CUSTOM FONT SIZE EXTENSION ---
const FontSize = Extension.create({
  name: 'fontSize',
  addOptions() {
    return {
      types: ['textStyle'],
    };
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: element => element.style.fontSize.replace(/['"]+/g, ''),
            renderHTML: attributes => {
              if (!attributes.fontSize) return {};
              return {
                style: `font-size: ${attributes.fontSize}`,
              };
            },
          },
        },
      },
    ];
  },
  addCommands() {
    return {
      setFontSize: fontSize => ({ chain }: any) => {
        return chain().setMark('textStyle', { fontSize }).run();
      },
      unsetFontSize: () => ({ chain }: any) => {
        return chain().setMark('textStyle', { fontSize: null }).removeEmptyTextStyle().run();
      },
    };
  },
});

interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
  label?: string;
  placeholder?: string;
}

const MenuBar = ({ editor }: { editor: any }) => {
  const [showColorPicker, setShowColorPicker] = React.useState(false);
  const [showFontSizePicker, setShowFontSizePicker] = React.useState(false);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowColorPicker(false);
      setShowFontSizePicker(false);
    };
    if (showColorPicker || showFontSizePicker) {
      window.addEventListener("click", handleClickOutside);
    }
    return () => window.removeEventListener("click", handleClickOutside);
  }, [showColorPicker, showFontSizePicker]);

  if (!editor) return null;

  const addLink = () => {
    const url = window.prompt("Nhập URL liên kết:");
    if (url) {
      editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    }
  };

  const colors = [
    { name: "Mặc định", color: "inherit" },
    { name: "Đỏ", color: "#ef4444" },
    { name: "Xanh lá", color: "#22c55e" },
    { name: "Xanh dương", color: "#3b82f6" },
    { name: "Vàng", color: "#eab308" },
    { name: "Cam", color: "#f97316" },
    { name: "Tím", color: "#a855f7" },
    { name: "Xám", color: "#64748b" },
    { name: "Đen", color: "#0f172a" },
  ];

  const fontSizes = ["12px", "14px", "16px", "18px", "20px", "24px", "32px"];

  return (
    <div className="flex flex-wrap items-center gap-1 p-2 border-b border-slate-100 bg-slate-50/50 backdrop-blur-sm sticky top-0 z-20">
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        active={editor.isActive("bold")}
        icon={<Bold size={16} />}
        title="Bôi đậm"
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        active={editor.isActive("italic")}
        icon={<Italic size={16} />}
        title="Nghiêng"
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        active={editor.isActive("underline")}
        icon={<UnderlineIcon size={16} />}
        title="Gạch chân"
      />

      <div className="w-px h-6 bg-slate-200 mx-1" />

      {/* Font Size Dropdown */}
      <div className="relative" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={() => {
            setShowFontSizePicker(!showFontSizePicker);
            setShowColorPicker(false);
          }}
          className={`h-8 px-2 rounded-lg transition-all flex items-center gap-1 text-[12px] font-bold ${showFontSizePicker ? "bg-white shadow-sm ring-1 ring-slate-200" : "text-slate-600 hover:bg-white hover:shadow-sm"
            }`}
          title="Cỡ chữ"
        >
          <FontSizeIcon size={16} />
          <span>{editor.getAttributes("textStyle").fontSize || "14px"}</span>
          <ChevronDown size={12} className={`transition-transform duration-200 ${showFontSizePicker ? "rotate-180" : ""}`} />
        </button>
        {showFontSizePicker && (
          <div className="absolute top-full left-0 mt-1 bg-white border border-slate-100 shadow-xl rounded-xl p-1 z-30 min-w-[100px] animate-in fade-in zoom-in duration-200">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest p-2 border-b border-slate-50 mb-1">Kích thước</div>
            {fontSizes.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => {
                  (editor as any).chain().focus().setFontSize(size).run();
                  setShowFontSizePicker(false);
                }}
                className={`w-full text-left px-3 py-1.5 rounded-md text-[12px] font-medium hover:bg-slate-50 transition-colors flex justify-between items-center ${editor.getAttributes("textStyle").fontSize === size ? "text-primary bg-primary/5" : "text-slate-600"
                  }`}
              >
                {size}
                {editor.getAttributes("textStyle").fontSize === size && <div className="w-1 h-1 rounded-full bg-primary" />}
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                (editor as any).chain().focus().unsetFontSize().run();
                setShowFontSizePicker(false);
              }}
              className="w-full text-left px-3 py-2 rounded-md text-[10px] font-bold text-red-500 hover:bg-red-50 transition-colors mt-1 border-t border-slate-50"
            >
              Đặt lại mặc định
            </button>
          </div>
        )}
      </div>

      <div className="w-px h-6 bg-slate-200 mx-1" />

      {/* Color Picker Dropdown */}
      <div className="relative" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={() => {
            setShowColorPicker(!showColorPicker);
            setShowFontSizePicker(false);
          }}
          className={`p-2 rounded-lg transition-all flex items-center gap-1 ${showColorPicker ? "bg-white shadow-sm ring-1 ring-slate-200" : "text-slate-600 hover:bg-white hover:shadow-sm"
            }`}
          title="Màu chữ"
        >
          <Palette size={16} />
          <div
            className="w-3 h-3 rounded-full border border-slate-200 shadow-sm"
            style={{ backgroundColor: editor.getAttributes("textStyle").color || "#0f172a" }}
          />
          <ChevronDown size={12} className={`transition-transform duration-200 ${showColorPicker ? "rotate-180" : ""}`} />
        </button>
        {showColorPicker && (
          <div className="absolute top-full left-0 mt-1 bg-white border border-slate-100 shadow-xl rounded-2xl p-3 z-30 min-w-[160px] animate-in fade-in zoom-in duration-200">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Bảng màu</div>
            <div className="grid grid-cols-5 gap-2">
              {colors.map((c) => (
                <button
                  key={c.color}
                  type="button"
                  onClick={() => {
                    editor.chain().focus().setColor(c.color === "inherit" ? "" : c.color).run();
                    setShowColorPicker(false);
                  }}
                  className={`w-6 h-6 rounded-lg border transition-all hover:scale-125 hover:z-10 ${(editor.getAttributes("textStyle").color === c.color || (c.color === "inherit" && !editor.getAttributes("textStyle").color))
                      ? "border-primary ring-2 ring-primary/20 scale-110"
                      : "border-slate-100"
                    }`}
                  style={{ backgroundColor: c.color === "inherit" ? "white" : c.color }}
                  title={c.name}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="ml-auto flex items-center gap-1">
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          icon={<Undo size={16} />}
          title="Hoàn tác"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          icon={<Redo size={16} />}
          title="Làm lại"
        />
      </div>
    </div>
  );
};

const ToolbarButton = ({ onClick, active, icon, title, disabled }: any) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={`p-2 rounded-lg transition-all ${active
        ? "bg-primary text-white shadow-md shadow-primary/20"
        : "text-slate-600 hover:bg-white hover:shadow-sm disabled:opacity-30 disabled:hover:bg-transparent"
      }`}
  >
    {icon}
  </button>
);

const extensions = [
  StarterKit.configure({}),
  Underline.configure(),
  TextStyle.configure(),
  Color.configure(),
  FontSize,
  Link.configure({
    openOnClick: false,
    HTMLAttributes: {
      class: "text-primary hover:underline",
    },
  }),
];

export default function RichTextEditor({ value, onChange, label, placeholder }: RichTextEditorProps) {
  const editor = useEditor({
    extensions,
    immediatelyRender: false,
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "prose prose-slate max-w-none p-5 min-h-[400px] outline-none text-[14px] font-medium leading-relaxed bg-white/50",
      },
    },
  });

  // Đồng bộ value từ ngoài vào
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  return (
    <div className="space-y-2 pt-2">
      {label && (
        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
          {label}
        </label>
      )}
      <div className="w-full rounded-[24px] border border-slate-100 overflow-hidden focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/5 transition-all bg-slate-50/30">
        <MenuBar editor={editor} />
        <EditorContent editor={editor} />
      </div>
      <p className="text-[10px] text-slate-400 italic font-medium px-2">
        * Bôi đen văn bản để tùy chỉnh nhanh hoặc sử dụng các phím tắt (Ctrl+B, Ctrl+I...)
      </p>
    </div>
  );
}
