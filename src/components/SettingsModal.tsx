"use client";
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Camera, Image as ImageIcon, LogOut, UserCircle, Palette } from "lucide-react";
import { signOut, useSession } from "next-auth/react";

export default function SettingsModal({ user, isOpen, onClose }: any) {
  const [newName, setNewName] = useState(user?.name || "");
  const [banner, setBanner] = useState(user?.banner || "");
  const [pfp, setPfp] = useState(user?.image || "");
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const { data: session, update } = useSession();

  const bannerInputRef = useRef<HTMLInputElement>(null);
  const pfpInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'banner' | 'pfp') => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("File size too large! Please select a file under 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        if (type === 'banner') setBanner(base64String);
        else setPfp(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    alert("Cloudinary settings not found");
    return;
  }

  setLoading(true);
  try {
    let finalImageUrl = user?.image; // Default: Purani image jo DB mein hai
    let finalBannerUrl = user?.banner;

    // 1. PFP Upload Logic
    if (pfp && pfp.startsWith("data:image")) {
      const formData = new FormData();
      formData.append("file", pfp);
      formData.append("upload_preset", uploadPreset);

      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.secure_url) {
        finalImageUrl = data.secure_url;
        console.log("PFP Uploaded to Cloudinary:", finalImageUrl);
      } else {
        throw new Error("PFP Upload Failed: " + data.error?.message);
      }
    }

    // 2. Banner Upload Logic
    if (banner && banner.startsWith("data:image")) {
      const formData = new FormData();
      formData.append("file", banner);
      formData.append("upload_preset", uploadPreset);

      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.secure_url) {
        finalBannerUrl = data.secure_url;
        console.log("Banner Uploaded to Cloudinary:", finalBannerUrl);
      } else {
        throw new Error("Banner Upload Failed: " + data.error?.message);
      }
    }

    // 3. Database Update (Sirf tab chalega jab uploads successful honge)
    const dbRes = await fetch("/api/user/update", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        name: newName, 
        banner: finalBannerUrl, 
        image: finalImageUrl 
      }),
    });

    if (dbRes.ok) {
      await update(); 
      onClose();
      window.location.reload();
    } else {
      alert("Database update failed!");
    }

  } catch (err: any) {
    console.error("Cloudinary Error:", err);
    alert("Error: " + err.message); // Ye batayega ke masla Cloudinary mein hai
  } finally {
    setLoading(false);
  }
};

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
      <div className="absolute inset-0  backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-[80%] h-[800] chat-gradient rounded-xl flex overflow-hidden shadow-2xl border border-white/10">
        {/* Sidebar */}
        <div className="w-[240px] bg-[#000a1e] p-6 border-r border-white/5 flex flex-col justify-between">
          <div className="space-y-1">
            <p className="text-[11px] font-bold text-[#949ba4] uppercase px-2 mb-3">User Settings</p>
            <button className="w-full text-left px-3 py-2 bg-white/10 text-white rounded-lg text-[14px] font-semibold flex items-center gap-2">
              <UserCircle size={18} /> My Account
            </button>
          </div>
          <button onClick={() => signOut()} className="w-full flex items-center gap-2 p-2.5 text-red-400 hover:bg-red-500/10 rounded-lg text-[14px] font-bold">
            <LogOut size={18} /> Log Out
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 chat-gradient selection:bg-blue-300/80 antialiased  overflow-y-auto no-scrollbar p-10 relative">
          <button onClick={onClose} className="absolute right-6 top-6 p-2 text-gray-400 hover:text-white">
            <X size={24} />
          </button>

          <div className="w-[700px] profile-container">

          <h2 className="text-white text-[22px] font-bold mb-6">My Account</h2>

          <div className="bg-[#1e1f22] rounded-xl overflow-hidden shadow-2xl mb-8 border border-white/5">
            <div 
              className="h-40 bg-black relative group cursor-pointer bg-cover bg-center"
              style={{ backgroundImage: banner ? `url(${banner})` : 'none' }}
              onClick={() => bannerInputRef.current?.click()}
            >
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                <span className="text-white text-xs font-bold uppercase">Change Banner</span>
              </div>
            </div>

            <div className="px-5 pb-5 flex items-center gap-4 -mt-10 relative">
              <div 
                className="relative w-24 h-24 rounded-full border-[8px] border-[#1e1f22] bg-[#2b2d31] overflow-hidden group/avatar cursor-pointer"
                onClick={() => pfpInputRef.current?.click()}
              >
                {pfp ? (
                  <img src={pfp} className="w-full h-full object-cover" alt="pfp" />
                ) : user?.image ? (
                  <img src={user.image} className="w-full h-full object-cover" alt="pfp" />
                ) : (
                  <div className="w-full h-full bg-indigo-600 flex items-center justify-center text-3xl font-bold text-white uppercase">
                    {newName?.substring(0, 2) || "MZ"}
                  </div>
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/avatar:opacity-100 flex items-center justify-center">
                  <Camera size={20} className="text-white" />
                </div>
              </div>
              <div className="mt-10">
                <h3 className="text-white text-[20px] font-bold">{newName || user?.name}</h3>
                <p className="text-[#b5bac1] text-[13px]">@{user?.name?.toLowerCase().replace(/\s/g, '')}</p>
              </div>
            </div>
          </div>

          <div className="bg-[#2b2d31] p-6 rounded-xl space-y-6 border border-white/5">
            <h4 className="text-white font-bold text-[16px]">Profile Customization</h4>
            <div>
              <label className="text-[11px] font-bold text-[#b5bac1] uppercase block mb-2">Display Name</label>
              <input 
                value={newName} 
                onChange={(e) => setNewName(e.target.value)}
                className="w-full bg-[#1e1f22] p-3 rounded-lg border-none text-[#dbdee1] focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div className="pt-6 border-t border-white/5 flex justify-end">
              <button 
                onClick={handleSave}
                disabled={loading}
                className="bg-[#23a559] hover:bg-[#1a8344] text-white px-10 py-3 rounded-lg font-bold disabled:opacity-50 transition-all"
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
          </div>
        </div>
      </div>

      <input type="file" ref={bannerInputRef} hidden accept="image/*" onChange={(e) => handleUpload(e, 'banner')} />
      <input type="file" ref={pfpInputRef} hidden accept="image/*" onChange={(e) => handleUpload(e, 'pfp')} />
    </div>,
    document.body
  );
}