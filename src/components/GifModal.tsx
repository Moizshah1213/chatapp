"use client";
import { useState, useEffect } from "react";
import { Search, TrendingUp, Smile, Zap } from "lucide-react";

export const GifModal = ({ onGifSelect }: { onGifSelect: (url: string) => void }) => {
  const [gifs, setGifs] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("trending");

  const GIPHY_KEY = "7zPK0gsjLjiaHvlLXyxj8MzZxNUDlgVM";

  const fetchGifs = async () => {
    setLoading(true);
    try {
      // Agar search empty hai toh category wise fetch karein
      const query = search || activeCategory;
      const endpoint = search || activeCategory !== "trending" ? "search" : "trending";
      
      const url = `https://api.giphy.com/v1/gifs/${endpoint}?api_key=${GIPHY_KEY}&q=${query}&limit=30&rating=g`;
      
      const res = await fetch(url);
      const { data } = await res.json();
      setGifs(data || []);
    } catch (err) {
      console.error("Giphy Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => fetchGifs(), 500);
    return () => clearTimeout(timer);
  }, [search, activeCategory]);

  return (
  <div className={`
    /* ✅ POSITIONING: Mobile pe fixed center, Desktop pe absolute */
    fixed bottom-20 left-4 right-4 
    md:absolute md:bottom-5 md:right-4 md:left-auto
    
    /* ✅ SIZE: Mobile pe auto width, Desktop pe 400px ya 450px */
    md:w-[450px] h-[450px] sm:h-[500px] 
    
    bg-[#232428] rounded-xl shadow-[0_12px_40px_rgba(0,0,0,0.6)] 
    border border-black/40 flex flex-col overflow-hidden 
    
    /* ✅ Z-INDEX: Sabse upar */
    z-[120] 
    
    animate-in fade-in zoom-in-95 duration-200
  `}>
    {/* Search Header */}
    <div className="p-3 bg-[#1e1f22] space-y-3 shrink-0">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        <input 
          autoFocus
          className="w-full bg-[#111214] text-white text-[14px] pl-10 pr-3 py-2 rounded-md outline-none placeholder:text-gray-500 focus:ring-1 ring-indigo-500 transition"
          placeholder="Search GIPHY"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Category Tabs (Scrollable on Mobile) */}
      {!search && (
        <div className="flex gap-2 pb-1 overflow-x-auto no-scrollbar">
          {[
            { id: "trending", label: "Trending", icon: <TrendingUp size={14}/> },
            { id: "reactions", label: "Reactions", icon: <Smile size={14}/> },
            { id: "gaming", label: "Gaming", icon: <Zap size={14}/> }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-medium transition whitespace-nowrap ${activeCategory === cat.id ? 'bg-white text-black' : 'bg-[#2b2d31] text-[#dbdee1] hover:bg-[#35373c]'}`}
            >
              {cat.icon} {cat.label}
            </button>
          ))}
        </div>
      )}
    </div>

    {/* GIFs Grid */}
    <div className="flex-1 overflow-y-auto p-2 sm:p-3 custom-scrollbar bg-[#232428]">
      {loading ? (
        <div className="grid grid-cols-2 gap-2">
          {[...Array(6)].map((_, i) => <div key={i} className="h-28 sm:h-32 bg-white/5 rounded-lg animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {gifs.map((gif) => (
            <div 
              key={gif.id}
              onClick={() => onGifSelect(gif.images.original.url)}
              className="h-28 sm:h-32 rounded-lg cursor-pointer hover:scale-[1.02] active:scale-95 transition-all overflow-hidden bg-[#111214] group relative"
            >
              <img 
                src={gif.images.fixed_height.url} 
                alt="gif" 
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
);
};