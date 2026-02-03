"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

interface ServerInviteCardProps {
  inviteCode: string;
  currentUserId: string;
  onJoinSuccess?: () => void;
}

export const ServerInviteCard = ({ 
  inviteCode, 
  currentUserId, 
  onJoinSuccess // 🚩 
}: ServerInviteCardProps) => { 

  const [server, setServer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchServerDetails = async () => {
      try {
        // Ek aisi API banani paregi jo server ki public info de code se
        const res = await fetch(`/api/invite/${inviteCode}`);
        const data = await res.json();
        setServer(data);
      } catch (error) {
        console.error("Invite fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    if (inviteCode) fetchServerDetails();
  }, [inviteCode]);

  const onJoin = async () => {
    try {
      setIsJoining(true);
      const res = await fetch("/api/servers/join", {
        method: "POST",
        body: JSON.stringify({ inviteCode }),
      });

      if (res.ok) {
        const data = await res.json();
        // Join karne ke baad us server par switch kar dein
        if (onJoinSuccess) onJoinSuccess();

        window.location.href = `/?serverId=${data.id}`;
      }
    } catch (error) {
      console.error("Join error:", error);
    } finally {
      setIsJoining(false);
    }
  };

  if (loading) return <div className="p-4 bg-[#2b2d31] animate-pulse rounded-md w-64 h-24" />;
  if (!server) return null;

  return (
    <div className="bg-[#2b2d31] p-4 rounded-md border border-[#1e1f22] max-w-[400px] my-2 hover:shadow-lg transition">
      <p className="text-[10px] font-medium text-[#b5bac1] uppercase mb-3">
        You've been invited to join a server
      </p>
      <div className="flex items-center gap-3">
        <div className="relative w-12 h-12">
          <img
  src={server.imageUrl || "/default-server.png"} // ✅ server.image ko server.imageUrl karein
  alt="Server"
  className="rounded-xl object-cover w-full h-full"
/>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white truncate">{server.name}</h3>
          <p className="text-xs text-[#b5bac1] flex items-center gap-1">
            <span className="w-2 h-2 bg-[#23a559] rounded-full" />
            Join to see members
          </p>
        </div>
        <button
          onClick={onJoin}
          disabled={isJoining}
          className="bg-[#248046] hover:bg-[#1a6334] cursor-pointer disabled:opacity-50 text-white px-4 py-2 rounded-sm text-sm font-medium transition"
        >
          {isJoining ? <Loader2 className="w-4 h-4 animate-spin" /> : "Join"}
        </button>
      </div>
    </div>
  );
};