"use client";
import { useState, useRef, useEffect } from "react";
import { Sparkles, UserRound, IdCard, Palette } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

interface ProfilesTabProps {
  profile: any;
  onStateChange?: (changed: boolean, data: any) => void;
}

export const ProfilesTab = ({ profile, onStateChange }: ProfilesTabProps) => {
  // --- States ---
  const [displayName, setDisplayName] = useState(profile?.name || "");
  const [pronouns, setPronouns] = useState(profile?.pronouns || "");
  const [aboutMe, setAboutMe] = useState(profile?.about || "");
  const [primaryColor, setPrimaryColor] = useState(profile?.primary_color || "#5865f2");
  const [accentColor, setAccentColor] = useState(profile?.accent_color || "#23a559");
  
  const [nameplate, setNameplate] = useState(profile?.nameplate || "default");
  const [decoration, setDecoration] = useState(profile?.decoration || "none");
  const [profileEffect, setProfileEffect] = useState(profile?.profile_effect || "none");

  const [previewAvatar, setPreviewAvatar] = useState(profile?.image || "");
  const [previewBanner, setPreviewBanner] = useState(profile?.banner || "");

  const avatarRef = useRef<HTMLInputElement>(null);
  const bannerRef = useRef<HTMLInputElement>(null);

  const decorationList = ["none", "cyberpunk", "flowers", "autumn", "star-eyes"];
  const effectList = ["none", "sakura", "glitch", "fire", "snow"];

  const nameplateStyles: any = {
  default: "bg-[#1e1f22]",
  premium: "bg-gradient-to-r from-[#5865f2] to-[#eb459e] border border-white/20",
  glass: "bg-white/10 backdrop-blur-md border border-white/10",
  neon: "bg-[#1e1f22] border-b-2 border-[#00d4ff] shadow-[0_4px_10px_rgba(0,212,255,0.3)]",
  // 🟢 Naya Atang Space Style
  space: "relative overflow-hidden bg-[#020205] border border-indigo-500/30", 
  sunset: "bg-gradient-to-br from-[#ff5f6d] to-[#ffc371]"
};

  // --- 🔥 Change Tracker Logic ---
  useEffect(() => {
    const isChanged =
      displayName !== (profile?.name || "") ||
      pronouns !== (profile?.pronouns || "") ||
      aboutMe !== (profile?.about || "") ||
      nameplate !== (profile?.nameplate || "default") ||
      primaryColor !== (profile?.primary_color || "#5865f2") ||
      accentColor !== (profile?.accent_color || "#23a559") ||
      decoration !== (profile?.decoration || "none") ||
      profileEffect !== (profile?.profile_effect || "none") ||
      previewAvatar !== (profile?.image || "") ||
      previewBanner !== (profile?.banner || "");

    // Parent (SettingsModal) ko updated data bhejna
    onStateChange?.(isChanged, {
      id: profile.id,
      name: displayName,
      pronouns,
      about: aboutMe,
      nameplate,
      primary_color: primaryColor,
      accent_color: accentColor,
      decoration,
      profile_effect: profileEffect,
      image: previewAvatar,
      banner: previewBanner
    });
  }, [
    displayName, pronouns, aboutMe, nameplate, primaryColor, accentColor,
    decoration, profileEffect, previewAvatar, previewBanner, profile.id
  ]);

  useEffect(() => {
  if (profile) {
    // Database se aaye huye colors set karein
    if (profile.primary_color) setPrimaryColor(profile.primary_color);
    if (profile.accent_color) setAccentColor(profile.accent_color);
  } else if (profile) {
    // Agar profiles nested nahi hai toh direct user object se
    if (profile.primary_color) setPrimaryColor(profile.primary_color);
    if (profile.accent_color) setAccentColor(profile.accent_color);
  }
}, [profile]);

const handleImagePreview = (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'banner') => {
  const file = e.target.files?.[0];
  if (file) {
    if (file.size > 5 * 1024 * 1024) return toast.error("File too large (Max 5MB)");
    
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      if (type === 'avatar') setPreviewAvatar(base64);
      else setPreviewBanner(base64);
      
      // Force change detection
      toast.success(`${type === 'avatar' ? 'Avatar' : 'Banner'} preview updated!`);
    };
    reader.readAsDataURL(file);
  }
};
  

  return (
    <div className="flex flex-col lg:flex-row gap-8 pb-32 animate-in slide-in-from-right-4 duration-300">
      
      {/* --- 📝 LEFT: EDIT OPTIONS --- */}
      <div className="flex-1 space-y-8 max-w-[450px]">

        {/* 🎨 PROFILE THEME (SPLIT COLOR PICKER) */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-[#dbdee1]">
            <Palette size={18} className="text-[#5865f2]" />
            <h3 className="font-bold text-[12px] uppercase tracking-wider">Profile Theme</h3>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative w-35 h-14 gap-3 overflow-hidden shadow-xl flex">
              <div className="flex-1 relative rounded-md transition-transform hover:scale-105" style={{ backgroundColor: primaryColor }}>
                <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
              </div>
              <div className="flex-1 relative rounded-md transition-transform hover:scale-105" style={{ backgroundColor: accentColor }}>
                <input type="color" value={accentColor} onChange={(e) => setAccentColor(e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
              </div>
            </div>
            <p className="text-[11px] text-[#b5bac1] leading-tight">Click boxes to set <br/><span className="text-white font-semibold">Primary</span> & <span className="text-white font-semibold">Accent</span> colors</p>
          </div>
        </section>

        {/* 🏷️ NAMEPLATE */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-[#dbdee1]">
            <IdCard size={18} className="text-[#5865f2]" />
            <h3 className="font-bold text-[12px] uppercase tracking-wider">Nameplate Style</h3>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {Object.keys(nameplateStyles).map((style) => (
              <button
                key={style}
                onClick={() => setNameplate(style)}
                className={`py-2 rounded-md text-[10px] font-bold capitalize transition-all border-2
                  ${nameplate === style ? "border-[#5865f2] scale-105 text-white" : "border-white/5 opacity-60 text-[#b5bac1] hover:opacity-100"}`}
                style={{ background: nameplateStyles[style].includes('gradient') ? nameplateStyles[style].split(' ')[1] : '#1e1f22' }}
              >
                {style}
              </button>
            ))}
          </div>
        </section>

        {/* 📝 INFO */}
        <div className="space-y-4">
          <div>
            <label className="text-[12px] font-bold text-[#b5bac1] uppercase mb-2 block tracking-wider">Display Name</label>
            <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="w-full bg-[#1e1f22] p-2.5 rounded text-white outline-none focus:ring-1 focus:ring-[#5865f2] transition" />
          </div>
          <div>
            <label className="text-[12px] font-bold text-[#b5bac1] uppercase mb-2 block tracking-wider">Pronouns</label>
            <input value={pronouns} onChange={(e) => setPronouns(e.target.value)} placeholder="Add pronouns" className="w-full bg-[#1e1f22] p-2.5 rounded text-white outline-none focus:ring-1 focus:ring-[#5865f2] transition" />
          </div>
        </div>

        {/* 🖼️ ASSETS */}
        <div className="space-y-6">
          <div className="h-[1px] bg-white/5" />
          <div>
            <label className="text-[12px] font-bold text-[#b5bac1] uppercase mb-2 block tracking-wider">Avatar</label>
            <div className="flex gap-2">
              <button onClick={() => avatarRef.current?.click()} className="bg-[#5865f2] hover:bg-[#4752c4] text-white px-4 py-1.5 rounded text-[13px] font-medium transition">Change Avatar</button>
              <button onClick={() => setPreviewAvatar("")} className="text-[#dbdee1] hover:underline text-[13px] px-2">Remove</button>
            </div>
          </div>
          <div>
            <label className="text-[12px] font-bold text-[#b5bac1] uppercase mb-2 block tracking-wider">Profile Banner</label>
            <div className="flex gap-2">
              <button onClick={() => bannerRef.current?.click()} className="bg-[#5865f2] hover:bg-[#4752c4] text-white px-4 py-1.5 rounded text-[13px] font-medium transition">Change Banner</button>
              <button onClick={() => setPreviewBanner("")} className="text-[#dbdee1] hover:underline text-[13px] px-2">Remove</button>
            </div>
          </div>
        </div>

        {/* ✨ COSMETICS */}
        <div className="space-y-6">
          <div className="h-[1px] bg-white/5" />
          <div>
            <label className="text-[12px] font-bold text-[#b5bac1] uppercase mb-3 block flex items-center gap-2">
              <UserRound size={14}/> Avatar Decoration
            </label>
            <div className="grid grid-cols-3 gap-2">
              {decorationList.map(dec => (
                <button key={dec} onClick={() => setDecoration(dec)} className={`py-2 rounded text-[11px] capitalize border transition-all ${decoration === dec ? 'border-[#5865f2] bg-[#5865f2]/10 text-white' : 'border-white/5 bg-[#1e1f22] text-[#b5bac1] hover:bg-[#2b2d31]'}`}>
                  {dec}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[12px] font-bold text-[#b5bac1] uppercase mb-3 block flex items-center gap-2">
              <Sparkles size={14}/> Profile Effect
            </label>
            <select value={profileEffect} onChange={(e) => setProfileEffect(e.target.value)} className="w-full bg-[#1e1f22] p-2.5 rounded text-white outline-none border border-white/5 focus:ring-1 focus:ring-[#5865f2] capitalize cursor-pointer">
              {effectList.map(eff => <option key={eff} value={eff}>{eff}</option>)}
            </select>
          </div>
        </div>

        {/* 🖊️ ABOUT */}
        <div>
          <label className="text-[12px] font-bold text-[#b5bac1] uppercase mb-2 block tracking-wider">About Me</label>
          <textarea value={aboutMe} onChange={(e) => setAboutMe(e.target.value)} maxLength={190} className="w-full bg-[#1e1f22] p-3 rounded text-white outline-none resize-none h-32 custom-scrollbar text-[14px] focus:ring-1 focus:ring-[#5865f2]" placeholder="Tell us about yourself..." />
          <p className="text-right text-[#b5bac1] text-[12px] mt-1 font-mono">{190 - aboutMe.length}</p>
        </div>
      </div>

      {/* --- 👁️ RIGHT: LIVE PREVIEW --- */}
      <div className="w-full lg:w-[320px] shrink-0">
        <label className="text-[12px] font-bold text-[#b5bac1] uppercase mb-2 block">Preview</label>
        <div className="rounded-xl overflow-hidden shadow-2xl border border-black/40 sticky top-4 bg-[#111214] transition-all duration-500">
          
          {/* Banner with Effect Overlay */}
          <div className="relative h-24 bg-cover bg-center transition-all duration-500" style={{ backgroundImage: previewBanner ? `url(${previewBanner})` : 'none', backgroundColor: !previewBanner ? primaryColor : 'transparent' }}>
             {profileEffect !== "none" && <div className="absolute inset-0 bg-white/10 animate-pulse pointer-events-none" />}
             <div className="absolute inset-0 bg-black/20" /> {/* Dark tint like Discord */}
          </div>
          
          <div className="px-4 pb-4 relative">
            {/* Avatar & Decoration */}
            <div className="relative -mt-10 mb-2 inline-block">
              <div className="w-20 h-20 rounded-full border-[6px] border-[#111214] bg-[#2b2d31] overflow-hidden relative z-10">
                <img src={previewAvatar || "/default-avatar.png"} className="w-full h-full object-cover" />
              </div>
              {decoration !== "none" && (
                <div className="absolute -inset-3 border-4 border-[#5865f2] rounded-full z-20 pointer-events-none opacity-80 animate-pulse" />
              )}
              {/* Online Dot with Accent Color */}
              <div className="absolute bottom-1 right-1 w-5 h-5 rounded-full border-[4px] border-[#111214] z-30" style={{ backgroundColor: accentColor }} />
            </div>

            {/* Nameplate/Username Area (Dynamic style) */}
           {/* Nameplate/Username Area (Dynamic style) */}
<div className={`rounded-lg p-3 transition-all duration-500 relative overflow-hidden ${nameplateStyles[nameplate]}`}>
  
  {/* 🌌 AGAR SPACE NAMEPLATE SELECT HAI TOH YE ANIMATION DIKHAO */}
  {nameplate === "space" && (
    <div className="absolute inset-0 pointer-events-none">
      {/* Moving Nebula Glow */}
      <motion.div 
        animate={{ opacity: [0.2, 0.5, 0.2], scale: [1, 1.2, 1] }}
        transition={{ duration: 5, repeat: Infinity }}
        className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(88,101,242,0.3),_transparent_70%)]"
      />
      {/* Twinkling Tiny Stars */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-0.5 h-0.5 bg-white rounded-full"
          style={{ top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%` }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: Math.random() * 2 + 1, repeat: Infinity, delay: Math.random() * 2 }}
        />
      ))}
      {/* Shooting Star effect for Nameplate */}
      <motion.div 
        animate={{ x: ["-100%", "200%"], y: ["-100%", "200%"] }}
        transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 4 }}
        className="absolute w-20 h-[1px] bg-gradient-to-r from-transparent via-white to-transparent -rotate-45"
      />
    </div>
  )}
  </div>
          </div>
        </div>
      </div>
      

      {/* Hidden File Inputs */}
      <input type="file" ref={avatarRef} hidden accept="image/*" onChange={(e) => handleImagePreview(e, 'avatar')} />
      <input type="file" ref={bannerRef} hidden accept="image/*" onChange={(e) => handleImagePreview(e, 'banner')} />
    </div>
  );
};