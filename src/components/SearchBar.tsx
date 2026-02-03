"use client";
import { Search, X } from "lucide-react";
import { useState } from "react";

interface SearchBarProps {
  friendName: string;
  messages: any[]; // ✅ Messages pass karein search karne ke liye
  scrollToMessage: (id: string) => void; // ✅ Jump logic
}

export const SearchBar = ({ friendName, messages, scrollToMessage }: SearchBarProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);

  // ✅ Search Functionality
  const handleSearch = (val: string) => {
    setQuery(val);
    if (val.trim().length > 1) {
      const filtered = messages.filter(m => 
        m.content?.toLowerCase().includes(val.toLowerCase())
      );
      setSearchResults(filtered);
    } else {
      setSearchResults([]);
    }
  };
  const FilterItem = ({ icon, title, desc }: { icon: string, title: string, desc: string }) => (
  <div className="flex items-center gap-3 group cursor-pointer">
    <div className="text-lg opacity-60 group-hover:opacity-100 transition">{icon}</div>
    <div className="flex flex-col">
      <span className="text-[14px] text-white font-medium group-hover:text-indigo-400 transition">{title}</span>
      <span className="text-[12px] text-[#949ba4] font-mono">{desc}</span>
    </div>
  </div>
);

  return (
  <div className="relative">
    {/* --- SEARCH INPUT BAR --- */}
    <div className={`
      relative flex items-center bg-[#1e1f22] rounded transition-all duration-300 px-2 py-1
      /* Mobile vs Desktop Width Logic */
      w-full ${isFocused ? 'min-w-[160px] xs:min-w-[200px] sm:w-60' : 'w-32 xs:w-40 sm:w-36'}
      border border-transparent focus-within:border-[#5865f2]/50
    `}>
      <Search size={14} className="text-[#949ba4] shrink-0" />
      
      <input 
        placeholder={isFocused ? "Search..." : `Search ${friendName}`} 
        className="bg-transparent text-[12px] w-full outline-none placeholder:text-[#949ba4] text-white min-w-0 pl-1.5"
        onFocus={() => setIsFocused(true)}
        onBlur={() => setTimeout(() => setIsFocused(false), 200)}
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
      />
      
      {query && (
        <X 
          size={14} 
          className="text-[#949ba4] cursor-pointer hover:text-white shrink-0 ml-1" 
          onClick={() => { setQuery(""); setSearchResults([]); }} 
        />
      )}
    </div>

    {/* ✅ FIXED POPOVER (Right Aligned, Left Expanding) */}
    {isFocused && (
      <div className={`
  /* ✅ POSITIONING: Desktop pe right-0, Mobile pe header padding ko offset kiya */
  absolute top-11 -right-2 xs:-right-4 
  md:right-0 md:inset-x-auto
  
  /* ✅ WIDTH: Mobile pe optimize taake screen se bahar na jaye */
  w-[calc(100vw-32px)] sm:w-[380px]
  
  bg-[#232428] rounded-xl md:rounded-lg shadow-[0_8px_24px_rgba(0,0,0,0.5)] border border-black/40 
  flex flex-col overflow-hidden 
  
  /* ✅ Animation origin top-right bilkul Discord ki tarah */
  animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-200 origin-top-right
  z-[200]
`}>
        
        {/* Agar query nahi hai toh Filters dikhayein (Screenshot 136 style) */}
        {!query ? (
          <div className="p-4 space-y-4">
            <div className="text-[#b5bac1] text-[12px] font-semibold uppercase tracking-wider mb-2">Filters</div>
            <div className="space-y-3">
              <FilterItem icon="👤" title="From a specific user" desc="from: user" />
              <FilterItem icon="📎" title="Includes a specific type of data" desc="has: link, embed or file" />
              <FilterItem icon="@" title="Mentions a specific user" desc="mentions: user" />
            </div>
          </div>
        ) : (
          /* Search Results (Aapka purana logic) */
          <div className="flex flex-col">
             <div className="p-3 border-b border-white/5 text-[11px] font-medium text-gray-400 uppercase">
                Search Results for "{query}"
             </div>
             <div className="max-h-[350px] overflow-y-auto custom-scrollbar p-1">
                {searchResults.length > 0 ? (
                   searchResults.map(res => (
                      <div key={res.id} onMouseDown={() => scrollToMessage(res.id)} className="p-2 hover:bg-white/5 rounded-md cursor-pointer">
                         <span className="text-white text-sm block">{res.user?.name}</span>
                         <span className="text-gray-400 text-xs line-clamp-1">{res.content}</span>
                      </div>
                   ))
                ) : (
                   <div className="p-10 text-center text-gray-500 text-sm">No results found.</div>
                )}
             </div>
          </div>
        )}
      </div>
    )}
  </div>
);

// Helper component for filter items

};