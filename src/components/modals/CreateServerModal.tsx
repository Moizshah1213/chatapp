"use client";
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom"; // 1. Portal import kiya
import { X, Camera } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CreateServerModal({ isOpen, onClose }: any) {
  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false); // 2. SSR fix ke liye mounted state
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Client-side par render confirm karne ke liye
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async () => {
    setLoading(true);
    try {
      let imageUrl = image;
      if (image.startsWith("data:image")) {
        const formData = new FormData();
        formData.append("file", image);
        formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!);

        const res = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        imageUrl = data.secure_url;
      }

      const dbRes = await fetch("/api/servers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, imageUrl }),
      });

      if (dbRes.ok) {
        setName("");
        setImage("");
        onClose();
        window.location.reload(); 
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Agar modal open nahi hai ya client par mount nahi hua toh kuch mat dikhao
  if (!isOpen || !mounted) return null;

  // 3. createPortal use karke modal ko body ke level par le gaye
  return createPortal(
    <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-hidden">
      {/* Background overlay click to close */}
      <div className="absolute inset-0" onClick={onClose} />
      
      <div className="relative bg-[#313338] w-full max-w-md rounded-lg overflow-hidden shadow-2xl border border-white/10 animate-in zoom-in-95 duration-200">
        <div className="p-6 text-center">
          <button 
            onClick={onClose}
            className="absolute right-4 top-4 text-gray-400 hover:text-white transition"
          >
            <X size={20} />
          </button>

          <h2 className="text-2xl font-bold text-white mb-2">Customize your server</h2>
          <p className="text-[#b5bac1] text-sm mb-6">Give your new server a personality with a name and an icon.</p>
          
          <div className="flex justify-center mb-6">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="w-20 h-20 rounded-full border-2 border-dashed border-indigo-500 flex items-center justify-center cursor-pointer overflow-hidden group relative bg-[#1e1f22]"
            >
              {image ? (
                <img src={image} className="w-full h-full object-cover" alt="preview" />
              ) : (
                <Camera className="text-indigo-500 group-hover:scale-110 transition" size={30} />
              )}
            </div>
          </div>

          <div className="text-left space-y-4">
            <div>
              <label className="text-xs font-bold text-[#b5bac1] uppercase">Server Name</label>
              <input 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter server name"
                className="w-full mt-2 bg-[#1e1f22] p-3 rounded text-white outline-none focus:ring-1 focus:ring-indigo-500 transition"
              />
            </div>
          </div>
        </div>

        <div className="bg-[#2b2d31] p-4 flex justify-between items-center">
          <button onClick={onClose} className="text-white text-sm hover:underline">Back</button>
          <button 
            onClick={onSubmit}
            disabled={loading || !name || !image}
            className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-2 rounded font-medium disabled:opacity-50 transition"
          >
            {loading ? "Creating..." : "Create"}
          </button>
        </div>
        <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleUpload} />
      </div>
    </div>,
    document.body // Seedha body mein render hoga
  );
}