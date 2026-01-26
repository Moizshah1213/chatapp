"use client";
import { Pin, X } from "lucide-react";
import { useState } from "react";

interface PinnedMessagesProps {
  channelId?: string;
  receiverId?: string;
  scrollToMessage: (id: string) => void;
  messages: any[]; // ✅ Dashboard se state lein
}

export const PinnedMessages = ({ channelId, scrollToMessage, receiverId, messages }: PinnedMessagesProps) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // ✅ Filter pins directly from current chat messages
  const pinnedList = messages.filter(m => 
    m.isPinned && (channelId ? m.channelId === channelId : m.receiverId === receiverId)
  );

  return (
    <div className="relative flex items-center">
      <Pin 
        size={20} 
        className={`hover:text-white cursor-pointer transition ${isOpen ? 'text-white' : 'text-gray-400'}`} 
        onClick={() => setIsOpen(!isOpen)}
      />

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute top-10 right-0 w-[400px] max-h-[500px] bg-[#2b2d31] shadow-2xl rounded-md border border-black/20 z-50 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 origin-top-right">
            <div className="p-4 border-b border-black/20 bg-[#2b2d31] flex justify-between items-center">
              <h3 className="text-white font-bold text-sm flex items-center gap-2">
                <Pin size={14} /> Pinned Messages ({pinnedList.length})
              </h3>
              <X size={18} className="cursor-pointer text-gray-400 hover:text-white" onClick={() => setIsOpen(false)} />
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2 bg-[#2b2d31]">
              {pinnedList.length > 0 ? (
                pinnedList.map((msg) => (
                  <div key={msg.id} className="bg-[#1e1f22] p-3 rounded border border-white/5 group relative">
                    <div className="flex items-center gap-2 mb-1">
                      <img src={msg.user?.image} className="w-5 h-5 rounded-full" />
                      <span className="text-[12px] font-bold text-white">{msg.user?.name}</span>
                    </div>
                    <p className="text-sm text-[#dbdee1] break-words line-clamp-3">{msg.content || "Media Message"}</p>
                    
                    <button 
                      onClick={() => {
                        setIsOpen(false);
                        scrollToMessage(msg.id); // ✅ Smooth jump
                      }}
                      className="text-[10px] text-indigo-400 mt-2 hover:underline cursor-pointer"
                    >
                      Jump to message
                    </button>
                  </div>
                ))
              ) : (
                <div className="p-10 flex flex-col items-center justify-center opacity-40">
                  <Pin size={40} className="mb-2 -rotate-12" />
                  <p className="text-xs text-center">No pinned messages yet.</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};