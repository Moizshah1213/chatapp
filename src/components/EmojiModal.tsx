"use client";
import EmojiPicker, { Theme} from "emoji-picker-react";

export const EmojiModal = ({ onEmojiSelect }: { onEmojiSelect: (emoji: string) => void }) => {
  return (
  <div className="
    /* ✅ MOBILE: Screen ke bottom pe fixed aur center */
    fixed bottom-20 left-4 right-4 z-[999] 
    /* ✅ DESKTOP: Input bar ke upar absolute */
    md:absolute md:bottom-5 md:right-0 md:left-auto md:w-auto
    shadow-2xl border border-black/40 rounded-xl overflow-hidden 
    animate-in fade-in zoom-in-95 duration-100
  ">
    <EmojiPicker 
      theme={Theme.DARK} 
      onEmojiClick={(data) => onEmojiSelect(data.emoji)}
      /* ✅ Dynamic Width: Mobile pe screen width - 32px, Desktop pe 320px */
      width={typeof window !== 'undefined' && window.innerWidth < 768 ? (window.innerWidth - 32) : 320}
      height={400}
      lazyLoadEmojis={true}
      searchPlaceholder="Search emojis..."
      skinTonesDisabled={true}
      previewConfig={{ showPreview: false }} // Mobile pe space bachane ke liye preview hide
    />
  </div>
);
};