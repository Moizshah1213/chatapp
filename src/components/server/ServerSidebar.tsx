"use client";
import { useState } from "react";
import { 
  Hash, Plus, ChevronDown, Settings, 
  Search, Volume2, UserPlus, LogOut 
} from "lucide-react";
import CreateChannelModal from "@/components/modals/CreateChannelModal";

interface ServerSidebarProps {
  server: any;
  onChannelSelect: (id: string) => void;
  handleJoinVC: (id: string, name: string) => void; // ✅ Ye line add karein
  activeChannelId: string | null;
}


export default function ServerSidebar({ 
  server, 
  onChannelSelect, 
  handleJoinVC,
  activeChannelId 
}: ServerSidebarProps) {
  const [isServerMenuOpen, setIsServerMenuOpen] = useState(false);
  const [isChannelModalOpen, setIsChannelModalOpen] = useState(false);
  const voiceChannels = server.channels.filter((c: any) => c.type === "VOICE");

  const handleInvite = () => {
  // ✅ Real Invite Link Logic
  const inviteUrl = `${window.location.origin}/invite/${server.inviteCode}`;
  navigator.clipboard.writeText(inviteUrl);
  alert("Invite link copied!"); // Baad mein Toast laga lenge
  setIsServerMenuOpen(false);
};

  if (!server) {
    return <div className="p-4 text-xs text-gray-500 italic">Loading server details...</div>;
  }

  // Filters: Ensure karein ke 'general' hamesha TEXT mein aaye
  const textChannels = server?.channels?.filter((c: any) => c.type === "TEXT") || [];

  return (
    <div className="flex flex-col h-full bg-[ #120F0F] text-[#949ba4]">
      
      {/* 1. SERVER HEADER (Same as before) */}
      <div className="relative">
      <button 
        onClick={() => setIsServerMenuOpen(!isServerMenuOpen)}
        className="w-full h-12 border-b border-black/20 flex items-center px-4 font-medium text-white hover:bg-[#35373c] transition shadow-sm"
      >
        <span className="truncate flex-1 text-left text-[15px]">
          {server?.name || "Server Name"}
        </span>
        <ChevronDown size={18} className={`ml-auto transition-transform ${isServerMenuOpen ? "rotate-180" : ""}`} />
      </button>

      {/* --- SERVER DROPDOWN MENU --- */}
      {isServerMenuOpen && (
        <div className="absolute top-[48px] left-2 right-2 bg-[#111214] rounded-md p-2 shadow-2xl z-[100] border border-black/20">
          <button 
            onClick={handleInvite}
            className="w-full flex items-center justify-between px-2 py-2 text-indigo-400 hover:bg-[#4752c4] hover:text-white rounded-sm transition text-sm font-medium mb-1 group"
          >
            Invite People
            <UserPlus size={16} className="group-hover:scale-110 transition" />
          </button>
          
          <button className="w-full flex items-center justify-between px-2 py-2 text-gray-300 hover:bg-[#313338] rounded-sm transition text-sm">
            Server Settings
            <Settings size={16} />
          </button>

          <div className="h-[1px] bg-white/5 my-1" />

          <button className="w-full flex items-center justify-between px-2 py-2 text-rose-500 hover:bg-[#da373c] hover:text-white rounded-sm transition text-sm">
            Leave Server
            <LogOut size={16} />
          </button>
        </div>
      )}
    </div>

      <div className="flex-1 overflow-y-auto no-scrollbar pt-3">
        {/* Search Bar */}
        <div className="px-2 mb-4">
          <button className="flex items-center gap-2 w-full px-2 py-1.5 rounded-md bg-[#1e1f22] text-[#80848e] text-xs hover:bg-[#1e1f22]/80 transition">
            <Search size={14} /> Search
          </button>
        </div>

        {/* --- TEXT CHANNELS CATEGORY --- */}
        <div className="px-2 mb-4">
          <div className="flex items-center justify-between px-2 mb-1 group">
            <div className="flex items-center gap-0.5 cursor-pointer hover:text-[#dbdee1]">
              <ChevronDown size={12} />
              <span className="text-[12px] font-medium uppercase tracking-wider">Text Channels</span>
            </div>
            <Plus 
              onClick={() => {
                // Yahan check karein ke server object mojud hai ya nahi
                if (server && server.id) {
                  setIsChannelModalOpen(true);
                } else {
                  console.error("Critical: Server object is null at click time!", server);
                }
              }} 
              size={14} 
              className="cursor-pointer hover:text-white transition" 
            />
          </div>

        <div className="space-y-[2px]">
      {textChannels.map((channel: any) => (
  <div 
    key={channel.id}
    onClick={() => onChannelSelect(channel.id)} // ✅ Click par parent ko ID bhejien
    className={`flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer 
      ${activeChannelId === channel.id ? "bg-[#3f4147] text-white" : "text-[#949ba4] hover:bg-[#35373c]"}`}
  >
    <Hash size={20} />
    <span>{channel.name}</span>
  </div>
))}
    </div>

        {/* --- VOICE CHANNELS CATEGORY --- */}
        <div className="py-2 mb-4">
          <div className="flex items-center justify-between px-2 mb-1 group">
            <div className="flex items-center gap-0.5 cursor-pointer hover:text-[#dbdee1] transition">
              <ChevronDown size={12} />
              <span className="text-[12px] font-medium uppercase tracking-wider">Voice Channels</span>
            </div>
            <Plus 
              onClick={() => setIsChannelModalOpen(true)}
              size={14} 
              className="cursor-pointer hover:text-white transition" 
            />
          </div>
          <div className="space-y-[2px]">
  {voiceChannels.map((channel: any) => (
  <div 
    key={channel.id}
    // ✅ FIX: 'vc' ki jagah 'channel' use karein
    onClick={() => handleJoinVC(channel.id, channel.name)} 
    className={`flex items-center gap-2.5 px-2 py-1.5 rounded-md transition-all group cursor-pointer
      ${activeChannelId === channel.id 
        ? "bg-[#35373c] text-white" 
        : "text-[#949ba4] hover:bg-[#35373c] hover:text-[#dbdee1]"
      }`}
  >
    <Volume2 size={20} className={activeChannelId === channel.id ? "text-[#23a559]" : "text-[#949ba4]"} />
    <span className="text-[15px] font-medium">{channel.name}</span>
  </div>
))}
</div>
        </div>
      </div>

      {/* --- MODAL PLACEMENT --- */}
      {/* Ensure serverId is being passed as 'server.id' */}
      <CreateChannelModal 
        isOpen={isChannelModalOpen} 
        onClose={() => setIsChannelModalOpen(false)} 
        serverId={server?.id} 
      />
    </div>
    </div>
  );
};