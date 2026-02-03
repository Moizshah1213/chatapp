"use client";
import { useState, useRef } from "react";
import { Search, Clock, Sticker as StickerIcon, Plus, Image as ImageIcon } from "lucide-react";

const STICKER_CATEGORIES = [
  {
    name: "Animated Pepe",
    stickers: [
      { id: "s1", url: "https://fonts.gstatic.com/s/e/notoemoji/latest/1f44b/512.gif" }, // Waving Hand
      { id: "s2", url: "https://fonts.gstatic.com/s/e/notoemoji/latest/1f604/512.gif" }, // Grinning
      { id: "s3", url: "https://fonts.gstatic.com/s/e/notoemoji/latest/1f602/512.gif" }, // Laughing
    ]
  },
  {
    name: "Discord Style",
    stickers: [
       { id: "d1", url: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Hand%20gestures/Victory%20Hand.png" },
       { id: "d2", url: "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Smilies/Beaming%20Face%20with%20Smiling%20Eyes.png" }
    ]
  }
];

export const StickerModal = ({ onStickerSelect, onCustomUpload }: { 
  onStickerSelect: (url: string) => void;
  onCustomUpload?: (file: File) => void;
}) => {
  const [search, setSearch] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
  <div className={`
    /* ✅ POSITIONING: Mobile pe fixed bottom, Desktop pe absolute */
    fixed bottom-20 left-4 right-4 
    md:absolute md:bottom-5 md:right-0 md:left-auto
    
    /* ✅ WIDTH: Mobile pe auto (padding ke sath), Desktop pe 400px */
    md:w-[400px] h-[420px] sm:h-[480px] 
    
    bg-[#2b2d31] rounded-xl shadow-2xl border border-black/20 
    flex flex-col overflow-hidden 
    
    /* ✅ Z-INDEX: Boht high taake keyboard/input ke upar rahe */
    z-[110] 
    
    animate-in fade-in zoom-in-95 duration-150
  `}>
    
    {/* Header & Search */}
    <div className="p-3 shadow-md bg-[#2b2d31] z-10 shrink-0">
      <div className="bg-[#1e1f22] rounded flex items-center px-3 py-1.5 mb-2 sm:mb-3">
        <input 
          className="bg-transparent outline-none text-sm w-full text-[#dbdee1] placeholder-[#80848e]" 
          placeholder="Search stickers" 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Search size={16} className="text-[#80848e]" />
      </div>
    </div>

    {/* Stickers Grid */}
    <div className="flex-1 overflow-y-auto p-3 sm:p-4 no-scrollbar bg-[#2b2d31]">
      
      {/* --- CUSTOM STICKER SECTION --- */}
      <div className="mb-4 sm:mb-6">
        <h3 className="text-[11px] sm:text-[12px] font-medium text-[#23a559] uppercase tracking-wider mb-2 px-1 flex items-center gap-2">
           <Plus size={14} /> My Custom Stickers
        </h3>
        <div className="grid grid-cols-4 sm:grid-cols-3 gap-2 sm:gap-3">
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="relative aspect-square bg-[#313338] border-2 border-dashed border-white/10 hover:border-[#23a559]/50 rounded-lg flex flex-col items-center justify-center gap-1 group transition-all"
          >
            <ImageIcon size={20} className="text-[#949ba4] group-hover:text-[#23a559]" />
            <span className="text-[9px] text-[#949ba4] font-medium">Upload</span>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*"
              onChange={(e) => e.target.files?.[0] && onCustomUpload?.(e.target.files[0])}
            />
          </button>
        </div>
      </div>

      {/* --- CATEGORIES --- */}
      {STICKER_CATEGORIES.map((cat) => (
        <div key={cat.name} className="mb-4 sm:mb-6">
          <h3 className="text-[11px] sm:text-[12px] font-medium text-[#949ba4] uppercase tracking-wider mb-2 px-1">
            {cat.name}
          </h3>
          <div className="grid grid-cols-4 sm:grid-cols-3 gap-2 sm:gap-3">
            {cat.stickers.map((sticker) => (
              <div 
                key={sticker.id}
                onClick={() => onStickerSelect(sticker.url)}
                className="relative aspect-square bg-[#35373c] hover:bg-[#404249] rounded-lg p-1.5 sm:p-2 cursor-pointer transition-all group"
              >
                <img 
                  src={sticker.url} 
                  alt="sticker" 
                  className="w-full h-full object-contain group-hover:scale-110 transition-transform"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>

    {/* Footer Navigation */}
    <div className="h-10 sm:h-12 bg-[#232428] flex items-center px-3 gap-4 border-t border-black/20 shrink-0">
      <Clock size={18} className="text-[#b5bac1] hover:text-white cursor-pointer" />
      <StickerIcon size={18} className="text-white cursor-pointer" />
      <div className="h-4 w-[1px] bg-white/10" />
      <div className="w-6 h-6 sm:w-7 sm:h-7 rounded bg-[#5865f2] flex items-center justify-center cursor-pointer shadow-lg hover:bg-[#4752c4] transition">
          <Plus size={16} className="text-white" />
      </div>
    </div>
  </div>
);
};