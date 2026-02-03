"use client";
import { useState, useEffect } from "react";
import { UserPlus, Search, Check, X, MessageSquare, MoreVertical, Clock } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { HoverAvatar } from "@/components/HoverAvatar"; // Import line
import { useRouter } from "next/navigation";

interface FriendsManagerProps {
  fetchFriends: () => void;
  currentUser: any;
  mobileMenuTrigger: any;
  presenceState: Record<string, any>
  pendingRequests: any[];
  setPendingRequests: React.Dispatch<React.SetStateAction<any[]>>;
}

export default function FriendsManager({ fetchFriends: syncSidebar, currentUser, mobileMenuTrigger, presenceState }: FriendsManagerProps) {
  const [subTab, setSubTab] = useState("online");
  const [targetName, setTargetName] = useState("");
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [friends, setFriends] = useState<any[]>([]);
  const router = useRouter();

  const fetchLocalFriends = async () => {
    try {
      const res = await fetch("/api/friends/list");
      if (res.ok) {
        const data = await res.json();
        setFriends(data);
      }
    } catch (error) { console.error("Error:", error); }
  };

  const fetchPending = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/friends/pending");
      if (res.ok) {
        const data = await res.json();
        setPendingRequests(data);
      }
    } catch (error) { console.error("Error:", error); }
    finally { setLoading(false); }
  };


  useEffect(() => {
  const handleRefresh = () => {
    console.log("🔄 Refreshing pending requests...");
    fetchPending(); // Aapka pending requests fetch karne wala function
  };

  window.addEventListener('refresh-pending', handleRefresh);
  
  return () => {
    window.removeEventListener('refresh-pending', handleRefresh);
  };
}, []);



  useEffect(() => {
    fetchLocalFriends();
    if (subTab === "pending") fetchPending();
  }, [subTab]);

  const handleAction = async (requestId: string, action: 'ACCEPT' | 'DECLINE') => {
    try {
      const route = action === 'ACCEPT' ? "/api/friends/accept" : "/api/friends/action";
      const method = action === 'ACCEPT' ? "POST" : "PATCH";
      const res = await fetch(route, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, action }),
      });
      const data = await res.json();
      if (res.ok) {
        setPendingRequests((prev) => prev.filter((req) => req.id !== requestId));
        fetchLocalFriends();
        if (syncSidebar) syncSidebar();
        if (action === 'ACCEPT' && data.senderId) {
          const channel = supabase.channel('global-notifications');
          await channel.send({
            type: 'broadcast',
            event: 'friend_request_accepted',
            payload: { receiverId: data.senderId, acceptedByName: currentUser.name }
          });
        }
        router.refresh();
      }
    } catch (err) { console.error(err); }
  };

  const sendRequest = async () => {
    if (!targetName) return;
    try {
      const res = await fetch("/api/friends/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetName }),
      });
      const data = await res.json();
      if (res.ok) {
        const channel = supabase.channel('global-notifications');
        await channel.send({
          type: 'broadcast',
          event: 'friend_request',
          payload: { receiverId: data.receiverId, senderName: currentUser.name }
        });
        setTargetName("");
        alert("Request Sent!");
      } else { alert(data.error); }
    } catch (err) { console.error(err); }
  };

