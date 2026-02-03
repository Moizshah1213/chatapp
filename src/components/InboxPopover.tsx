"use client";
import { Inbox } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase"; // Apna supabase client import karein

export const InboxPopover = ({ currentUserId, onOpen, onNavigate }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const router = useRouter();

 

  
const handleNotifClick = async (n: any) => {
    console.log("🖱️ Notification Clicked:", n); // 👈 Console check karein
    
    try {
      // 1. DB Update
      await supabase.from('Notification').update({ isRead: true }).eq('id', n.id);
      
      // 2. Local State Update (Read mark)
      setNotifications(prev => prev.map(item => item.id === n.id ? { ...item, isRead: true } : item));

      // 3. 🚀 Dashboard ka function call karein
      if (onNavigate) {
        onNavigate(n); 
      }

      setIsOpen(false); // Popover band kardo
    } catch (err) {
      console.error("Click error:", err);
    }
  };
  // 1. 🟢 Load Notifications from DB (Persistent)
useEffect(() => {
  // InboxPopover.tsx ke andar
const fetchNotifications = async () => {
const { data, error } = await supabase
  .from('Notification')
  .select(`
    *,
    sender:senderId (
      name,
      image
    )
  `)
  .eq('userId', currentUserId)
  .order('createdAt', { ascending: false });

  if (error) {
    console.error("Fetch Error:", error);
    return;
  }
  setNotifications(data || []);
};

  fetchNotifications();
}, [currentUserId]);
  // 2. ⚡ Real-time Listener (Mentions & Tags)
  // InboxPopover.tsx ke andar
useEffect(() => {
  if (!currentUserId) return;

  const channel = supabase.channel(`user-notifications-${currentUserId}`);
  
  channel
    .on('broadcast', { event: 'new_prover_notif' }, ({ payload }) => {
      console.log("🔥 NOTIFICATION RECEIVED IN INBOX:", payload);
      setNotifications(prev => [payload, ...prev]);
    })
    .subscribe((status) => {
      console.log("📡 Subscription Status for Inbox:", status); 
      // Agar yahan 'SUBSCRIBED' nahi aa raha, toh masla connection ka hai
    });

  return () => {
    supabase.removeChannel(channel);
  };
}, [currentUserId]);

  // 3. ✅ Mark as Read Logic
  const resetNotificationCount = async () => {
  if (!currentUserId || notifications.length === 0) return;

  // 1. Local UI foran update karein
  setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));

  // 2. Database mein update
  await supabase
    .from('Notification')
    .update({ isRead: true })
    .eq('userId', currentUserId)
    .eq('isRead', false);
};

// useEffect jo popover khulne par chalta hai
// Jab Popover khule, tab ye call ho:
useEffect(() => {
  if (isOpen) {
    // 🟢 AB YE FUNCTION CALL HOGA
    resetNotificationCount(); 
    
    if (onOpen) {
      onOpen(); // Dashboard wala reset logic chalayega
    }
  }
}, [isOpen, onOpen]); // dependency array mein onOpen zaroori hai
const unreadCount = notifications.filter(n => !n.isRead).length;


  return (
    <div className="relative">
      <div className="relative cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
        <Inbox 
          size={20} 
          className={notifications.length > 0 ? 'text-white' : 'text-[#b5bac1] hover:text-[#dbdee1]'}
        />
        {unreadCount > 0 && (
    <div className="absolute -top-1 -right-1 px-[4px] py-[1px] bg-[#f23f43] text-white text-[10px] font-medium rounded-full border-2 border-[#313338]">
      {unreadCount}
    </div>
  )}
      </div>

      {isOpen && (
        <div className="absolute top-10 right-0 w-[340px] bg-[#2b2d31] shadow-2xl border border-black/20 rounded-md z-[100] overflow-hidden animate-in fade-in zoom-in duration-200">
          <div className="p-4 font-medium text-white border-b border-black/20 flex justify-between items-center">
            <span>Inbox</span>
            {unreadCount > 0 && (
  <div className="absolute -top-1 -right-1 px-[4px] py-[1px] bg-[#f23f43] text-white text-[10px] font-medium rounded-full border-2 border-[#313338]">
    {unreadCount}
  </div>
)}
          </div>
          
          <div className="max-h-[480px] overflow-y-auto custom-scrollbar">
            {notifications.length > 0 ? (
              notifications.map((n, index) => (
                <div 
                  key={n.id || `notif-${index}`}
                  onClick={() => handleNotifClick(n)}
                  className="p-3 border-b border-white/5 hover:bg-white/5 cursor-pointer group transition"
                >
                  <div className="flex gap-3">
<img 
  // 🟢 Real-time payload aur DB relation dono ko handle karein
  src={n.sender?.image || n.payload?.sender?.image} 
  className="w-8 h-8 rounded-full object-cover"
  alt="sender"
   // Fallback agar link toot jaye
/>                    <div className="flex-1 min-w-0">
  <div className="flex items-center gap-1">
    <span className="text-sm text-white font-medium">{n.sender?.name}</span>
    {/* 🟢 Yahan logic check karein */}
    <span className="text-[10px] text-gray-500">
       {n.serverId ? `tagged you in a server` : "sent you a DM"}
    </span>
  </div>
  
  <p className="text-xs text-[#dbdee1] line-clamp-1 mt-0.5 bg-[#313338] p-1.5 rounded">
    {n.content}
  </p>

  {/* 🟢 Click karne par sahi jagah le jane wala button */}
  <span className="text-[10px] text-indigo-400 mt-1 block font-medium">
     {n.serverId ? "Jump to Server" : "View Chat"}
  </span>
</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center flex flex-col items-center">
                <div className="bg-[#313338] p-4 rounded-full mb-3">
                   <Inbox size={40} className="text-gray-600" />
                </div>
                <p className="text-gray-400 text-sm font-medium">No new notifications</p>
                <p className="text-gray-500 text-[11px] mt-1">Check back later or go touch some grass!</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};