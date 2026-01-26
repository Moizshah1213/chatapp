"use client";
import { useEffect, useState } from "react";
import { Plus, LayoutDashboard } from "lucide-react"; // Discord icon ki jagah LayoutDashboard use kar sakte hain
import { useRouter, useParams } from "next/navigation"; // useParams add kiya
import CreateServerModal from "@/components/modals/CreateServerModal";

export const NavigationSidebar = () => {
  const [servers, setServers] = useState<any[]>([]);
  const router = useRouter();
  const params = useParams(); // URL se serverId nikalne ke liye
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchServers = async () => {
      try {
        const res = await fetch("/api/servers/list");
        if (res.ok) {
          const data = await res.json();
          setServers(data);
        }
      } catch (error) {
        console.error("Failed to fetch servers", error);
      }
    };
    fetchServers();
  }, []);

  return (
    <div className="space-y-4 flex flex-col items-center h-full text-primary w-full bg-[#1e1f22] py-3">
      {/* Home / DMs Button */}
      <div 
        onClick={() => router.push("/")}
        className="group relative flex items-center cursor-pointer"
      >
        {/* Home Active Indicator */}
        <div className={`absolute left-[-12px] bg-white rounded-r-full transition-all w-[4px] 
          ${!params?.serverId ? "h-[36px]" : "h-[8px] group-hover:h-[20px] opacity-0 group-hover:opacity-100"}`} 
        />
        <div className={`w-12 h-12 rounded-[24px] group-hover:rounded-[16px] transition-all overflow-hidden flex items-center justify-center
          ${!params?.serverId ? "bg-indigo-500 text-white rounded-[16px]" : "bg-[#313338] text-[#23a559] group-hover:bg-indigo-500 group-hover:text-white"}`}
        >
          <LayoutDashboard size={28} />
        </div>
      </div>

      <div className="h-[2px] bg-[#313338] w-8 mx-auto rounded-md" />

      {/* Servers List */}
      <div className="flex-1 w-full overflow-y-auto no-scrollbar space-y-2 px-2">
        {servers.map((server) => (
          <div key={server.id} className="group relative flex items-center mb-2 justify-center">
            {/* Server Active Indicator */}
            <div className={`absolute left-[-8px] bg-white rounded-r-full transition-all w-[4px] 
              ${params?.serverId === server.id ? "h-[36px]" : "h-[8px] group-hover:h-[20px] opacity-0 group-hover:opacity-100"}`} 
            />
            <button
              onClick={() => router.push(`/servers/${server.id}`)}
              className={`relative group flex h-12 w-12 rounded-[24px] group-hover:rounded-[16px] transition-all overflow-hidden bg-[#313338]
                ${params?.serverId === server.id ? "rounded-[16px]" : ""}`}
            >
              <img src={server.imageUrl} className="object-cover w-full h-full" alt="server" />
            </button>
          </div>
        ))}
        
        {/* Add Server Plus Button */}
        <button 
          onClick={() => setIsModalOpen(true)}
          className="group flex items-center justify-center h-12 w-12 rounded-[24px] hover:rounded-[16px] transition-all overflow-hidden bg-[#313338] hover:bg-[#23a559] mx-auto"
        >
          <Plus className="group-hover:text-white text-[#23a559] transition" size={25} />
        </button>
      </div>

      <CreateServerModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
}