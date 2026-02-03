"use client";
import { useState } from "react";
import { MessageSquare, UserPlus, MoreVertical, Sparkles, UserCheck, SendHorizonal } from "lucide-react";
import { StatusIcon } from "./StatusIcon";

interface GuestProfilePopoverProps {
  user: any; // Woh user jis pe click kiya gaya hai
  status: string;
  onClose: () => void;
  onSendMessage:(text: string) => void;
  onAddFriend: () => void;
  isFriend?: boolean; 
  
coords: { x: number; y: number } | null;}


export const GuestProfilePopover = ({ 
  user, 
  status, 
  onClose, 
  onSendMessage, 
  onAddFriend,
  coords,
  isFriend = false
}: GuestProfilePopoverProps) => {

  // 📋 Data Priority Logic: Check both user object and nested profiles
  const displayImage = user?.profiles?.image || user?.image || "/default-avatar.png";
  const displayBanner = user?.profiles?.banner || user?.banner;
  const displayName = user?.profiles?.name || user?.name || "User";
  const pronouns = user?.profiles?.pronouns || user?.pronouns;
  const about = user?.profiles?.about || user?.about;
  
  const pColor = user?.profiles?.primary_color || user?.primary_color || '#5865f2';
  const sColor = user?.profiles?.accent_color || user?.accent_color || pColor;
  const [messageText, setMessageText] = useState("");

const handleSendMessage = (e?: React.FormEvent) => {
  e?.preventDefault(); // Form submit hone se roke
  if (!messageText.trim()) return;

  onSendMessage(messageText); // Parent function ko text bhejien
  setMessageText(""); // Input clear karein
  onClose(); // Popover band karein
};

if (!coords || !user) return null;
  return (
    <>
<div 
        className="fixed inset-0 z-[500] cursor-default" 
        onClick={onClose} 
      />      
      <div 
        className="fixed p-[5px] w-[340px] rounded-xl  overflow-hidden z-[99999999999] animate-in fade-in slide-in-from-bottom-2 duration-200 border-t-0 border border-white/15"
        style={{ top: `${coords.y}px`, 
          left: `${coords.x}px`, background: `linear-gradient(180deg, ${pColor} 0%, ${sColor} 100%)` }}
      >
        <div className="relative z-10">
          {/* 🖼️ BANNER */}
          <div 
            className="h-[120px] rounded-md bg-cover bg-center relative" 
            style={{ 
              backgroundImage: displayBanner ? `url(${displayBanner})` : 'none',
              backgroundColor: displayBanner ? 'transparent' : 'rgba(0,0,0,0.4)'
            }} 
            
          >
            <div className=" absolute top-2 right-2 flex gap-2 mb-2">
                 <button 
  onClick={isFriend ? undefined : onAddFriend}
  className={`p-2 rounded-full text-white transition ${
    isFriend ? "bg-black/40 cursor-default" : "bg-black/40 hover:bg-black/60"
  }`}
>
  {isFriend ? <UserCheck size={18} /> : <UserPlus size={18} />}
</button>
                 <button className="p-2 bg-black/40 hover:bg-black/60 rounded-full text-white transition">
                    <MoreVertical size={18} />
                 </button>
              </div>
             {/* Gradient overlay for banner like Discord */}
             <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/40" />
          </div>
          
          <div className="px-2 pb-4">
            <div className="relative flex justify-between items-end -mt-14 mb-3">
              <div className="relative inline-block">
                <div 
                  className="w-[94px] h-[94px] rounded-full border-[6px] bg-[#2b2d31] overflow-hidden shadow-xl relative z-10"
                  style={{ borderColor: pColor }}
                >
                  <img src={displayImage} className="w-full h-full object-cover" alt="avatar" />
                </div>
                <div className="absolute bottom-2 right-3 scale-150 z-30">
                  <StatusIcon status={status as any} size="sm" />
                </div>
              </div>
              
            </div>

            {/* 🏷️ DATA CARD (Glass Effect) */}
            <div className="bg-[#111214]/70 backdrop-blur-2xl rounded-lg p-4 border border-white/10 shadow-inner">
              <div className="mb-3">
                <h3 className="text-white text-[20px] font-bold leading-tight">{displayName}</h3>
                <p className="text-[#dbdee1] text-[14px]">@{user?.name?.toLowerCase().replace(/\s/g, '')}</p>
                
                {/* 🌈 Pronouns (Naya Section) */}
                {pronouns && (
                  <p className="text-[12px] mt-1 text-white/90 font-medium bg-white/10 px-2 py-0.5 rounded-md inline-block">
                    {pronouns}
                  </p>
                )}
              </div>

              <div className="h-[1px] bg-white/5 my-3" />

              {/* 📝 About Me Section */}
              <div className="mb-4">
                <p className="text-[#b5bac1] text-[11px] font-bold uppercase mb-1 tracking-wider">About Me</p>
                <p className="text-white text-[13px] leading-relaxed whitespace-pre-wrap">
                  {about || "No bio yet."}
                </p>
              </div>

              {/* 🚀 QUICK MESSAGE INPUT (Like Screenshot) */}
              <div className="relative mt-4">
               <form onSubmit={handleSendMessage} className="relative mt-4">
  <input 
    type="text"
    value={messageText}
    onChange={(e) => setMessageText(e.target.value)}
    placeholder={`Message @${displayName}`}
    className="w-full bg-[#1e1f22] text-[14px] text-white p-3 pr-10 rounded-md outline-none border border-transparent focus:border-[#5865f2] transition"
  />
  <button 
    type="submit"
    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#b5bac1] hover:text-white transition-colors"
  >
     <SendHorizonal size={15} /> {/* Ya Send icon jo aapne SS mein dekha */}
  </button>
</form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};