import React from "react";
import { CldUploadWidget, CldImage } from "next-cloudinary";

interface ImageUploadProps {
  label: string;
  imageUrl: string;
  categoryFolder?: string;
  onSuccess: (result: any) => void;
  onClose: () => void;
  onRemove: () => void;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  label,
  imageUrl,
  categoryFolder,
  onSuccess,
  onClose,
  onRemove
}) => {
  return (
    <div className="space-y-4">
      <label className="text-sm font-bold text-slate-700 uppercase tracking-wider block">{label}</label>

      {imageUrl ? (
        <div className="relative w-full max-w-sm aspect-video rounded-2xl overflow-hidden border-2 border-primary shadow-xl group">
          <CldImage
            src={imageUrl}
            width={800}
            height={450}
            crop="fill"
            alt="Preview"
            className="object-cover w-full h-full"
          />
          <button
            type="button"
            onClick={onRemove}
            className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white font-bold transition-all backdrop-blur-sm"
          >
            <span className="text-2xl mb-1">✕</span>
            Thay đổi hình ảnh
          </button>
        </div>
      ) : (
        <CldUploadWidget
          uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
          options={{
            folder: categoryFolder || "web_ban_do_dien_tu/products/uncategorized",
          }}
          onSuccess={onSuccess}
          onClose={onClose}
        >
          {({ open }) => (
            <button
              type="button"
              onClick={() => open()}
              className="w-full py-16 border-2 border-dashed border-slate-200 rounded-3xl text-slate-400 font-medium hover:border-primary hover:text-primary hover:bg-primary/5 transition-all flex flex-col items-center justify-center gap-3 group"
            >
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-2xl group-hover:bg-primary group-hover:text-white transition-colors">
                +
              </div>
              <div className="text-center">
                <p className="text-slate-600 font-bold">Tải ảnh lên từ Cloudinary</p>
                <p className="text-xs text-slate-400 mt-1">Yêu cầu ảnh chất lượng cao, định dạng PNG/JPG</p>
              </div>
            </button>
          )}
        </CldUploadWidget>
      )}
    </div>
  );
};
