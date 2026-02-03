
"use client";
import { useEffect, useRef } from "react";
import { Phone, PhoneOff } from "lucide-react";
import { HoverAvatar } from "./HoverAvatar";

interface IncomingCallProps {
  callerName: string;
  callerImage: string;
  onAccept: () => void;
  onReject: () => void;
 
}

export const IncomingCallOverlay = ({ callerName, callerImage, onAccept, onReject }: IncomingCallProps) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 1. Audio Logic
  useEffect(() => {
    const ringtone = new Audio("/sounds/discord.mp3");
    ringtone.loop = true;
    audioRef.current = ringtone;

    const playPromise = ringtone.play();
    if (playPromise !== undefined) {
      playPromise.catch((error) => console.log("Autoplay blocked", error));
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, []);

  // 2. Fix: Handle Reject Logic (Ab ye chatChannel use karega jo prop se aa raha hai)
  
  return (
    <div className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-md flex items-center justify-center">
      <div className="bg-[#1e1f22] w-full max-w-sm rounded-2xl p-8 flex flex-col items-center gap-6 shadow-2xl border border-white/10 animate-in zoom-in duration-300">
        
        {/* UI elements (same as before) */}
        <div className="relative">
          <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-20" />
          <HoverAvatar
          src={callerImage}

          className="w-20 h-20 rounded-full"/>
        </div>

        <div className="text-center">
          <h2 className="text-white text-2xl font-medium">{callerName}</h2>
          <p className="text-green-500 animate-pulse mt-1 text-xs font-medium uppercase tracking-widest">
            Incoming Call...
          </p>
        </div>

        <div className="flex gap-10 mt-4">
          <button onClick={onReject} className="flex flex-col items-center gap-2">
            <div className="p-4 bg-[#f23f42] text-white rounded-full hover:scale-110 transition-transform shadow-lg">
              <PhoneOff size={28} />
            </div>
            <span className="text-[10px] text-gray-400 font-medium uppercase">Decline</span>
          </button>

          <button onClick={onAccept} className="flex flex-col items-center gap-2">
            <div className="p-4 bg-[#23a559] text-white rounded-full hover:scale-110 transition-transform shadow-lg animate-bounce">
              <Phone size={28} />
            </div>
            <span className="text-[10px] text-gray-400 font-medium uppercase">Accept</span>
          </button>
        </div>
      </div>
    </div>
  );
};