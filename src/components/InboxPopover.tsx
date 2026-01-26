"use client";
import { Inbox, X } from "lucide-react";
import { useState } from "react";

export const InboxPopover = () => {
  const [isOpen, setIsOpen] = useState(false);
// Dashboard level par state
const [notifications, setNotifications] = useState<any[]>([]);

// Jab koi naya message aaye (useEffect mein socket ke saath)
// setNotifications(prev => [newMessage, ...prev]);

return (
  <div className="relative">
    <Inbox 
      size={20} 
      onClick={() => setIsOpen(!isOpen)}
      className={`cursor-pointer ${notifications.length > 0 ? 'text-white' : 'text-gray-400'}`}
    />
    
    {/* ✅ RED DOT (Notification Badge) */}
    {notifications.length > 0 && (
      <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#f23f43] rounded-full border-2 border-[#313338]" />
    )}

    {/* Inbox Popover (Jo pehle banaya tha) */}
    {isOpen && (
      <div className="absolute top-10 right-0 w-80 bg-[#2b2d31] shadow-xl border border-black/20 rounded-md z-50 overflow-hidden">
        <div className="p-3 font-bold text-white border-b border-black/20">Notifications</div>
        <div className="max-h-[400px] overflow-y-auto">
          {notifications.length > 0 ? (
            notifications.map(n => (
              <div key={n.id} className="p-3 border-b border-white/5 hover:bg-white/5 cursor-pointer">
                <div className="flex gap-3">
                  <img src={n.user?.image} className="w-8 h-8 rounded-full" />
                  <div className="flex-1">
                    <p className="text-sm text-white font-semibold">{n.user?.name}</p>
                    <p className="text-xs text-gray-400 line-clamp-1">{n.content}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-10 text-center text-gray-500">No new messages</div>
          )}
        </div>
      </div>
    )}
  </div>
);
};