"use client";
import { useState, useEffect, useRef } from "react";
import { Mic, Headphones, Settings, PenBox, LogOut, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client"; // ✅ Supabase Browser Client
import { useRouter } from "next/navigation";
import { StatusIcon } from "./StatusIcon";
import SettingsModal from "./SettingsModal";
import { UserProfilePopover } from "./UserProfilePopover";

interface UserControlProps {
  currentUser: any;
  channel: any;
  onStatusUpdate: (newStatus: string) => void;
}

type UserStatus = "ONLINE" | "IDLE" | "DND" | "OFFLINE";

export const UserControl = ({ currentUser, channel, onStatusUpdate }: UserControlProps) => {
  // 1. Next-Auth ki dependency khatam
  const supabase = createClient();
  const router = useRouter();
  const [status, setStatus] = useState<UserStatus>("ONLINE");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const displayImage = currentUser?.profiles?.image || currentUser?.image;
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // 2. Initial Status set karein
  useEffect(() => {
    if (currentUser?.statusPreference) {
      setStatus(currentUser.statusPreference as UserStatus);
    }
  }, [currentUser]);

  const updateStatus = async (newStatus: UserStatus) => {
    try {
      setStatus(newStatus); 
      setIsMenuOpen(false);
      onStatusUpdate(newStatus);

      // Realtime Presence Update
      if (channel && currentUser?.id) {
        await channel.track({ 
          id: currentUser.id, 
          name: currentUser.name,
          status: newStatus,
          online_at: new Date().toISOString()
        });
      }

      // Database update
      await fetch("/api/user/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

    } catch (err) {
      console.error("Status update failed:", err);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
   
  // Agar user data nahi hai toh render na karein
  if (!currentUser) return null;

  return (
    <div className="relative w-full px-2 pb-3 font-sans">
      
      <SettingsModal 
        user={currentUser} 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />

      {/* 1. PROFILE POPOVER */}
      {isProfileOpen && (
  <UserProfilePopover 
    user={currentUser}
    status={status}
    onClose={() => setIsProfileOpen(false)}
    onOpenSettings={() => { setIsProfileOpen(false); setIsSettingsOpen(true); }}
    onOpenStatusMenu={() => { setIsMenuOpen(true); }}
    onSignOut={handleSignOut}
    
  />
  
)}

      {/* 2. STATUS SELECTOR */}
     {isMenuOpen && (
      
   <>
     {/* Backdrop: Taake bahar click karne par band ho jaye */}
     <div  className="fixed inset-0 z-[999]" onClick={() =>setIsMenuOpen(false)} />
<div className="fixed bottom-[80px] left-[20px] w-[220px] bg-[#111214] border border-white/[0.05] rounded-lg p-2 shadow-2xl z-[1999000] animate-in fade-in slide-in-from-left-2 duration-150">
       
       <div className="space-y-0.5">
         {["ONLINE", "IDLE", "DND", "OFFLINE"].map((s) => (
           <button
             key={s}
             onClick={() => updateStatus(s as UserStatus)}
             className="w-full flex items-center gap-3 px-2 py-1.5 hover:bg-[#4752c4] rounded-md transition-all group"
           >
             <div className="flex-shrink-0">
                <StatusIcon status={s as any} size="sm" />
             </div>
             <span className="text-[13px] font-medium text-[#dbdee1] group-hover:text-white capitalize">
               {s === "OFFLINE" ? "Invisible" : s.toLowerCase()}
             </span>
           </button>
         ))}
       </div>      
     </div>
     
   </>
 )}

      {/* 3. USER CONTROL BAR */}
      <div className="bg-[#232428]/80 backdrop-blur-md rounded-md h-[52px] flex items-center justify-between px-2 border border-[#ffffff1f]">
        <div 
          onClick={() => setIsProfileOpen(!isProfileOpen)}
          className="flex items-center gap-2.5 p-1 rounded hover:bg-white/[0.05] cursor-pointer flex-1 min-w-0 transition-colors"
        >
          <div className="relative shrink-0">
            <div className="w-8 h-8 rounded-full overflow-hidden bg-[#2b2d31] flex items-center justify-center shadow-lg">
             {displayImage ? (
      <img src={displayImage} alt="pfp" className="w-full h-full object-cover" />
    ) : (
      <div className="w-full h-full bg-indigo-600 flex items-center justify-center text-[11px] font-bold text-white uppercase">
        {currentUser?.name?.substring(0, 2)}
      </div>
    )}
            </div>
            <div className=" absolute left-5 -bottom-1">
            <StatusIcon status={status} size="sm" />
            </div>
          </div>

          <div className="flex flex-col min-w-0">
            <span className="text-white text-[14px] font-semibold leading-tight truncate">
              {currentUser?.name}
            </span>
            <span className="text-[11px] text-gray-400 font-medium leading-tight lowercase">
              {status === "OFFLINE" ? "invisible" : status}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-0.5 text-gray-400">
          <Mic size={18} className="cursor-pointer hover:text-white p-1.5 w-8 h-8 rounded hover:bg-white/5 transition-all" />
          <Headphones size={18} className="cursor-pointer hover:text-white p-1.5 w-8 h-8 rounded hover:bg-white/5 transition-all" />
          <Settings 
            size={18} 
            onClick={() => setIsSettingsOpen(true)}
            className="cursor-pointer hover:text-white p-1.5 w-8 h-8 rounded hover:bg-white/5 transition-all" 
          />
        </div>
      </div>
    </div>
  );
};