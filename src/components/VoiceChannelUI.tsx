import React, { useEffect, useState } from 'react';
import { 
  LiveKitRoom, 
  RoomAudioRenderer, 
  useParticipants, 
  useTracks,
  useLocalParticipant
} from "@livekit/components-react";
import { Track } from "livekit-client";
import { Mic, MicOff, PhoneOff, Headphones, Volume2, Shield, Settings,ChevronDown, MonitorUp } from "lucide-react";
import "@livekit/components-styles";
import { TrackPublication,} from "livekit-client"; // 👈 Ye line add karein
// ... baki imports

interface VoiceChannelUIProps {
  channelName: string;
  channelId: string;
  currentUser: any;
  onLeave: () => void;
  isExternalMuted: boolean;
  onClose: () => void;
  onMuteChange: (val: boolean) => void;
  
}

export const VoiceChannelUI = ({ 
  channelName, 
  channelId, 
  currentUser, 
  onLeave,
  onClose, 
  isExternalMuted,
  onMuteChange,
}: VoiceChannelUIProps) => {
  const [token, setToken] = useState("");
 

  // 1. Fetch Token from our API
 // VoiceChannelUI.tsx

 const [isDeafened, setIsDeafened] = useState(false);

 


useEffect(() => {
  // ✅ Sabse important check: Agar token pehle se hai, toh naya fetch MAT karo
  if (token || !channelId || !currentUser?.name) return;

  const fetchToken = async () => {
    try {
      console.log("🎟️ Fetching Token for room:", channelId); // Debugging
      const resp = await fetch(`/api/livekit?room=${channelId}&username=${currentUser.name}`);
      const data = await resp.json();
      if (data.token) {
        setToken(data.token);
      }
    } catch (e) {
      console.error("❌ Token error:", e);
    }
  };

  fetchToken();
}, [channelId, currentUser?.name, token]); // ✅ 'token' ko add karein taake if check trigger ho



  if (token === "") {
    return (
      <div className="flex-1 bg-[#313338] flex flex-col items-center justify-center text-white">
        <div className="w-12 h-12 border-4 border-[#5865f2] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-[#b5bac1] font-medium">Connecting to VC.</p>
      </div>
    );
  }

  return (
    <LiveKitRoom
  video={false}
  audio={true}
  token={token}
  serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
  connect={true} // 👈 Ye add karein
  onDisconnected={onLeave}
  className="flex-1 flex flex-col bg-[#313338]"
>
  <RoomAudioRenderer />
  <VoiceStage channelName={channelName} 
    onLeave={onLeave} 
    isExternalMuted={isExternalMuted}
    isDeafened={isDeafened}
    onClose={onClose}
    setIsDeafened={setIsDeafened}
    onMuteChange={onMuteChange}
     />
</LiveKitRoom>
  );
};



