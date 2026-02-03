"use client";
import { PenBox, LogOut, ChevronRight, Sparkles } from "lucide-react";
import { StatusIcon } from "./StatusIcon";
import { useRef } from "react";

interface UserProfilePopoverProps {
  user: any;
  status: string;
  onClose: () => void;
  onOpenSettings: () => void;
  onOpenStatusMenu: () => void;
  onSignOut: () => void;
  
}

export const UserProfilePopover = ({ 
  user, 
  status, 
  onClose, 
  onOpenSettings, 
  onOpenStatusMenu, 
  onSignOut,
 
}: UserProfilePopoverProps) => {

  // 📋 Decorations Mapping
  const decorations: any = {
    cyberpunk: "/decorations/cyber.png",
    flowers: "/decorations/flowers.png",
    autumn: "/decorations/autumn.png",
    "star-eyes": "/decorations/stars.png"
  };

  const displayImage = user?.profiles?.avatar || user?.profiles?.image || user?.image || "/default-avatar.png";
  const displayName = user?.profiles?.name || user?.profiles?.display_name || user?.name || "User";
  const displayBanner = user?.profiles?.banner || user?.banner;
const pColor = user?.profiles?.primary_color || user?.primary_color || '#5865f2';
const sColor = user?.profiles?.accent_color || user?.accent_color || pColor;
const pronouns = user?.profiles?.pronouns || user?.pronouse;

  
 const dynamicBackground = {
  // Agar banner image hai toh wo dikhao, warna dono colors ka gradient
  background: `linear-gradient(180deg, ${pColor} 0%, ${sColor} 100%)`,
};

  return (
    <>
      <div className="fixed inset-0 z-[100] w-full" onClick={onClose} />
      
      {/* 🟢 MAIN CARD */}
      <div 
        className="absolute bottom-[85px] p-[5px] -left-5 w-[320px] border-b-0 rounded-xl shadow-2xl overflow-hidden z-[101] animate-in fade-in slide-in-from-bottom-2 duration-200 border border-white/15"
        style={dynamicBackground}
      >
        
        {/* ✨ PROFILE EFFECT LAYER (Overlay) */}
        {user?.profile_effect && user?.profile_effect !== "none" && (
          <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
            {/* Sakura ya Fire jese effects ke liye yahan classes handle honge */}
            <div className={`absolute inset-0 opacity-40 mix-blend-screen bg-[url('/effects/${user.profile_effect}.gif')] bg-cover`} />
            <div className="absolute inset-0 bg-black/10 animate-pulse" />
          </div>
        )}

        <div className="relative z-10">
          {/* 🖼️ BANNER AREA */}
          <div 
            className="h-[130px] rounded-md bg-cover bg-center transition-all duration-500 relative" 
            style={{ 
              backgroundImage: displayBanner ? `url(${displayBanner})` : 'none',
              backgroundColor: displayBanner ? 'transparent' : 'rgba(0,0,0,0.2)'
            }} 
          >
             {/* Banner tint to make avatar pop */}
             <div className="absolute inset-0 bg-black/20" />
          </div>
          
          <div className="px-4 pb-4">
            {/* 👤 AVATAR + DECORATION */}
            <div className="relative flex justify-between items-end -mt-10 mb-3">
              <div className="relative inline-block">
                {/* Decoration Overlay */}
                {user?.decoration && user?.decoration !== "none" && (
                  <img 
                    src={decorations[user.decoration]} 
                    className="absolute -inset-3 w-[calc(100%+24px)] h-[calc(100%+24px)] z-20 pointer-events-none"
                    alt=""
                  />
                )}
                
                <div 
                  className="w-[90px] h-[90px] rounded-full border-[6px] bg-[#2b2d31] overflow-hidden shadow-xl relative z-10"
                  style={{ borderColor: user?.primary_color || "#111214" }}
                >
                  <img src={displayImage || "/default-avatar.png"} className="w-full h-full object-cover" alt="avatar" />
                </div>

                <div className="absolute bottom-2 right-3 translate-x-1 translate-y-1 scale-140 z-30">
                  <StatusIcon status={status as any} size="sm" />
                </div>
              </div>
            </div>

            {/* 🏷️ CONTENT AREA (Modern Dark Glass) */}
            <div className=" rounded-lg p-0 ">
              <div className="mb-2 pl-1">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-white text-[18px] font-normal leading-tight">{displayName}</h3>
                </div>
                <p className="text-[#dbdee1] text-[13px] font-medium opacity-80">@{user?.email?.split('@')[0]}</p>
                {pronouns && (
                  <p className="text-[13px] mt-1 text-white/90 font-normal bg-white/10 px-2 py-0.5 rounded-full inline-block">
                    {pronouns}
                  </p>
                )}
              </div>

              {/* 📝 ABOUT ME SECTION */}
              {user?.about && (
                <>
                  <div className=" my-3 px-2" />
                  <div className="mb-1">
                    <p className="text-[#b5bac1] text-[10px] font-normal uppercase mb-1 tracking-wider">About Me</p>
                    <p className="text-white text-[12px] leading-relaxed whitespace-pre-wrap line-clamp-4 overflow-y-auto custom-scrollbar pr-1 max-h-[80px]">
                      {user.about}
                    </p>
                  </div>
                </>
              )}


              <div className=" my-3 px-2" />

              

              {/* 🔘 MENU ACTIONS */}
              <div className="space-y-1 items-center flex justify-center flex-col backdrop-blur-md bg-[#2b2b2ba3] rounded-md ">
                <div
                  onClick={onOpenSettings}
                  className="w-full flex items-center py-3  justify-between px-4 hover:bg-white/10 hover:rounded-md text-white text-[13px] font-seminormal transition-all group"
                >
                  <div className="flex items-center gap-3 ">
                    <PenBox size={16} /> Edit Profile
                  </div>

                </div>
                <div className=" h-[1px] bg-white/9 w-[95%]" />

                
                <button

                  onClick={onOpenStatusMenu}
  className="w-full flex items-center justify-between py-3 px-4  hover:bg-white/10 rounded-md text-white text-[13px] font-seminormal transition-all group"
>
  <div className="flex items-center gap-3 ">
    <StatusIcon status={status as any} /> Set Status
  </div>
  <ChevronRight size={14} />
</button>

                <div className=" h-[1px] bg-white/9 w-[95%]" />

                <button 
                  onClick={onSignOut}
                  className="w-full flex items-center gap-3 py-3 px-4 hover:bg-red-500/20 rounded-md text-red-400 text-[13px] font-medium transition-all"
                >
                  <LogOut size={16} /> Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};