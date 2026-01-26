"use client";
import { useState, useEffect, useRef } from "react";
import { Mic, Headphones, Settings, PenBox, LogOut, Copy, ChevronRight } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { StatusIcon } from "./StatusIcon";
import SettingsModal from "./SettingsModal";


interface UserControlProps {
  currentUser: any;
  channel: any;
  onStatusUpdate: (newStatus: string) => void;
}

export const UserControl = ({ currentUser, channel, onStatusUpdate }: UserControlProps) => {
  const { data: session } = useSession();
  const user = session?.user as any;

const [status, setStatus] = useState<UserStatus>("ONLINE");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false); // Profile Viewer State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [newName, setNewName] = useState(user?.name || "");
  const [bannerColor, setBannerColor] = useState("#5865f2");

 useEffect(() => {
  const dbStatus = (session?.user as any)?.statusPreference;
  if (dbStatus) setStatus(dbStatus);
}, [session]);

type UserStatus = "ONLINE" | "IDLE" | "DND" | "OFFLINE";




const updateStatus = async (newStatus: UserStatus) => {
  try {
    // 1. UI updates (Immediate)
    setStatus(newStatus); 
    setIsMenuOpen(false);

    // 2. Dashboard ko batayein (Immediate feedback ke liye) 🔔
    onStatusUpdate(newStatus);

    // 3. Presence Update (Direct track!) 🛰️
    // Note: session data ki jagah currentUser props use karein
    if (channel && currentUser?.id) {
      await channel.track({ 
        id: currentUser.id, 
        name: currentUser.name,
        status: newStatus, // Naya status yahan bhej rahe hain
        online_at: new Date().toISOString()
      });
      console.log("Realtime track sent:", newStatus);
    }

    // 4. Database update (Background mein hota rahega)
    await fetch("/api/user/status", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });

  } catch (err) {
    console.error("Status update failed:", err);
  }
};

  const handleUpdateProfile = async () => {
    try {
      const res = await fetch("/api/user/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName, banner: bannerColor }),
      });
      if (res.ok) {
        setIsSettingsOpen(false);
        window.location.reload(); 
      }
    } catch (err) {
      console.error("Update failed", err);
    }
  };

  return (
    <div className="relative w-full px-2 pb-2 font-sans">
      
      {/* Settings Modal Component */}
      <SettingsModal 
        user={user} 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />

      {/* 1. PROFILE POPOVER (The Viewer) */}
     {isProfileOpen && (
  <>
    <div className="fixed inset-0 z-[100]" onClick={() => setIsProfileOpen(false)} />
    <div className="absolute bottom-[65px] left-0 w-[320px] bg-[#111214] rounded-xl shadow-2xl overflow-hidden z-[101] animate-in fade-in slide-in-from-bottom-2 duration-200 border border-[#ffffff1f]">
      
      {/* --- DYNAMIC BANNER (GIF/COLOR SUPPORT) --- */}
      <div 
        className="h-[100px] bg-cover bg-center transition-all duration-500 bg-[#5865f2]" 
        style={{ 
          backgroundImage: user?.banner ? `url(${user.banner})` : 'none',
          backgroundColor: !user?.banner?.startsWith('data') ? (user?.banner || '#5865f2') : 'transparent'
        }} 
      />
      
      <div className="px-4 pb-4">
        <div className="relative flex justify-between items-end -mt-8 mb-3">
          <div className="relative">
            {/* --- DYNAMIC PFP (GIF/IMAGE SUPPORT) --- */}
            <div className="w-[80px] h-[80px] rounded-full border-[6px] border-[#111214] bg-[#2b2d31] flex items-center justify-center overflow-hidden shadow-xl">
{session?.user?.image ? (
  <img src={session.user.image} className="w-[80px] h-[80px] rounded-full object-cover" />
) : (
  <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-[10px] text-white">
    {session?.user?.name?.substring(0, 2)}
  </div>
)}
            </div>
            <div className="absolute bottom-1.5 right-1.5 translate-x-1 translate-y-1 scale-125">
               <StatusIcon status={status} size="sm" />
            </div>
          </div>
          <div className="bg-[#111214] p-1.5 rounded-lg flex gap-1.5 mb-1 border border-white/5">
            <div className="w-5 h-5 bg-indigo-500 rounded-sm opacity-80" title="Active Member" />
            <div className="w-5 h-5 bg-blue-400 rounded-sm opacity-80" title="Developer" />
          </div>
        </div>

        <div className="bg-[#1e1f22] rounded-lg p-3 border border-white/5">
          <div className="mb-3">
            <h3 className="text-white text-[18px] font-bold leading-tight">{user?.name}</h3>
            <p className="text-[#dbdee1] text-[13px] font-medium opacity-70">@{user?.name?.toLowerCase().replace(/\s/g, '')}</p>
          </div>

          <div className="h-[1px] bg-white/5 my-3" />

          <div className="space-y-1">
            <button 
              onClick={() => { setIsProfileOpen(false); setIsSettingsOpen(true); }}
              className="w-full flex items-center justify-between p-2 hover:bg-white/5 rounded-md text-[#dbdee1] text-[13px] font-semibold transition-colors group"
            >
              <div className="flex items-center gap-3"><PenBox size={16} /> Edit Profile</div>
            </button>
            
            <button 
              onClick={() => { setIsProfileOpen(false); setIsMenuOpen(true); }}
              className="w-full flex items-center justify-between p-2 hover:bg-white/5 rounded-md text-[#dbdee1] text-[13px] font-semibold transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full flex items-center justify-center">
                   <div className={`w-3 h-3 rounded-full ${status === 'ONLINE' ? 'bg-[#23a559]' : 'bg-[#f23f43]'}`} />
                </div>
                Set Status
              </div>
              <ChevronRight size={14} />
            </button>

            <div className="h-[1px] bg-white/5 my-1" />

            <button 
              onClick={() => signOut()}
              className="w-full flex items-center justify-between p-2 hover:bg-red-500/10 rounded-md text-red-400 text-[13px] font-bold transition-all"
            >
              <div className="flex items-center gap-3"><LogOut size={16} /> Logout</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  </>
)}

      {/* 2. STATUS SELECTOR MENU */}
      {isMenuOpen && (
        <>
          <div className="fixed inset-0 z-[102]" onClick={() => setIsMenuOpen(false)} />
          <div className="absolute bottom-[60px] left-0 w-[220px] bg-[#111214] border border-white/[0.05] rounded-lg p-2 shadow-2xl z-[103] animate-in fade-in zoom-in-95 duration-100">
            <p className="text-[10px] font-bold text-gray-500 px-2 py-1 mb-1 uppercase tracking-wider">Set Status</p>
            {["ONLINE", "IDLE", "DND", "OFFLINE"].map((s) => (
              <button
                key={s}
                onClick={() => updateStatus(s as UserStatus)}
                className="w-full flex items-center gap-3 px-2 py-2 hover:bg-[#4752c4] rounded-md transition-all group"
              >
                <div className="relative w-4 h-4 rounded-full flex items-center justify-center">
                   <div className={`w-3 h-3 rounded-full ${s === 'ONLINE' ? 'bg-[#23a559]' : s === 'IDLE' ? 'bg-[#f0b232]' : s === 'DND' ? 'bg-[#f23f43]' : 'bg-[#80848e]'}`} />
                </div>
                <span className="text-[13px] font-medium text-gray-300 group-hover:text-white uppercase tracking-tight">
                  {s === "OFFLINE" ? "Invisible" : s}
                </span>
              </button>
            ))}
          </div>
        </>
      )}

      {/* 3. USER CONTROL BAR (Bottom) */}
      <div className="bg-[#232428]/80 backdrop-blur-md rounded-md h-[52px] flex items-center justify-between px-2 border border-[#ffffff1f]">
       <div 
  onClick={() => setIsProfileOpen(!isProfileOpen)}
  className="flex items-center gap-2.5 p-1 rounded hover:bg-white/[0.05] cursor-pointer flex-1 min-w-0 transition-colors"
>
  <div className="relative shrink-0">
    {/* --- DYNAMIC PFP START --- */}
    <div className="w-8 h-8 rounded-full overflow-hidden bg-[#2b2d31] flex items-center justify-center shadow-lg">
      {user?.image ? (
        /* Cloudinary URL ya Base64 GIF yahan render hogi */
        <img 
          src={user.image} 
          alt="pfp" 
          className="w-full h-full object-cover" 
        />
      ) : (
        /* Fallback: Agar image nahi hai toh initials */
        <div className="w-full h-full bg-gradient-to-br from-blue-600 to-indigo-900 flex items-center justify-center text-[11px] font-bold text-white uppercase">
          {user?.name?.substring(0, 2) || "MZ"}
        </div>
      )}
    </div>
    {/* --- DYNAMIC PFP END --- */}
    
    <StatusIcon status={status} size="sm" />
  </div>

  <div className="flex flex-col min-w-0">
    <span className="text-white text-[14px] font-semibold leading-tight truncate">
      {user?.name || "User"}
    </span>
    <span className="text-[11px] text-gray-400 font-medium leading-tight lowercase">
      {status === "OFFLINE" ? "invisible" : status}
    </span>
  </div>
</div>

        <div className="flex items-center gap-0.5 text-gray-400">
          <Mic size={18} className="cursor-pointer hover:text-white p-1.5 w-8 h-8 rounded hover:bg-white/5 transition-all" />
          <Headphones size={18} className="cursor-pointer hover:text-white p-1.5 w-8 h-8 rounded hover:bg-white/5 transition-all" />
          <Settings size={18} 
            onClick={() => setIsSettingsOpen(true)}
            className="cursor-pointer hover:text-white p-1.5 w-8 h-8 rounded hover:bg-white/5 transition-all" 
          />
        </div>
      </div>
    </div>
  );
};