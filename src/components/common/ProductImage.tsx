"use client";

import { CldImage } from "next-cloudinary";
import { Package } from "lucide-react";

interface ProductImageProps {
  src?: string | null;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
}

/**
 * Common component for rendering product images.
 * Handles both Cloudinary public IDs and external HTTP(S) URLs.
 */
export const ProductImage = ({
  src,
  alt,
  width = 300,
  height = 300,
  className = "",
  priority = false,
}: ProductImageProps) => {
  if (!src) {
    return (
      <div className={`flex items-center justify-center bg-slate-50 text-slate-300 ${className}`}>
        <Package size={Math.min(width, height) / 3} />
      </div>
    );
  }

  const isCloudinary = src.length > 3 && !src.startsWith("http") && !src.startsWith("/");

  if (isCloudinary) {
    return (
      <CldImage
        src={src}
        alt={alt}
        width={width}
        height={height}
        crop="pad"
        priority={priority}
        className={className}
      />
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      loading={priority ? "eager" : "lazy"}
    />
  );
};
