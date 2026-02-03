"use client";
import { useState, useRef, useEffect, } from "react";
import { createPortal } from "react-dom";
import { toast } from "react-hot-toast";
import { uploadToCloudinary } from "@/lib/upload";

import { 
  X, LogOut, UserCircle, ShieldCheck, 
  Bell, Smartphone, Palette, Monitor, Heart, Search, Lock, Activity
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { ProfilesTab } from "./ProfileTab";
import UnsavedChangesBar from "./UnsavedChangesBar";

export default function SettingsModal({ user, isOpen, onClose }: any) {
  const [activeTab, setActiveTab] = useState("account");
  const [mounted, setMounted] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [pendingData, setPendingData] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  const supabase = createClient();
  const router = useRouter();

  const bannerInputRef = useRef<HTMLInputElement>(null);
  const pfpInputRef = useRef<HTMLInputElement>(null);

 
  
  // Fetch profile when modal opens
  useEffect(() => {
    if (!isOpen) return;
    fetch("/api/profile/me")
      .then(res => res.json())
      .then((data) => {
        if (data) setProfile(data);
      })
      .catch(() => setProfile(null));
  }, [isOpen]);

  // Mount effect
  useEffect(() => {
    setMounted(true);
    if (isOpen) document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen]);

  // Reset handler
  const handleReset = () => {
    setHasChanges(false);
    setPendingData(null);
    window.dispatchEvent(new Event("reset-profile-settings"));
  };

  // Save handler
// SettingsModal.tsx

// SettingsModal.tsx mein ye function update karein

const handleSave = async () => {
  if (!pendingData) return;
  setIsSaving(true);
  
  // 🔄 Ek toast dikhao taake user ko pata chale ke upload ho raha hai
  const loadingToast = toast.loading("Saving profile and uploading images...");

  try {
    let finalData = { ...pendingData };

    // 🚀 1. Check & Upload Avatar
    if (pendingData.image && pendingData.image.startsWith("data:image")) {
      const avatarUrl = await uploadToCloudinary(pendingData.image);
      finalData.image = avatarUrl; // Base64 ko URL se replace kar diya
    }

    // 🚀 2. Check & Upload Banner
    if (pendingData.banner && pendingData.banner.startsWith("data:image")) {
      const bannerUrl = await uploadToCloudinary(pendingData.banner);
      finalData.banner = bannerUrl;
    }

    // 🚀 3. Ab Database update karein (Sirf URLs jayenge)
    const res = await fetch("/api/user/update-profile", { // Ensure karein ye aapka PATCH route hai
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(finalData),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || "Failed to update");
    }

    // Success! 
    setProfile(finalData); // Local state ko naye URLs ke saath update karein
    setHasChanges(false);
    toast.success("Profile saved successfully!", { id: loadingToast });
    
    // Refresh dashboard in background
    router.refresh();

  } catch (err: any) {
    console.error("Save Error:", err);
    toast.error(err.message || "Error saving changes", { id: loadingToast });
  } finally {
    setIsSaving(false);
  }
};

  // Sign out
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (!isOpen || !mounted) return null;

  const settingsGroups = [
    {
      title: "User Settings",
      items: [
        { id: "account", label: "My Account", icon: <UserCircle size={18} /> },
        { id: "profile", label: "Profiles", icon: <Palette size={18} /> },
        { id: "privacy", label: "Privacy & Safety", icon: <ShieldCheck size={18} /> },
        { id: "family", label: "Family Center", icon: <Heart size={18} /> },
        { id: "apps", label: "Authorized Apps", icon: <Monitor size={18} /> },
        { id: "devices", label: "Devices", icon: <Smartphone size={18} /> },
      ]
    },
    {
      title: "App Settings",
      items: [
        { id: "appearance", label: "Appearance", icon: <Monitor size={18} /> },
        { id: "accessibility", label: "Accessibility", icon: <UserCircle size={18} /> },
        { id: "voice", label: "Voice & Video", icon: <Activity size={18} /> },
        { id: "notifications", label: "Notifications", icon: <Bell size={18} /> },
      ]
    }
  ];

  const handleThemeSelect = (themeId: string) => {
  const updatedProfile = { ...profile, theme: themeId };
  setProfile(updatedProfile);
  setPendingData(updatedProfile); // 👈 Ye handleSave ko signal dega
  setHasChanges(true);
};

  return createPortal(
    <div className="fixed inset-0 z-[100000] flex items-center justify-center">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-[2px] md:block hidden" 
        onClick={onClose} 
      />

      {/* Modal Container */}
      <div className="relative bg-[#313338] flex flex-col md:flex-row overflow-hidden animate-in zoom-in-95 duration-200 inset-0 w-full h-full md:w-[95%] md:max-w-[1280px] md:h-[85vh] md:rounded-lg md:shadow-2xl md:border md:border-white/5">
        
        {/* Left Sidebar */}
        <div className="w-full md:w-[280px] bg-[#2b2d31] flex md:justify-end shrink-0 overflow-y-auto no-scrollbar py-6 md:py-16">
          <div className="w-full md:w-[218px] px-4 md:px-0 md:mr-4">
            {settingsGroups.map((group, idx) => (
              <div key={idx} className="mb-5">
                <h3 className="text-[12px] font-bold text-[#949ba4] uppercase px-2.5 mb-1.5 select-none tracking-wide">{group.title}</h3>
                <nav className="space-y-0.5">
                  {group.items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-[15px] font-medium transition-all
                        ${activeTab === item.id ? "bg-[#3f4147] text-white" : "text-[#b5bac1] hover:bg-[#393b41] hover:text-[#dbdee1]"}`}
                    >
                      {item.label}
                    </button>
                  ))}
                </nav>
              </div>
            ))}
            <div className="h-[1px] bg-white/5 my-2 mx-2.5" />
            <button onClick={handleSignOut} className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-[15px] font-medium text-[#f23f42] hover:bg-red-500/10 transition-all mt-4">
              Log Out <LogOut size={16} />
            </button>
          </div>
        </div>

        {/* Right Content */}
        <div className="flex-auto flex justify-center pt-5 bg-[#313338] relative flex flex-col overflow-hidden">
          <div className="flex-auto overflow-y-auto pt-16 pb-20 px-4 md:px-10">
            <div className="max-w-[690px] mx-auto">

              {activeTab === "account" && (
                <div className="animate-in slide-in-from-right-4 duration-300">
                  <h2 className="text-white text-[20px] font-semibold mb-5 tracking-tight">My Account</h2>
                  { (profile || user) && (
                  <div className="bg-[#1e1f22] rounded-lg overflow-hidden border border-black/20 shadow-2xl mb-8">
                    <div className="h-[200px] bg-zinc-800 bg-cover bg-center" style={{ backgroundImage: `url(${profile?.banner || user?.banner || ""})` }} />
                    <div className="px-4 pb-4">
                      <div className="flex items-end justify-between -mt-10 mb-4">
                        <div className="relative w-24 h-24 rounded-full border-[7px] border-[#1e1f22] bg-[#2b2d31] overflow-hidden">
<img 
                src={profile?.image || user?.image || "/default-avatar.png"} 
                className="w-full h-full object-cover" 
              />                        </div>
                        <button onClick={() => setActiveTab("profile")} className="bg-[#5865f2] hover:bg-[#4752c4] text-white px-4 py-1.5 rounded-[3px] text-[14px] font-medium transition-all">
                          Edit User Profile
                        </button>
                      </div>
                      {/* Info Card */}
                      <div className="bg-[#2b2d31] rounded-lg p-4 space-y-5">
                        <div className="flex justify-between items-center group">
                          <div className="min-w-0">
                            <p className="text-[12px] font-bold text-[#b5bac1] uppercase tracking-wider mb-0.5">Display Name</p>
                            <p className="text-white text-[15px] truncate">{profile?.name || user?.name || "User"}</p>
                          </div>
                          <button className="bg-[#4e5058] hover:bg-[#6d6f78] text-white px-4 py-1.5 rounded-[3px] text-[14px] font-medium">Edit</button>
                        </div>
                        <div className="flex justify-between items-center group">
                          <div>
                            <p className="text-[12px] font-bold text-[#b5bac1] uppercase tracking-wider mb-0.5">Username</p>
                            <p className="text-white text-[15px]">{user?.email?.split("@")[0] || "user"}</p>
                          </div>
                          <button className="bg-[#4e5058] hover:bg-[#6d6f78] text-white px-4 py-1.5 rounded-[3px] text-[14px] font-medium">Edit</button>
                        </div>
                        <div className="flex justify-between items-center group">
                          <div>
                            <p className="text-[12px] font-bold text-[#b5bac1] uppercase tracking-wider mb-0.5">Email</p>
                            <p className="text-white text-[15px]">{user?.email || "user@example.com"}</p>
                          </div>
                          <button className="bg-[#4e5058] hover:bg-[#6d6f78] text-white px-4 py-1.5 rounded-[3px] text-[14px] font-medium">Edit</button>
                        </div>
                      </div>
                    </div>
                  </div>
                  )}
                </div>
              )}

              {/* Profile Tab */}
             {activeTab === "profile" && (
  <>
    {!profile ? (
      <div className="text-white text-center py-10">Loading profile...</div>
    ) : (
      <ProfilesTab
        profile={profile}
        onStateChange={(changed, data) => {
          setHasChanges(changed);
          setPendingData(data);
        }}
      />
    )}
  </>
)}

{activeTab === "appearance" && (
  <div className="animate-in slide-in-from-right-4 duration-300">
    <h2 className="text-white text-[20px] font-semibold mb-5 tracking-tight">Appearance</h2>
    
    {/* PREVIEW CARD */}
    <div className="mb-8 p-4 rounded-lg bg-[#1e1f22] border border-black/20">
       <p className="text-[12px] font-bold text-[#b5bac1] uppercase mb-3">Preview</p>
       <div className={`h-32 rounded-md flex items-center justify-center border border-white/5 overflow-hidden relative ${profile?.theme === 'space-galaxy' ? 'bg-[#02010a]' : 'bg-[#313338]'}`}>
          {profile?.theme === 'space-galaxy' && <div className="absolute inset-0 bg-[url('/space-stars.png')] opacity-50 animate-pulse" />}
          <div className="z-10 bg-[#2b2d31] p-3 rounded shadow-xl border border-white/10 flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-indigo-500" />
             <div className="space-y-1">
                <div className="w-20 h-2 bg-white/20 rounded" />
                <div className="w-32 h-2 bg-white/10 rounded" />
             </div>
          </div>
       </div>
    </div>

    {/* THEME SELECTOR */}
    <div className="space-y-4">
      <p className="text-[12px] font-bold text-[#b5bac1] uppercase tracking-wider">Themes</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[
          { id: 'dark', name: 'Dark', desc: 'Classic Discord dark mode', color: 'bg-[#313338]' },
          { id: 'space-galaxy', name: 'Space Galaxy', desc: 'Planets, stars and nebula', color: 'bg-[#02010a] border-indigo-500/50' },
          { id: 'midnight', name: 'Midnight', desc: 'Deep black for OLED', color: 'bg-black' },
          { id: 'sunset', name: 'Sunset Gradient', desc: 'Warm orange and purple', color: 'bg-gradient-to-br from-orange-500 to-purple-600' }
        ].map((t) => (
          <div 
            key={t.id}
            onClick={() => {
              const newData = { ...profile, theme: t.id };
              setProfile(newData);
              setPendingData(newData);
              setHasChanges(true);
            }}
            className={`cursor-pointer p-4 rounded-lg border-2 transition-all flex items-center gap-4 ${profile?.theme === t.id ? 'border-[#5865f2] bg-[#3f4147]' : 'border-white/5 bg-[#2b2d31] hover:bg-[#35373c]'}`}
          >
            <div className={`w-10 h-10 rounded-full shrink-0 border border-white/10 ${t.color}`} />
            <div>
              <p className="text-white font-medium text-[15px]">{t.name}</p>
              <p className="text-[12px] text-[#b5bac1]">{t.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
)}
            </div>
          </div>

          <UnsavedChangesBar
            show={hasChanges}
            loading={isSaving}
            onReset={handleReset}
            onSave={handleSave}
          />

          {/* Close buttons */}
          <div className="absolute right-6 top-4 hidden md:flex flex-col items-center">
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-[#b5bac1] hover:text-white hover:border-white transition-all group">
              <X size={18} />
            </button>
          </div>
          <button onClick={onClose} className="md:hidden absolute left-4 top-2 p-2 text-white">
            <X size={20} />
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