// --- Alag Component for Realtime Data ---
const VoiceStage = ({ 
  channelName, 
  onLeave, 
  isExternalMuted,
  isDeafened,
  setIsDeafened,
  onMuteChange,
  onClose
}: any) => {
  const participants = useParticipants(); 
  const { localParticipant, isMicrophoneEnabled } = useLocalParticipant();

  // 1. Deafen Logic: Doosron ki awaaz band karna
useEffect(() => {
  // 1. Remote participants ki awaaz control karein (Metadata level)
  participants.forEach((p) => {
    p.trackPublications.forEach((publication) => {
      // Remote tracks ko mute/unmute karne ka sahi tareeka
      if (publication.kind === "audio" && publication.track) {
        // @ts-ignore - Kuch versions mein setMuted direct accessible nahi hota
        if (typeof publication.track.setMuted === 'function') {
          (publication.track as any).setMuted(isDeafened);
        }
      }
    });
  });

  // 2. Browser Level Control (Sabse Reliable tareeka)
  // Ye poore room ki awaaz ko browser level par mute kar dega
  const audioElements = document.querySelectorAll('audio');
  audioElements.forEach((audio) => {
    audio.muted = isDeafened;
  });

}, [isDeafened, participants]);

  // 2. Sidebar Mute Sync: Jab sidebar se mute karein toh asali mic band ho
useEffect(() => {
  const syncMic = async () => {
    if (localParticipant) {
      // ✅ Check karein ke kya waqai state badalni hai? 
      // isMicrophoneEnabled asali state hai, !isExternalMuted sidebar ki state hai
      if (localParticipant.isMicrophoneEnabled === isExternalMuted) {
         try {
           await localParticipant.setMicrophoneEnabled(!isExternalMuted);
           console.log("🎤 Mic Status Updated via Sidebar:", !isExternalMuted);
         } catch (err) {
           console.error("❌ Mic Sync Error:", err);
         }
      }
    }
  };

  syncMic();
}, [isExternalMuted, localParticipant]);



const handleToggleMic = async () => {
  try {
    const newState = !isMicrophoneEnabled;
    await localParticipant.setMicrophoneEnabled(newState);
    
    // ✅ Dashboard ki state ko bhi update karein (Prop callback ke zariye)
    if (onMuteChange) {
      onMuteChange(!newState); // isMicMuted (true) means mic is OFF
    }
  } catch (err) {
    console.error("Mic toggle failed:", err);
  }
};

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden select-none">
      {/* --- Header --- */}
      <div className="h-12 border-b border-black/20 flex items-center px-4 justify-between bg-[#313338] z-10">
        <div className="flex items-center gap-2 text-[#23a559]">
          <Volume2 size={20} />
          <h1 className="font-bold text-white text-[15px]">{channelName}</h1>
        </div>
        
        <div className="p-4 flex justify-between items-center">
          <button 
onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition"
          >
            <ChevronDown size={24} className="text-white" />
          </button>
          </div>
        <div className="flex items-center gap-4 text-[#b5bac1]">
           <Settings size={20} className="hover:text-white cursor-pointer transition" />
        </div>
      </div>

      {/* --- Dynamic Grid (Realtime Participants) --- */}
      <div className="flex-1 overflow-y-auto p-5 chat-gradient custom-scrollbar">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
         {participants.map((p) => (
  <div key={p.sid}
    className={`relative bg-[#000] border-white p-3 rounded-xl aspect-video flex flex-col items-center justify-center border-2 transition-all 
      ${p.isSpeaking ? 'border-[#23a559] shadow-[0_0_15px_rgba(35,165,89,0.2)]' : 'border-transparent'}`}
  >
    {/* Participant Identity / Avatar */}
    <div className="flex flex-col items-center gap-3">
      <div className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-xl
        ${p.isSpeaking ? 'ring-4 ring-[#23a559] scale-110' : 'bg-[#313338]'}`}>
        
      </div>
      
      <div className="flex items-center gap-2 px-3 py-1 bg-black/40 rounded-lg">
        <span className="text-[13px] font-medium text-white">{p.identity}</span>
        {!p.isMicrophoneEnabled && <MicOff size={14} className="text-[#f23f42]" />}
      </div>
    </div>
  </div>
))}
        </div>
      </div>

      {/* --- Improved Voice Controls --- */}
      <div className="h-24 bg-[#1e1f22] flex items-center justify-center gap-5 border-t border-black/20">
        <button 
          onClick={handleToggleMic}
          className={`p-4 rounded-2xl transition-all ${!isMicrophoneEnabled ? 'bg-[#da373c] text-white' : 'bg-[#313338] text-[#dbdee1] hover:bg-[#4e5058]'}`}
        >
          {!isMicrophoneEnabled ? <MicOff size={24} /> : <Mic size={24} />}
        </button>

        <button 
          onClick={() => setIsDeafened(!isDeafened)}
          className={`p-4 rounded-2xl transition-all ${isDeafened ? 'bg-[#da373c] text-white' : 'bg-[#313338] text-[#dbdee1] hover:bg-[#4e5058]'}`}
        >
          <Headphones size={24} />
        </button>

        <button 
          onClick={onLeave}
          className="p-4 rounded-2xl bg-[#da373c] text-white hover:bg-[#a1282b] flex items-center gap-3 px-8 transition-all group"
        >
          <PhoneOff size={24} className="group-hover:animate-bounce" />
          <span className="font-bold uppercase text-xs tracking-widest">Leave</span>
        </button>
      </div>
    </div>
  );
};