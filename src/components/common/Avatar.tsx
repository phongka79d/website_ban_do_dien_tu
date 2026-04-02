"use client";

import React from "react";
import { CldImage } from "next-cloudinary";
import { User as UserIcon } from "lucide-react";

interface AvatarProps {
  src?: string | null;
  alt?: string;
  size?: number;
  className?: string;
  fallbackName?: string | null;
}

/**
 * Global Avatar Component
 * Handles both Cloudinary Public IDs and external HTTP URLs automatically.
 */
export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = "User Avatar",
  size = 40,
  className = "",
  fallbackName
}) => {
  const containerClass = `relative overflow-hidden rounded-full flex items-center justify-center bg-slate-100 border border-slate-200 shrink-0 ${className}`;

  if (!src) {
    return (
      <div className={containerClass} style={{ width: size, height: size }}>
        {fallbackName ? (
          <span className="text-primary font-black uppercase" style={{ fontSize: size * 0.4 }}>
            {fallbackName.charAt(0)}
          </span>
        ) : (
          <UserIcon size={size * 0.6} className="text-slate-400" />
        )}
      </div>
    );
  }

  // Smart Rendering Logic
  const isHttp = src.startsWith("http");

  return (
    <div className={containerClass} style={{ width: size, height: size }}>
      {isHttp ? (
        <img
          src={src}
          alt={alt}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      ) : (
        <CldImage
          src={src}
          width={size}
          height={size}
          crop="fill"
          alt={alt}
          className="h-full w-full object-cover"
        />
      )}
    </div>
  );
};