const displayFriends = friends.filter((f) => {
  // 1. Pehle realtime status check karein
  const isOnlineRealtime = !!presenceState[f.id] && presenceState[f.id].length > 0;
  
  // 2. Database status check karein
  const isOnlineInDb = f.status !== "OFFLINE" && f.status !== "offline";

  // Final Online Check
  const isCurrentlyOnline = isOnlineRealtime || isOnlineInDb;

  // 📂 Tabs Logic:
  if (subTab === "online") {
    return isCurrentlyOnline; // Sirf online wale dikhao
  }
  
  if (subTab === "all") {
    return true; // Sare friends dikhao
  }

  // Pending aur Add tabs ke liye friends list khali rakhein (kyun ki unka apna UI niche bana hua hai)
  return false; 
});
  return (
    <div className="flex-1 flex flex-col bg-transparent font-sans text-[#dbdee1] h-full overflow-hidden">
      
      {/* ✅ NAVBAR */}
      <div className="h-12 mt-3 border-b border-white/5 flex items-center px-4 bg-black/10 shrink-0">
        <div className="md:hidden mr-2">{mobileMenuTrigger}</div>
        <div className="flex items-center gap-2 pr-4 border-r border-white/10 shrink-0">
           <svg aria-hidden="true" role="img" xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#c4c4c4b3" viewBox="0 0 24 24">
        <path fill="var(--interactive-icon-default)" d="M13 10a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"></path>
        <path fill="var(--interactive-icon-default)" d="M3 5v-.75C3 3.56 3.56 3 4.25 3s1.24.56 1.33 1.25C6.12 8.65 9.46 12 13 12h1a8 8 0 0 1 8 8 2 2 0 0 1-2 2 .21.21 0 0 1-.2-.15 7.65 7.65 0 0 0-1.32-2.3c-.15-.2-.42-.06-.39.17l.25 2c.02.15-.1.28-.25.28H9a2 2 0 0 1-2-2v-2.22c0-1.57-.67-3.05-1.53-4.37A15.85 15.85 0 0 1 3 5Z">
          </path>
          </svg>
          <span className="font-medium text-[15px]">Friends</span>
        </div>
        
        <div className="flex-1 overflow-x-auto no-scrollbar flex items-center h-full px-2 gap-2">
          {["online", "all", "pending"].map((t) => (
            <button key={t} onClick={() => setSubTab(t)}
              className={`text-[14px] font-medium px-3 py-1 cursor-pointer rounded transition-all capitalize whitespace-nowrap shrink-0
                ${subTab === t ? "bg-white/10 text-white" : "text-[#949ba4] hover:text-[#dbdee1] hover:bg-white/5"}`}
            >
              {t} {t === "pending" && pendingRequests.length > 0 && (
                <span className="ml-1 bg-rose-500 text-white text-[10px] px-1.5 rounded-full">{pendingRequests.length}</span>
              )}
            </button>
          ))}
          <button onClick={() => setSubTab("add")}
            className={`text-[14px] cursor-pointer font-medium px-3 py-1 rounded transition-all whitespace-nowrap shrink-0
              ${subTab === "add" ? "text-[#23a559] bg-[#23a559]/10" : "bg-[#248046] text-white hover:bg-[#1a6334]"}`}
          >
            Add Friend
          </button>
        </div>
      </div>

      {/* ✅ CONTENT AREA */}
      <div className="flex-1 p-4 overflow-y-auto custom-scrollbar">
        
        {/* 1. ADD FRIEND VIEW */}
        {subTab === "add" && (
          <div className="max-w-2xl animate-in fade-in slide-in-from-top-2">
            <h2 className="text-white font-medium text-lg uppercase mb-2">Add Friend</h2>
            <p className="text-[#949ba4] text-sm mb-4">You can add friends with their Discord username.</p>
            <div className="bg-[#1e1f22] rounded-lg p-3 flex items-center border border-black/40 focus-within:border-[#00a8fc] transition-all">
              <input 
                value={targetName}
                onChange={(e) => setTargetName(e.target.value)}
                placeholder="You can add friends with their Discord username." 
                className="bg-transparent outline-none flex-1 text-white placeholder:text-[#4e5058]" 
              />
              <button onClick={sendRequest} disabled={!targetName} 
                className="bg-[#5865f2] hover:bg-[#4752c4] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-1.5 rounded transition">
                Send Friend Request
              </button>
            </div>
          </div>
        )}

        {/* 2. PENDING REQUESTS VIEW */}
        {subTab === "pending" && (
          <div className="space-y-4 animate-in fade-in">
            <p className="text-[#949ba4] text-[12px] font-medium uppercase tracking-wider">Pending — {pendingRequests.length}</p>
            {pendingRequests.length > 0 ? pendingRequests.map((req) => (
              <div key={req.id} className="flex items-center justify-between p-2 hover:bg-white/5 rounded-lg border-t border-white/5 group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center font-medium text-white">
                    {req.sender?.name?.[0] || "?"}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-white font-medium text-sm">{req.sender?.name}</span>
                    <span className="text-gray-400 text-xs">Incoming Friend Request</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleAction(req.id, 'ACCEPT')} className="p-2 bg-[#2b2d31] hover:bg-[#23a559] text-[#23a559] hover:text-white rounded-full transition-all shadow-xl">
                    <Check size={20} />
                  </button>
                  <button onClick={() => handleAction(req.id, 'DECLINE')} className="p-2 bg-[#2b2d31] hover:bg-rose-500 text-rose-500 hover:text-white rounded-full transition-all shadow-xl">
                    <X size={20} />
                  </button>
                </div>
              </div>
            )) : (
              <div className="flex flex-col items-center justify-center py-20 opacity-30">
                <Clock size={60} />
                <p className="mt-4">There are no pending friend requests.</p>
              </div>
            )}
          </div>
        )}

        {/* 3. FRIENDS LIST VIEW (Online / All) */}
       {displayFriends.map(friend => {

        const presenceData = presenceState[friend.id]?.[0]; 
const currentStatus = presenceData?.status || friend.status || 'OFFLINE';
  console.log("Friend ID:", friend.id, "Presence Data:", presenceState[friend.id]);
        return(
  <div key={friend.id} className="flex items-center justify-between p-2.5 hover:bg-white/5 rounded-md group transition-colors cursor-pointer border-t border-white/[0.02]">
    <div className="flex items-center gap-3">
      <div className="relative">
        {/* Avatar Container */}
        <HoverAvatar 
      src={friend.image} 
      name={friend.name} 
     status={currentStatus}
      className="w-9 h-9 rounded-full" 
    />

        {/* ✅ DISCORD STYLE STATUS ICONS */}
        <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-[3px] border-[#0B0F14] flex items-center justify-center
            ${currentStatus === 'ONLINE' ? 'bg-green-500' : 
              currentStatus === 'DND' ? 'bg-red-500' : 
              currentStatus === 'IDLE' ? 'bg-yellow-500' : 'bg-gray-500'}`} // ✅ currentStatus use karein
          >
            {/* DND Logic */}
            {(currentStatus === 'DND' || currentStatus === 'dnd') && (
              <div className="w-1.5 h-[2px] bg-[#0B0F14] rounded-full" />
            )}

            {/* IDLE Logic */}
            {(currentStatus === 'IDLE' || currentStatus === 'idle') && (
              <div className="absolute w-2 h-2 bg-[#0B0F14] rounded-full -translate-x-0.5 -translate-y-0.5" 
                   style={{ clipPath: 'circle(100% at 20% 20%)' }} />
            )}

            {/* OFFLINE Logic */}
            {(currentStatus === 'OFFLINE' || currentStatus === 'offline') && (
              <div className="w-1.5 h-1.5 bg-[#0B0F14] rounded-full" />
            )}
        </div>
      </div>

    <div className="flex flex-col">
        <span className="text-[14px] font-medium text-white leading-tight">{friend.name}</span>
        <span className="text-[12px] text-gray-400 font-medium capitalize">{currentStatus.toLowerCase()}</span>
      </div>
    </div>

    {/* Action Buttons */}
    <div className="flex gap-2 opacity-0 group-hover:opacity-100 md:opacity-100 transition-opacity">
      <button className="p-2 bg-black/40 text-gray-300 hover:text-white rounded-full">
        <MessageSquare size={18} />
      </button>
      <button className="p-2 bg-black/40 text-gray-300 hover:text-white rounded-full">
        <MoreVertical size={18} />
      </button>
    </div>
  </div>
        );
})}
      </div>
    </div>
  );
}