"use client";
import { useState, useEffect, useRef } from "react";

export const HoverAvatar = ({ src, name, className, status }: any) => {
  const [isHovered, setIsHovered] = useState(false);
  const [staticThumb, setStaticThumb] = useState<string | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // ✅ GIF ka pehla frame capture karke RAM bachane ka logic
  useEffect(() => {
    if (src && src.toLowerCase().endsWith('.gif')) {
      const img = new Image();
      img.src = src;
      img.crossOrigin = "anonymous"; 
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0);
        setStaticThumb(canvas.toDataURL("image/png")); // GIF frame ko photo bana diya
      };
    }
  }, [src]);

  const isGif = src?.toLowerCase().endsWith('.gif');

  return (
    <div 
      className={`relative flex-shrink-0 cursor-pointer ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="w-full h-full object-cover rounded-[inherit] overflow-hidden bg-[#000] relative">
        {src ? (
          <>
            {/* Jab hover NA ho, toh sirf static photo dikhao (GIF delete) */}
            {!isHovered ? (
              <img
                src={staticThumb || src} 
                alt={name}
                className="w-full h-full object-cover "
              />
            ) : (
              /* Jab hover HO, sirf tabhi browser GIF load karega */
              <img
                src={isGif ? `${src}?v=${Date.now()}` : src}
                alt={name}
                className="w-full h-full object-cover "
              />
            )}
          </>
        ) : (
          <div className="w-full h-full bg-indigo-600 flex items-center justify-center text-white font-bold uppercase text-xs">
            {name?.substring(0, 1)}
          </div>
        )}
      </div>

      {/* Status Dot Logic */}
      
    </div>
  );
};