"use client";
import { 
  LiveKitRoom, 
  useLocalParticipant,
  RoomAudioRenderer,
  useMediaDeviceSelect,
  useParticipants, // 👈 Voice activity ke liye zaroori
} from "@livekit/components-react";
import { Mic, MicOff, PhoneOff, MoreVertical, VolumeX, Volume2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { HoverAvatar } from "./HoverAvatar";
import "@livekit/components-styles";
import { DeviceSelector } from "./DeviceSelector";

interface VoiceCallProps {
  caller: any;
  receiver: any;
  isMicMuted: boolean;
  onMuteToggle: () => void;
  onEndCall: () => void;
  callStatus: "dialing" | "connected" | "rejected";
}

const CallContent = ({ caller, receiver, isMicMuted, onMuteToggle, onEndCall, callStatus }: VoiceCallProps) => {
  const [isDeafened, setIsDeafened] = useState(false);
  const [showDeviceMenu, setShowDeviceMenu] = useState(false);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);
  
  // --- 1. TIMER LOGIC ---
  const [time, setTime] = useState(0);
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (callStatus === "connected") {
      interval = setInterval(() => setTime((prev) => prev + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [callStatus]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // --- 2. SPEAKING INDICATOR LOGIC ---
  const participants = useParticipants();
  const { localParticipant } = useLocalParticipant();

  // Aap bol rahe hain?
  const isCallerSpeaking = localParticipant?.isSpeaking;
  // Dost bol raha hai?
  const receiverParticipant = participants.find(p => p.identity !== localParticipant?.identity);
  const isReceiverSpeaking = receiverParticipant?.isSpeaking;

  // Sync mic state
  useEffect(() => {
    localParticipant?.setMicrophoneEnabled(!isMicMuted);
  }, [isMicMuted, localParticipant]);

  // Sound Logic
  useEffect(() => {
    let dialSound: HTMLAudioElement | null = null;
    if (callStatus === "dialing") {
      dialSound = new Audio("/sounds/discord.mp3");
      dialSound.loop = true;
      dialSound.play().catch(e => console.log("Audio play error:", e));
    }
    return () => {
      if (dialSound) {
        dialSound.pause();
        dialSound.currentTime = 0;
      }
    };
  }, [callStatus]);

  const handleMenuToggle = (e: React.MouseEvent) => {
    setAnchorRect(e.currentTarget.getBoundingClientRect());
    setShowDeviceMenu(!showDeviceMenu);
  };

  const { devices: microphones, activeDeviceId: activeMic, setActiveMediaDevice: setMic } = useMediaDeviceSelect({ kind: 'audioinput' });
  const { devices: speakers, activeDeviceId: activeSpeaker, setActiveMediaDevice: setSpeaker } = useMediaDeviceSelect({ kind: 'audiooutput' });

  return (
    <div className="flex flex-col h-[250px] bg-[#111214] m-4 rounded-2xl overflow-hidden relative group border border-white/5 shadow-2xl">
      <RoomAudioRenderer muted={isDeafened} />

      <div className="flex-1 flex flex-row items-center relative bottom-[15px] justify-center gap-10 p-6 bg-gradient-to-b from-[#1e1f22] to-[#111214]">
        
        {/* Caller (You) */}
        <div className="flex flex-col items-center gap-4 transition-all duration-500">
          <div className={`relative transition-all duration-300 rounded-full ${
            isCallerSpeaking ? 'ring-[3px] ring-green-500 ring-offset-4 ring-offset-[#1e1f22]' : 'ring-0'
          }`}>
            <HoverAvatar src={caller?.image} name={caller?.name} className="w-16 h-16 rounded-full" />
            {isMicMuted && (
              <div className="absolute -bottom-1 -right-1 bg-[#f23f42] p-1.5 rounded-full border-[3px] border-[#1e1f22]">
                <MicOff size={12} className="text-white" />
              </div>
            )}
          </div>
        </div>

        {/* Receiver (Friend) */}
        <div className={`flex flex-col items-center gap-4 transition-all duration-700 ease-in-out ${
          callStatus === "rejected" ? "hidden opacity-0 w-0 overflow-hidden" : "scale-100 opacity-100"
        }`}>
          <div className="relative flex items-center justify-center">
             {/* Discord Ringing Animation */}
             {callStatus === "dialing" && (
               <>
                 <div className="absolute w-16 h-16 bg-white/20 rounded-full animate-discord-ring" />
                 <div className="absolute w-16 h-16 bg-white/20 rounded-full animate-discord-ring [animation-delay:1s]" />
               </>
             )}

            <div className={`relative z-10 transition-all duration-300 rounded-full ${
              isReceiverSpeaking ? 'ring-[3px] ring-green-500 ring-offset-4 ring-offset-[#1e1f22]' : 'ring-0'
            }`}>
              <HoverAvatar 
                src={receiver?.image} 
                name={receiver?.name} 
                className={`w-16 h-16 rounded-full border-2 transition-colors duration-500 ${
                  callStatus === "connected" ? "border-white/5" : "border-white/10"
                }`} 
              />
            </div>
          </div>
        </div>

        {/* Rejected View */}
        {callStatus === "rejected" && (
          <div className="flex flex-col items-center animate-in fade-in zoom-in duration-500">

            <div className="bg-rose-500/10 rounded-full w-16 h-16 border border-rose-500/20  relative">
              <PhoneOff size={24} className="text-rose-500/50 top-[19px] left-[18px] relative" />
              <div className="absolute inset-0 bg-rose-500/5 rounded-full animate-ping" />
            </div>
           
          </div>
        )}
      </div>

      {/* --- Floating Controls & Timer --- */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-[#1e1f22]/95 backdrop-blur-xl px-5 py-2.5 rounded-[18px] border border-white/10 shadow-2xl">
        
        {/* Timer Display */}
        {callStatus === "connected" && (
          <div className="px-2 text-[11px] font-mono text-white/50 border-r border-white/10 mr-1">
            {formatTime(time)}
          </div>
        )}

        <button onClick={onMuteToggle} className={`p-2.5 rounded-full transition-colors ${isMicMuted ? 'bg-white text-black' : 'hover:bg-[#35373c] text-[#b5bac1]'}`}>
          {isMicMuted ? <MicOff size={18} /> : <Mic size={18} />}
        </button>

        <button onClick={() => setIsDeafened(!isDeafened)} className={`p-2.5 rounded-full transition-colors ${isDeafened ? 'bg-[#f23f42] text-white' : 'hover:bg-[#35373c] text-[#b5bac1]'}`}>
          {isDeafened ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>

        <button onClick={onEndCall} className="p-2.5 bg-[#f23f42] hover:bg-[#d83c3e] text-white rounded-full mx-1">
          <PhoneOff size={18} />
        </button>

        <div className="w-[1px] h-5 bg-white/10 mx-1" />

        <div className="relative">
          <button onClick={handleMenuToggle} className="p-2.5 text-[#b5bac1] hover:text-white">
            <MoreVertical size={20} />
          </button>

          {showDeviceMenu && anchorRect && (
            <DeviceSelector 
              microphones={microphones}
              speakers={speakers}
              activeMic={activeMic}
              activeSpeaker={activeSpeaker}
              anchorRect={anchorRect}
              onClose={() => setShowDeviceMenu(false)}
              onSelect={(kind: any, id: any) => {
                if (kind === 'audioinput') setMic(id);
                else setSpeaker(id);
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export const VoiceCallOverlay = (props: VoiceCallProps) => {
 


  return (
    <div className="pointer-events-auto w-full">
      <CallContent {...props} />
      </div>
   
  );
};