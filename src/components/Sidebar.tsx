"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Plus, LayoutDashboard } from "lucide-react";
import CreateServerModal from "@/components/modals/CreateServerModal";
import { HoverAvatar } from "./HoverAvatar";

interface SidebarProps {
  onNavigate: (tab: string) => void;
  activeTab: string;
}



export default function Sidebar({ onNavigate, activeTab }: SidebarProps) {
  const { data: session } = useSession();
  const [status, setStatus] = useState("ONLINE");
  const [servers, setServers] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleStatusUpdate = async (newStatus: string) => {
    setStatus(newStatus); // UI update instantly
    
    const userId = (session?.user as any)?.id;
    if (!userId) return;

    try {
      await fetch("/api/user/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, status: newStatus }),
      });
    } catch (err) {
      console.error("Failed to update status in DB");
    }
  };

  useEffect(() => {
    const fetchServers = async () => {
      const res = await fetch("/api/servers/list");
      if (res.ok) {
        const data = await res.json();
        setServers(data);
      }
    };
    fetchServers();
  }, []);

  return (
    <div className="w-[70px] h-full flex flex-col items-center py-4 bg-black/40 backdrop-blur-xl border-r border-white/5">
      
      {/* 1. Top Home/DMs Icon */}
      <div className="relative flex items-center group mb-4 w-full">
        {/* Active Pill Indicator */}
        <div className={`absolute left-0 bg-blue-500 rounded-r-full transition-all w-[4px] 
          ${activeTab === "home" ? "h-[32px]" : "h-[8px] group-hover:h-[20px] opacity-0 group-hover:opacity-100"}`} 
        />
        
        <div 
          onClick={() => onNavigate("home")}
          className={`w-12 h-12 flex items-center justify-center transition-all cursor-pointer mx-auto
            ${activeTab === "home" 
              ? "bg-gradient-to-br from-blue-600 to-blue-900 rounded-[16px] text-white shadow-lg shadow-blue-600/30" 
              : "bg-white/5 rounded-[24px] text-gray-400 hover:bg-gradient-to-br hover:from-blue-600 hover:to-blue-900 hover:rounded-[16px] hover:text-white"}`}
        >
          <LayoutDashboard size={26} />
        </div>
      </div>

      <div className="w-8 h-[1px] bg-white/10 rounded-full mb-4" />

      {/* 2. Servers List */}
      <div className="flex-1 w-full flex flex-col items-center gap-3 overflow-y-auto no-scrollbar">
        {servers.map((server) => (
          <button key={server.id} onClick={() => {console.log("Full ID check:", server.id);
          onNavigate(`server-${server.id}`)
          } } className="relative group">
            <div className={`absolute left-[-5px] top-2 bg-white rounded-r-full transition-all w-[3px] ${activeTab === `server-${server.id}` ? "h-8" : "h-2 group-hover:h-5"}`} />
            <div className="w-12 h-12 rounded-[24px] group-hover:rounded-[16px] transition-all overflow-hidden bg-[#313338]">
              <HoverAvatar 
      src={server.imageUrl} 
      name={server.name} 
      className="w-full h-full object-cover " 
    />
            </div>
          </button>
        ))}

        {/* Plus Button to Create Server */}
        <button onClick={() => setIsModalOpen(true)} className="group flex items-center justify-center w-12 h-12 rounded-[24px] hover:rounded-[16px] transition-all bg-[#313338] hover:bg-green-500">
          <Plus className="text-green-500 group-hover:text-white" size={25} />
        </button>
      </div>

      <CreateServerModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      {/* 3. Bottom Status/Avatar Section */}
      
    </div>
  );
}