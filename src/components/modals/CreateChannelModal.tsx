"use client";
import { useState, useEffect} from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { X, Hash, Volume2 } from "lucide-react";

export default function CreateChannelModal({ isOpen, onClose, serverId }: any) {
  const [name, setName] = useState("");
  const [type, setType] = useState("TEXT"); // Default TEXT channel
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => { setMounted(true); }, []);

  const onSubmit = async () => {
  try {
    const res = await fetch("/api/channels", {
      method: "POST",
      body: JSON.stringify({ name, type, serverId }),
    });

    if (res.ok) {
      // ❌ window.location.reload(); <-- Is line ko delete kar dein
      
      onClose(); // Modal band karein
      
      // ✅ Reload ke bajaye parent data ko update karein
      // Agar aapne Dashboard mein 'fetchServer' banaya hai toh usay call karein
      router.refresh(); // Ye Next.js ka refresh hai jo page reload nahi karta, sirf data update karta hai
    }
  } catch (error) {
    console.log(error);
  }
}

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[99999999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[#313338] w-full max-w-md rounded-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Create Channel</h2>
            <X onClick={onClose} className="text-gray-400 cursor-pointer hover:text-white" />
          </div>

          <div className="space-y-6">
            {/* Channel Type Selection */}
            <div>
              <label className="text-xs font-bold text-[#b5bac1] uppercase tracking-wide">Channel Type</label>
              <div className="mt-2 space-y-2">
                <div 
                  onClick={() => setType("TEXT")}
                  className={`flex items-center justify-between p-3 rounded-md cursor-pointer transition ${type === "TEXT" ? "bg-[#404249] text-white" : "bg-[#2b2d31] text-[#b5bac1] hover:bg-[#35373c]"}`}
                >
                  <div className="flex items-center gap-3">
                    <Hash size={24} />
                    <div>
                      <p className="font-medium text-sm">Text</p>
                      <p className="text-xs opacity-70">Send messages, images, and emojis</p>
                    </div>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${type === "TEXT" ? "border-indigo-500 bg-indigo-500" : "border-gray-500"}`}>
                    {type === "TEXT" && <div className="w-2 h-2 bg-white rounded-full" />}
                  </div>
                </div>

                <div 
                  onClick={() => setType("VOICE")}
                  className={`flex items-center justify-between p-3 rounded-md cursor-pointer transition ${type === "VOICE" ? "bg-[#404249] text-white" : "bg-[#2b2d31] text-[#b5bac1] hover:bg-[#35373c]"}`}
                >
                  <div className="flex items-center gap-3">
                    <Volume2 size={24} />
                    <div>
                      <p className="font-medium text-sm">Voice</p>
                      <p className="text-xs opacity-70">Hang out with voice, video, and screen share</p>
                    </div>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${type === "VOICE" ? "border-indigo-500 bg-indigo-500" : "border-gray-500"}`}>
                    {type === "VOICE" && <div className="w-2 h-2 bg-white rounded-full" />}
                  </div>
                </div>
              </div>
            </div>

            {/* Channel Name Input */}
            <div>
              <label className="text-xs font-bold text-[#b5bac1] uppercase">Channel Name</label>
              <div className="relative mt-2">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  value={name}
                  onChange={(e) => setName(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                  placeholder="new-channel"
                  className="w-full bg-[#1e1f22] p-3 pl-10 rounded text-white outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#2b2d31] p-4 flex justify-end gap-4">
          <button onClick={onClose} className="text-white text-sm hover:underline">Cancel</button>
          <button 
            onClick={onSubmit}
            disabled={loading || !name}
            className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-2 rounded font-medium disabled:opacity-50 transition"
          >
            Create Channel
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}