"use client";
import { useAuth } from "@/hooks/useAuth";
import Sidebar from "@/components/Sidebar";
import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { UserControl } from "@/components/UserControl";
import FriendsManager from "@/components/FriendManager";
import { createBrowserClient } from "@supabase/ssr"; // 👈 createClient ki jagah SSR client
import ServerSidebar from "@/components/server/ServerSidebar";
import { VoiceChannelUI } from "@/components/VoiceChannelUI";
import useSWR from 'swr';
import { PlusMenu } from "@/components/PlusMenu";
import { motion } from "framer-motion"
import { EmojiModal } from "@/components/EmojiModal";
import { SpaceBackground } from "@/components/SpaceBackground";
import { db } from "@/lib/db";
import { GuestProfilePopover } from "@/components/GuestProfilePopover";
import { 
  LiveKitRoom, 
  RoomAudioRenderer,
} from "@livekit/components-react";
import { HoverAvatar } from "@/components/HoverAvatar";
import { GifModal } from "@/components/GifModal";
import { PinnedMessages } from "@/components/PinnedMessages";
import { SearchBar } from "@/components/SearchBar";
import { InboxPopover } from "@/components/InboxPopover";
import { StickerModal } from "@/components/StickerModal";
import { MessageContextMenu } from "@/components/MessageContextMenu";
import { IncomingCallOverlay } from "@/components/IncomingCallOverlay";
import { toast, Toaster } from "react-hot-toast";
import { ServerInviteCard } from "@/components/ServerInviteCard";
import { Header } from "@/components/navigation/Header";
import { VoiceCallOverlay } from "@/components/VoiceCallOverlay"
import { Hash, Plus, User, Mic, X, Menu, Phone, Video, Pin, Users,Sparkles, FileText, BellOff,Send, MicOff, Reply, Pencil, Trash2, Inbox, HelpCircle, Volume2, Gift,PhoneOff, Sticker, Smile, PlusCircle, Search } from "lucide-react";
import { SpaceNameplateOverlay } from "@/components/SpaceNameplate";

// --- 1. VOICE PLAYER COMPONENT (Dashboard se bahar rakhein taake state har message ki alag ho) ---
const VoicePlayer = ({ url }: { url: string }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState("0:00");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const formatTime = (time: number) => {
    if (!time || isNaN(time) || !isFinite(time)) return "0:00";
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  useEffect(() => {
    const audio = new Audio(url);
    audioRef.current = audio;

    // ✅ Naya Logic: Doosra play hone par ye wala stop ho jaye
    const handleGlobalPlay = (e: any) => {
      if (e.detail.url !== url) { // Agar play hone wala URL mera wala nahi hai
        audio.pause();
        setIsPlaying(false);
      }
    };

    window.addEventListener('stop-all-audio', handleGlobalPlay);

    const handleLoadedMetadata = () => {
      if (isFinite(audio.duration)) setDuration(formatTime(audio.duration));
    };

    const updateProgress = () => {
      if (isFinite(audio.duration)) setProgress((audio.currentTime / audio.duration) * 100 || 0);
    };

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", updateProgress);
    audio.addEventListener("ended", () => { setIsPlaying(false); setProgress(0); });

    return () => {
      audio.pause();
      window.removeEventListener('stop-all-audio', handleGlobalPlay);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("timeupdate", updateProgress);
    };
  }, [url]);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      // ✅ Play karne se pehle sab ko stop karne ka signal bhejien
      const event = new CustomEvent('stop-all-audio', { detail: { url: url } });
      window.dispatchEvent(event);

      // Thora sa delay taake purana stop ho jaye aur naya crash na kare
      setTimeout(() => {
        audioRef.current?.play().catch(err => console.log("Audio Play Error:", err));
        setIsPlaying(true);
      }, 10);
    }
  };

  return (
    <div className="flex items-center gap-3 bg-[#2b2d31] hover:bg-[#35373c] transition-all py-2 px-3.5 mt-1 rounded-[24px] rounded-tl-none min-w-[260px] shadow-lg group border border-white/5">
      <button 
        onClick={togglePlay}
        className="w-8 h-8 bg-white rounded-full flex-shrink-0 flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-md"
      >
        {isPlaying ? (
          <div className="flex gap-1">
            <div className="w-1 h-3 bg-[#2b2d31]" />
            <div className="w-1 h-3 bg-[#2b2d31]" />
          </div>
        ) : (
          <div className="w-0 h-0 border-t-[5px] border-t-transparent border-l-[9px] border-l-[#2b2d31] border-b-[5px] border-b-transparent ml-1" />
        )}
      </button>
      
      <div className="relative flex-1 h-[4px] bg-white/20 rounded-full overflow-hidden">
        <div className="absolute top-0 left-0 h-full bg-white transition-all duration-100" style={{ width: `${progress}%` }} />
      </div>

      <div className="flex items-center gap-2 text-[#dbdee1]/60 pr-1">
        <span className="text-[11px] font-medium font-mono min-w-[35px] text-right">
          {isPlaying ? formatTime(audioRef.current?.currentTime || 0) : duration}
        </span>
        <Phone size={14} className="opacity-40" />
      </div>
    </div>
  );
};

interface DashboardProps {
  currentUser: {
    id: string;
    email: string;
    name: string | null;
    image: string | null;
    banner: string | null;
    status: string;
    statusPreference: string;
    // user_metadata ko optional rakhein taake purana code na phate
    user_metadata?: any; 
    profiles?: {
      avatar?: string | null;
      display_name?: string | null;
      bio?: string | null;
      banner?: string | null;
      theme?: string | null;
    } | null;
  };
  
}

interface UserProfile {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  status?: string;           // Database wala status (Online/Offline)
  statusPreference?: string; // ✅ Jo UserControl se update hota hai (DND, Idle, etc.)
  banner?: string;
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
    [key: string]: any; // Kisi bhi aur metadata ke liye
  };
}
 
interface ChatProps {
  receiverId?: string; // DM ke liye
  channelId?: string; 
   // Server channel ke liye
}

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!, 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

let globalStatusLock = ""; 
let isRequestPending = false;
export default function Dashboard({ currentUser }: DashboardProps){
 
  
const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState("");
  const [activeTab, setActiveTab] = useState("home"); 
  
  const [selectedFriend, setSelectedFriend] = useState<any>(null);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [friends, setFriends] = useState<any[]>([]);
  const [selectedServer, setSelectedServer] = useState<any>(null);
  const [activeChannelId, setActiveChannelId] = useState<string | null>(null);
  const params = useParams();
  const vcChannelRef = useRef<any>(null);
  
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
const activeTheme = useMemo(() => {
  return currentUser?.profiles?.theme || 'dark';
}, [currentUser?.profiles?.theme]);

  // 🟢 Fixed Auth Logic
const { user: authUser, loading: authLoading } = useAuth();
const authenticatedUser = authUser as UserProfile | null; // ✅ 'currentUser' ki jagah 'authenticatedUser'
const authStatus = authLoading ? "loading" : authenticatedUser ? "authenticated" : "unauthenticated";
  const [popoverCoords, setPopoverCoords] = useState<{ x: number, y: number } | null>(null);
const [selectedUser, setSelectedUser] = useState<any>(null);

const handleAvatarClick = (e: React.MouseEvent, user: any) => {
  e.stopPropagation();
  
  const { clientX, clientY } = e;
  const screenHeight = window.innerHeight;
  const screenWidth = window.innerWidth;
  const popoverHeight = 450; 
  const popoverWidth = 340; 

  // ↕️ Vertical Logic (Flip up if at bottom)
  let yPosition = clientY;
  if (clientY + popoverHeight > screenHeight) {
    yPosition = screenHeight - popoverHeight - 20; 
  }

  // ↔️ Horizontal Logic (Flip left if at right edge)
  let xPosition = clientX + 15;
  if (clientX + popoverWidth > screenWidth) {
    xPosition = clientX - popoverWidth - 15;
  }

  setPopoverCoords({ x: xPosition, y: yPosition });
  setSelectedUserForPopover(user); // 👈 Check state name here
};

  const [activeCallData, setActiveCallData] = useState<{
    friendId: string,
    name: string,
    image: string,
    roomId: string
  } | null>(null);

  const [isCallMinimized, setIsCallMinimized] = useState(false);


const channelRef = useRef<any>(null);
const presenceChannelRef = useRef<any>(null);

const [isVoiceActive, setIsVoiceActive] = useState(false);
const [activeVoiceChannelName, setActiveVoiceChannelName] = useState("");
const [showFullVoiceUI, setShowFullVoiceUI] = useState(false);
const [isMicMuted, setIsMicMuted] = useState(false);
const [showPlusMenu, setShowPlusMenu] = useState(false);
const [showEmojiModal, setShowEmojiModal] = useState(false);
const [showGifModal, setShowGifModal] = useState(false);
const [showStickerModal, setShowStickerModal] = useState(false);
const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
const [isMessagesLoading, setIsMessagesLoading] = useState(false);
const [showMemberSidebar, setShowMemberSidebar] = useState(true);
const [contextMenu, setContextMenu] = useState<{ x: number, y: number, msg: any } | null>(null);
const [replyingTo, setReplyingTo] = useState<any>(null);
const [editingMessage, setEditingMessage] = useState<string | null>(null);
const [editContent, setEditContent] = useState("");
const [isSidebarOpen, setIsSidebarOpen] = useState(false);
const [isSearchVisible, setIsSearchVisible] = useState(false);

// Real-time states
const [presenceState, setPresenceState] = useState<Record<string, any>>({});
const [localUser, setLocalUser] = useState<UserProfile | null>(null);
const [activeChannel, setActiveChannel] = useState<any>(null);
// Dashboard.tsx mein render loop ke andar
const inviteRegex = /(?:https?:\/\/)?(?:localhost:3000|yourdomain\.com)\/invite\/([a-zA-Z0-9-]+)/;

// 🟢 Correct way to derive name/image (Inside useMemo or just plain variable after auth check)
// 1. Display Name Logic
const displayImage = currentUser.profiles?.avatar || currentUser.image || "/default-avatar.png";
const displayName = currentUser.profiles?.display_name || currentUser.name || "User";


// Dashboard.tsx ke top par states ke paas:
const [callStatus, setCallStatus] = useState<"dialing" | "connected" | "rejected">("dialing");
const [incomingCall, setIncomingCall] = useState<any>(null); // incomingCall error fix

const fetcher = (url: string) => fetch(url).then((res) => res.json());


const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
const [jumpMessageId, setJumpMessageId] = useState<string | null>(null);
const jumpRef = useRef<string | null>(null);


// Server Component mein


// Dashboard.tsx ke andar
const handleInboxNavigation = (n: any) => {
  if (n.channelId) {
    let sId = n.serverId;

    // 1. JSON string fix (jo pehle discuss kiya tha)
    if (sId && typeof sId === 'string' && sId.startsWith('{')) {
      try {
        const parsed = JSON.parse(sId);
        sId = parsed.id;
      } catch (e) {
        console.error("Parse error:", e);
      }
    }
   

    // 2. 🚀 UI RESET (Ye sab se zaroori hai)
    setSelectedFriend(null); // 👈 DM mode band karne ke liye
    setSelectedServer(null); // Purana server data clear karein (fetchServer naya layega)

    // 3. States Update
    setActiveTab(`server-${sId}`);
    setActiveChannelId(n.channelId);
    
    // 4. Data Fetching
    if (sId) fetchServer(sId);
    fetchMessages(undefined, n.channelId);

    console.log("✅ Switched to Server Mode");
  } else {
    // DM Logic
    const friend = friends.find(f => f.id === n.senderId);
    if (friend) {
      handleFriendSelect(friend);
    }
    setActiveTab("home");
  }
  if (n.id) {
  (window as any).isJumpingToMessage = true;
  jumpRef.current = n.id;
}


};

useEffect(() => {
  if (!jumpRef.current) return;
  if (!messages.length) return;

  let attempts = 0;

  const tryScroll = () => {
    const el = document.getElementById(`msg-${jumpRef.current}`);
    if (!el) {
      attempts++;
      if (attempts < 10) {
        requestAnimationFrame(tryScroll);
      }
      return;
    }

    el.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });

    el.classList.add("highlight");

    setTimeout(() => {
      el.classList.remove("highlight");
    }, 1500);

    jumpRef.current = null;
    (window as any).isJumpingToMessage = false;
  };

  requestAnimationFrame(tryScroll);

}, [messages]);




const jumpToNotification = (messageId: string) => {
  const el = document.getElementById(`msg-${messageId}`);
  if (!el) return;

  el.scrollIntoView({ behavior: "smooth", block: "center" });

  el.classList.add("highlight");
  setTimeout(() => el.classList.remove("highlight"), 30000);
};

const onUserScroll = () => {
  jumpRef.current = null;
  (window as any).isJumpingToMessage = false;
};


// scrollToMessage mein bhi same logic add karein
const scrollToMessage = (id: string) => {
  const el = document.getElementById(`msg-${id}`);
  if (!el) return;

  el.scrollIntoView({
    behavior: "smooth",
    block: "center",
  });
};




const liveFriends = useMemo(() => {
  return friends.map((f) => {
    const count = unreadCounts[f.id] || 0;
    
    // Supabase Presence state se user ka status nikalein
    const userPresence = presenceState[f.id];
    
    // Agar presence mein user mil jaye toh uska status, warna default database status ya OFFLINE
    const liveStatus = userPresence 
      ? (userPresence[0]?.status || "ONLINE") 
      : (f.statusPreference || "OFFLINE");
    
    return { ...f, liveStatus, count };
  });
}, [friends, presenceState, unreadCounts]); // 👈 PresenceState update hote hi ye chale ga

// Dashboard.tsx ke andar
const [selectedUserForPopover, setSelectedUserForPopover] = useState<any>(null);
const [popoverPosition, setPopoverPosition] = useState({ x: 0, y: 0 });


// In functions ko handles mein add karein
const deleteMessage = async (id: string) => {
  await supabase.from('Message').delete().eq('id', id);
  setMessages(prev => prev.filter(m => m.id !== id));
  setContextMenu(null);
};

const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text);
  setContextMenu(null);
};

const handleContextMenu = (e: React.MouseEvent, msg: any) => {
  e.preventDefault();
  setContextMenu({ x: e.pageX, y: e.pageY, msg });
};

const updateMessage = async (id: string, newContent: string) => {


  if (!newContent.trim()) return;

  try {
    // 1. Local State Update (Optimistic)
    setMessages(prev => prev.map(m => 
      m.id === id ? { ...m, content: newContent, updatedAt: new Date().toISOString() } : m
    ));
    setEditingMessage(null);

    // 2. Database Update
    const { error } = await supabase
      .from('Message')
      .update({ content: newContent, updatedAt: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
  } catch (err) {
    console.error("Update failed:", err);
  }
};



// 2. Render Component (Return ke end mein)

const { data: error, mutate } = useSWR('/api/friends/list', fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 10000, 
  });

  // Agar error ho ya loading ho toh handle karein
  const isLoading = !friends && !error;


const mockVoiceUsers = [
  { 
    id: "1", 
    name: currentUser?.name || "Me", 
    isSpeaking: false, 
    isMuted: false, 
    image: currentUser?.image 
  },
  { 
    id: "2", 
    name: "Moiz", 
    isSpeaking: true, 
    isMuted: false 
  },
  { 
    id: "3", 
    name: "DSD", 
    isSpeaking: false, 
    isMuted: true 
  },
];

// States (page.tsx)

const fetchPending = useCallback(async () => {
  const res = await fetch("/api/friends/pending");
  if (res.ok) {
    const data = await res.json();
    setPendingRequests(data);
  }
}, []);

useEffect(() => {
  if (authStatus === "authenticated") { // ✅ Upar wala naam use karein
    fetchFriends();
    fetchPending();
  }
}, [authStatus]);



  
  // --- 1. FETCH FUNCTIONS ---
 const fetchFriends = useCallback(async () => {
  const res = await fetch("/api/friends/list");
  if (res.ok) {
    const data = await res.json();
    setFriends(data);

    // 🟢 RELOAD FIX: Database se aaye huye counts ko React state mein bharo
    const initialCounts: Record<string, number> = {};
    
    data.forEach((f: any) => {
      // API se aane wale 'unreadCount' ko state mein map karein
      if (f.unreadCount > 0) {
        initialCounts[f.id] = f.unreadCount;
      }
    });

    setUnreadCounts(initialCounts); // 👈 Is se reload ke baad counts wapis nazar aayenge
  }
}, []);

  const handleChannelSelect = (id: string) => {
  if (id === activeChannelId) return;

  setIsMessagesLoading(true);
  setSelectedFriend(null);
  setActiveChannelId(id);

  // ✅ Force correct channel fetch
  fetchMessages(undefined, id);
};



// DM switch ke liye bhi same:
const handleFriendSelect = async (friend: any) => {
  if (friend.id === selectedFriend?.id) return;
  
  setIsMessagesLoading(true); 
  setSelectedFriend(friend);
  setActiveChannelId(null);
  fetchMessages(friend.id);

  // 🟢 DATABASE COUNT RESET LOGIC
  try {
    // Check karein ke aap sender thay ya receiver is friendship mein
    const columnToReset = friend.iAmSender ? 'senderUnread' : 'receiverUnread';

    await supabase
      .from('Friendship')
      .update({ [columnToReset]: 0 }) // Jis user ne chat kholi uska count 0
      .eq('id', friend.friendshipId);

    // Local state reset
    setUnreadCounts(prev => ({
      ...prev,
      [friend.id]: 0
    }));
    
    console.log("✅ Unread count reset for:", friend.name);
  } catch (error) {
    console.error("Failed to reset count:", error);
  }
};


  // 1. Consolidated fetch function
const fetchMessages = useCallback(async (forcedFriendId?: string,  forcedChannelId?: string) => {
  try {
    let url = "";

    if (forcedFriendId) {
      url = `/api/messages?receiverId=${forcedFriendId}`;
    } 
    else if (forcedChannelId) {
      url = `/api/messages?channelId=${forcedChannelId}`;
    }
    else if (selectedFriend) {
      url = `/api/messages?receiverId=${selectedFriend.id}`;
    } 
    else if (activeChannelId) {
      url = `/api/messages?channelId=${activeChannelId}`;
    } 
    else {
      url = `/api/messages?isServer=true`;
    }

    const res = await fetch(url);
    const data = await res.json();
    setMessages(data);
  } catch (e) {
    console.error(e);
  } finally {
    setIsMessagesLoading(false); // ✅ Band karein loading
  }
}, [selectedFriend, activeChannelId]);

// selectedFriend null ho sakta hai, isliye ?. use karein
const currentStatus = selectedFriend 
  ? (presenceState[selectedFriend.id]?.[0]?.status || selectedFriend.status || 'OFFLINE')
  : 'OFFLINE';

// page.tsx (Line 112 ke paas)
const fetchServer = async (serverId: string) => {
  try {
    // console.log("Fetching this exact ID:", serverId); 
    
    // Yahan ensure karein ke backticks (``) use ho rahe hain aur ID poori hai
    const response = await fetch(`/api/servers/details?id=${serverId}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Server Error:", errorText);
      return;
    }

    const data = await response.json();
    setSelectedServer(data);
  } catch (error) {
    console.error("Fetch failed:", error);
  }
};
const [servers, setServers] = useState<any[]>([]); // ✅ Ye missing thi

const fetchServers = async () => {
  try {
    const res = await fetch("/api/servers/list"); // ✅ Check karein aapka list API route yahi hai?
    if (res.ok) {
      const data = await res.json();
      setServers(data); // ✅ Ye aapki servers list ki state update karega
    }
  } catch (error) {
    console.error("Failed to fetch servers list:", error);
  }
};

const getRoomId = () => {
  if (activeChannelId) return activeChannelId; // Server channel ke liye
  if (selectedFriend?.id && currentUser?.id) {
    // ✅ Dono IDs ko sort karke join karein (Unique for both users)
    return [currentUser.id, selectedFriend.id].sort().join("--");
  }
  return null;
};

 // Ye naya ref add karein



// 1. Ek Ref banayein jo track kare ke user ne MANUALLY status change kiya hai

// Dashboard.tsx ke andar
useEffect(() => {
  if (!currentUser?.id) return;

  const globalChannel = supabase.channel("global-notifications");

  globalChannel
  .on("broadcast", { event: "friend_request" }, ({ payload }) => {
    if (payload.receiverId !== currentUser.id) return;

    console.log("🔔 REALTIME FRIEND REQUEST RECEIVED");

    // ✅ Immediately insert into pending list
    setPendingRequests(prev => [
      {
        id: crypto.randomUUID(),
        senderName: payload.senderName,
        senderId: payload.senderId,
        status: "PENDING"
      },
      ...prev
    ]);

    // Optional: also refresh full friend list silently
    fetchFriends();
  })
  .subscribe();


  return () => {
    supabase.removeChannel(globalChannel);
  };
}, [currentUser?.id]);


// 2. Click outside handler (taake popups band hon)
useEffect(() => {
  const closeAllPopups = () => {
    setShowPlusMenu(false);
    setShowEmojiModal(false);
    setShowGifModal(false);
    setShowStickerModal(false);
  };
  
  if (showPlusMenu || showEmojiModal || showGifModal || showStickerModal) {
    window.addEventListener('click', closeAllPopups);
  }
  return () => window.removeEventListener('click', closeAllPopups);
}, [showPlusMenu, showEmojiModal, showGifModal, showStickerModal]);




// 1. Presence Sync & Tracking (Combined)
useEffect(() => {
  if (!currentUser?.id) return;

  const presenceChannel = supabase.channel('online-users', {
    config: { presence: { key: currentUser.id } },
  });

  presenceChannelRef.current = presenceChannel;

  presenceChannel
    .on('presence', { event: 'sync' }, () => {
      const newState = presenceChannel.presenceState();
      // ✅ Pure object ko update karein taake React ko change mile
      setPresenceState({ ...newState }); 
    })
    .on('presence', { event: 'join' }, ({ key, newPresences }) => {
      setPresenceState((prev) => ({ ...prev, [key]: newPresences }));
    })
    .on('presence', { event: 'leave' }, ({ key }) => {
      setPresenceState((prev) => {
        const newState = { ...prev };
        delete newState[key];
        return newState;
      });
    })
    .subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        // 🟢 Yahan se tracking shuru hoti hai
        await presenceChannel.track({
          id: currentUser.id,
          name: currentUser.name,
          // ✅ Agar local status preference hai toh wo, warna default ONLINE
          status: localUser?.statusPreference || currentUser.statusPreference || 'ONLINE',
          online_at: new Date().toISOString(),
        });
      }
    });

  return () => {
    supabase.removeChannel(presenceChannel);
  };
}, [currentUser?.id, localUser?.statusPreference]); // 👈 Dono pe depend karna zaroori hai

useEffect(() => {
  if (!presenceChannelRef.current || !localUser?.id) return;

  presenceChannelRef.current.track({
    id: localUser.id,
    name: localUser.name,
    status: localUser.statusPreference || 'ONLINE',
    online_at: new Date().toISOString(),
  });
}, [localUser?.statusPreference]);


useEffect(() => {
  if (currentUser) {
    setLocalUser(currentUser as UserProfile);
  }
}, [currentUser]);

const handleStatusUpdate = (newStatus: string) => {
  // 1) Update local user object
  setLocalUser((prev) => {
    if (!prev) return prev;
    return { ...prev, statusPreference: newStatus };
  });

  // 2) 🔥 Immediately update presenceState for yourself
  setPresenceState((prev) => ({
    ...prev,
    [currentUser!.id]: [
      {
        ...(prev[currentUser!.id]?.[0] || {}),
        id: currentUser!.id,
        name: currentUser!.name,
        status: newStatus,
        online_at: new Date().toISOString(),
      },
    ],
  }));
};

const roomId = getRoomId();




useEffect(() => {


  
  if (!roomId || !currentUser?.id) return;

  const chatChannel = supabase.channel(`room-${roomId}`, {
    config: { broadcast: { self: false } }
  });

  setActiveChannel(chatChannel);


  chatChannel.on('broadcast', { event: 'new_message' }, ({ payload }) => {
    setMessages(prev => {
      if (prev.some(m => m.id === payload.id)) return prev;
      return [...prev, payload];
    });
    
    setFriends(prevFriends => {
    const friendIndex = prevFriends.findIndex(f => f.id === payload.userId || f.id === payload.receiverId);
    if (friendIndex > -1) {
      const updatedFriends = [...prevFriends];
      const friendToMove = updatedFriends.splice(friendIndex, 1)[0];
      return [friendToMove, ...updatedFriends]; // Top par le aaye
    }
    return prevFriends;
  });
  

  // 3. 🔔 NOTIFICATION SOUND & UI
  // Sirf tab notification dikhao jab user kisi aur ki chat mein ho
  if (selectedFriend?.id !== payload.userId && payload.userId !== currentUser?.id) {
    // Sound play karein
    const notificationSound = new Audio("/sounds/msg.mp3");
    notificationSound.play().catch(e => console.log("Sound blocked"));

    // Yahan aap koi Toast library (jaise react-hot-toast) ya apna chota sa popup dikha sakte hain
    console.log(`New message from ${payload.user.name}: ${payload.content}`);
  }

  });

 

  chatChannel.subscribe();
  channelRef.current = chatChannel;

 return () => { supabase.removeChannel(chatChannel); };
}, [roomId,]);  // 🔥 only roomId

// Dashboard.tsx mein kahin bhi states ke neeche:

useEffect(() => {
  if (!currentUser?.id) return;

  // ✅ Global line for ALL incoming messages
  const globalMessageLine = supabase.channel(`user-messages-${currentUser.id}`, {
    config: { broadcast: { self: true } } 
    // self true taake aapka apna bheja hua msg bhi sort kare
  });

  globalMessageLine
    .on('broadcast', { event: 'new_message_signal' }, ({ payload }) => {
      console.log("📨 Global signal received for sorting:", payload);

      if (selectedFriend?.id !== payload.userId && payload.userId !== currentUser?.id) {
    
    setUnreadCounts(prev => {
      const currentVal = prev[payload.userId] || 0;
      return {
        ...prev,
        [payload.userId]: currentVal + 1 // 👈 Increment logic
      };
    });

    // Sound play karein
    new Audio("/sounds/msg.mp3").play().catch(() => {});
  }
      
      // 🟢 1. FRIENDS LIST SORTING (Hamesha kaam karega)
      setFriends(prev => {
        const friendId = payload.userId === currentUser.id ? payload.receiverId : payload.userId;
        const friendIndex = prev.findIndex(f => f.id === friendId);
        
        if (friendIndex === -1) return prev;

        const updatedList = [...prev];
        const [movedFriend] = updatedList.splice(friendIndex, 1);
        
        // Preview update
        movedFriend.lastMessage = payload.content;
        
        return [movedFriend, ...updatedList];
      });

      // 🔵 2. NOTIFICATION SOUND (Sirf tab jab chat open na ho)
      if (selectedFriend?.id !== payload.userId && payload.userId !== currentUser.id) {
        new Audio("/sounds/msg.mp3").play().catch(() => {});
      }
    })
    .subscribe();

  return () => { supabase.removeChannel(globalMessageLine); };
}, [currentUser?.id, selectedFriend?.id]); // selectedFriend zaroori hai notification logic ke liye

useEffect(() => {
  if (selectedFriend?.id) {
    setUnreadCounts(prev => ({
      ...prev,
      [selectedFriend.id]: 0
    }));
  }
}, [selectedFriend?.id]);

const startCall = async () => { // 👈 async banayein
  if (!selectedFriend || !currentUser) return;

  const rId = getRoomId() || `call-${crypto.randomUUID()}`;
  
  setCallStatus("dialing"); 
  setActiveCallData({ 
    friendId: selectedFriend.id, 
    name: selectedFriend.name, 
    image: selectedFriend.image, 
    roomId: rId 
  });
  setIsVoiceActive(true);

  // ✅ Step: Friend ki signal line join karke bhejien
  const targetChannel = supabase.channel(`user-signals-${selectedFriend.id}`);
  
  targetChannel.subscribe(async (status) => {
    if (status === 'SUBSCRIBED') {
      await targetChannel.send({
        type: 'broadcast',
        event: 'incoming_call',
        payload: {
          callerId: currentUser.id,
          callerName: currentUser.name,
          callerImage: currentUser.image,
          roomId: rId,
        },
      });
      console.log("✅ Call signal sent!");
      supabase.removeChannel(targetChannel); // Kaam khatam, line free karein
    }
  });
};

const handleAcceptCall = async () => { // 👈 async banayein
  if (!incomingCall || !currentUser) return;

  const callerId = incomingCall.callerId;
  const roomId = incomingCall.roomId;

  // Local UI update
  setCallStatus("connected"); 
  setActiveCallData({
    friendId: incomingCall.callerId,
    name: incomingCall.callerName,
    image: incomingCall.callerImage,
    roomId: roomId
  });
  setIsVoiceActive(true);
  setIncomingCall(null);

  // ✅ Step: Caller ko signal bhejein ke accept ho gayi hai
  const callerChannel = supabase.channel(`user-signals-${callerId}`);
  
  callerChannel.subscribe(async (status) => {
    if (status === 'SUBSCRIBED') {
      await callerChannel.send({
        type: 'broadcast',
        event: 'call_accepted',
        payload: { roomId }
      });
      console.log("✅ Accept signal delivered!");
      supabase.removeChannel(callerChannel);
    }
  });
};

const handleEndCall = async () => {
  if (!activeCallData) return;

  const targetId = activeCallData.friendId;

  // 1. Send Signal to other person
  const endChannel = supabase.channel(`user-signals-${targetId}`);
  endChannel.subscribe(async (status) => {
    if (status === 'SUBSCRIBED') {
      await endChannel.send({
        type: 'broadcast',
        event: 'call_ended',
        payload: { roomId: activeCallData.roomId }
      });
      supabase.removeChannel(endChannel);
    }
  });

  // 2. Reset Local State
  setIsVoiceActive(false);
  setActiveCallData(null);
  setCallStatus("dialing");
  
  // 3. Clear any hanging tokens or connections
  console.log("✅ Call ended and cleaned up");
};

const handleRejectCall = () => {
  if (!incomingCall) return;

  const callerId = incomingCall.callerId;

  const rejectChannel = supabase.channel(`user-signals-${callerId}`);
  rejectChannel.subscribe(async (status) => {
    if (status === 'SUBSCRIBED') {
      await rejectChannel.send({
        type: 'broadcast',
        event: 'call_rejected',
        payload: { roomId: incomingCall.roomId }
      });
      supabase.removeChannel(rejectChannel);
    }
  });

  setIncomingCall(null);
  setIsVoiceActive(false);
};

useEffect(() => {
  if (!currentUser?.id) return;

  const channelName = `user-signals-${currentUser.id}`;
  console.log("📡 Subscribing to personal line:", channelName);

  const mySignalLine = supabase.channel(`user-signals-${currentUser.id}`, {
    config: { broadcast: { ack: true } }
  });

  mySignalLine
    .on('broadcast', { event: 'incoming_call' }, ({ payload }) => {
      console.log("🔔 POPUP TRIGGERED!", payload); // 👈 Yeh receiver side pe ana chahiye
      setIncomingCall(payload);
    })
    
    .on('broadcast', { event: 'call_accepted' }, () => {
      console.log("✅ Other side ACCEPTED");
      setCallStatus("connected");
    })
    .on('broadcast', { event: 'call_rejected' }, () => {
      console.log("❌ Other side REJECTED");
      setCallStatus("rejected");
    })
    .on('broadcast', { event: 'call_ended' }, () => {
      console.log("👋 Other side ENDED");
      setIsVoiceActive(false);
      setActiveCallData(null);
    })
   .subscribe((status) => {
      console.log("Receiver Signal Line Status:", status); // 👈 Check karein ye 'SUBSCRIBED' ho raha hai?
    });
    

  return () => {
  if (!isVoiceActive) { // Sirf tab remove karein jab call na ho rahi ho
    console.log("Cleanup: Removing signal line");
    supabase.removeChannel(mySignalLine);
  }
};
}, [currentUser?.id]);




const [voiceUsers, setVoiceUsers] = useState<any[]>([]); // ✅ Pehle ye define karein
const [selectedVoiceChannel, setSelectedVoiceChannel] = useState<{id: string, name: string} | null>(null);
const [isInVC, setIsInVC] = useState(false);

const handleJoinVC = (vcId: string, vcName: string) => {
  console.log("🎙️ JOINING VC CLICKED!", { vcId, vcName });

  if (!currentUser?.id) return;

  // ✅ Purani states ko update karein jo UI mein use ho rahi hain
  setIsVoiceActive(true); 
  setActiveVoiceChannelName(vcName); 
  setShowFullVoiceUI(true);
  // Agar aapne niche 'selectedVoiceChannel' bhi use kiya hai toh usay bhi rakhein
  setSelectedVoiceChannel({ id: vcId, name: vcName }); 

  if (vcChannelRef.current) {
    supabase.removeChannel(vcChannelRef.current);
  }

  const channel = supabase.channel(`persistent-vc-${vcId}`, {
    config: { presence: { key: currentUser.id } }
  });

  channel
    .on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState();
      setVoiceUsers(Object.values(state).flat());
    })
    .subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track({
          id: currentUser.id,
          name: currentUser.name,
          image: currentUser.image,
        });
      }
    });

  vcChannelRef.current = channel;
};

const [value, setValue] = useState("");

const sendMessage = async (
  content?: string, 
  type: "TEXT" | "STICKER" | "GIF" | "IMAGE" | "FILE" | "VOICE" = "TEXT"
) => {
  if (!currentUser || !currentUser.id) return;

  // Validation
  if (type === "TEXT" && (!content || !content.trim())) {
    if (!inputText.trim()) return;
  }

  const finalContent = content || inputText;

  // 1. 🚀 OPTIMISTIC CLEAR (Sabse pehle input saaf karein)
  if (type === "TEXT") setInputText(""); 

  const realId = crypto.randomUUID();
  const isMedia = type !== "TEXT";

  
  
  const messageData = {
    id: realId,
    content: isMedia ? "" : finalContent,
    fileUrl: isMedia ? finalContent : null,
    fileType: type,
    userId: currentUser.id,
    user: currentUser,
    createdAt: new Date().toISOString(),
    channelId: activeChannelId || null,
    receiverId: selectedFriend?.id || null,
    replyToId: replyingTo ? replyingTo.id : null,
    replyTo: replyingTo ? {
      id: replyingTo.id,
      content: replyingTo.content,
      fileType: replyingTo.fileType,
      user: replyingTo.user 
    } : null,
  };

  // 2. UI Updates (Bina await ke)
  setMessages(prev => [...prev, messageData]);
  setReplyingTo(null);

  // 3. Real-time Broadcasts (Inhe bhi await ki zaroorat nahi)
  channelRef.current?.send({
    type: 'broadcast',
    event: 'new_message',
    payload: messageData,
  });

  const mentionRegex = /@(\w+)/g;
  const mentions = finalContent.match(mentionRegex);
  const currentServerId = selectedServer?.id || params?.serverId;

if (mentions) {
  // 🟢 for...of loop use karein taake async sahi chale
  for (const mention of mentions) {
    const username = mention.substring(1).trim().toLowerCase();
    const mentionedUser = friends.find(f => f.name.toLowerCase() === username);
    

    if (mentionedUser) {
      try {
 const { data: notifData, error } = await supabase.from('Notification').insert([{
  id: realId, // 👈 Notification ki ID wahi hogi jo message ki ID hai
  userId: mentionedUser.id,
  senderId: currentUser.id,
  type: currentServerId ? 'SERVER_TAG' : 'MENTION',
  content: finalContent,
  serverId: currentServerId || null, 
  channelId: activeChannelId || null,
  isRead: false
}]).select('*, sender:senderId(name, image)').single();

        if (error) {
          console.error("DB Insert Error:", error);
          continue; 
        }

        if (notifData) {
          // 📡 Signal bhejte waqt channel name check karein
          const channelName = `user-notifications-${mentionedUser.id}`;
          
          supabase.channel(`user-notifications-${mentionedUser.id}`).send({
      type: 'broadcast',
      event: 'new_prover_notif',
      payload: { 
        ...notifData, 
        sender: { name: currentUser.name, image: currentUser.image },
        channelName: activeChannel?.name || 'general' 
      }
    });
          console.log("✅ Signal successfully sent to:", channelName);
        }
      } catch (err) {
        console.error("Mention Process Error:", err);
      }
    }
  }
}

  if (selectedFriend?.id) {
    const signalPayload = {
      ...messageData,
      content: type === "TEXT" ? messageData.content : `Sent a ${type.toLowerCase()}` 
    };

    supabase.channel(`user-messages-${selectedFriend.id}`).send({
      type: 'broadcast',
      event: 'new_message_signal',
      payload: signalPayload
    });

    supabase.channel(`user-messages-${currentUser.id}`).send({
      type: 'broadcast',
      event: 'new_message_signal',
      payload: signalPayload
    });
  }

  

  // 4. ☁️ Background DB Updates (Aakhir mein inhein araam se hone dein)
  try {
    // Friendship Update
  if (selectedFriend?.id) {
  const receiverColumn = selectedFriend.iAmSender ? 'receiverUnread' : 'senderUnread';

  try {
    // 1. Pehle normal fields update karein (last message aur timestamp)
    await supabase
      .from('Friendship')
      .update({
        lastMessage: type === "TEXT" ? messageData.content : `Sent a ${type.toLowerCase()}`,
        lastMessageAt: new Date().toISOString(),
      })
      .eq('id', selectedFriend.friendshipId);

    // 2. 🚀 AB RPC CALL KAREIN (Jo count ko database level par +1 karega)
    await supabase.rpc('increment_unread', { 
      friendship_id: selectedFriend.friendshipId, 
      column_name: receiverColumn 
    });

    console.log("✅ Count incremented in DB via RPC");

  } catch (err) {
    console.error("DB Update Error:", err);
  }
}





    // Main Message Save
    await supabase.from('Message').insert([{
      id: realId,
      content: messageData.content,
      fileUrl: messageData.fileUrl,
      fileType: messageData.fileType,
      userId: currentUser.id,
      channelId: activeChannelId,
      receiverId: selectedFriend?.id,
      replyToId: messageData.replyToId,
      createdAt: messageData.createdAt,
      updatedAt: messageData.createdAt
    }]);
  } catch (error) {
    console.error("Error saving message:", error);
  }

  

};


  // --- 3. OTHER LOGICS (Voice, Auth, Scroll) ---
const sendVoiceMessage = async (audioBlob: Blob) => {
  if (!currentUser?.id) {
    console.error("❌ No User ID found");
    return;
  }
  
  const roomId = getRoomId();
  // Folder structure ke bajaye simple name (RLS bypass karne ke liye best hai)
  const fileName = `voice-${currentUser.id}-${Date.now()}.webm`; 

  try {
    console.log("🎙️ Uploading to Supabase Storage...");

    // ✅ FIX 1: Direct Upload (SQL mein 'TO public' hona chahiye)
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('messages') 
      .upload(fileName, audioBlob, {
        contentType: 'audio/webm',
        upsert: true
      });

    if (uploadError) {
      console.error("❌ Storage Error:", uploadError.message);
      return;
    }

    // ✅ Step 2: Get Public URL
    const { data: { publicUrl } } = supabase.storage
      .from('messages')
      .getPublicUrl(fileName);

    const messageData = {
      id: crypto.randomUUID(),
      content: "Voice Message",
      fileUrl: publicUrl,
      fileType: "VOICE",
      userId: currentUser.id,
      user: currentUser, // Aapka object yahan use ho jayega
      createdAt: new Date().toISOString(),
      channelId: activeChannelId || null,
      receiverId: selectedFriend?.id || null,
    };

    // ✅ Step 3: Local State & Broadcast (0 Delay)
    setMessages((prev) => [...prev, messageData]);

    if (channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'new_message',
        payload: messageData,
      });
    }

    // ✅ Step 4: Database Insert (Prisma schema ke columns match karein)
    const { error: dbError } = await supabase.from('Message').insert([{
      id: messageData.id,
      content: messageData.content,
      userId: messageData.userId,
      channelId: messageData.channelId,
      receiverId: messageData.receiverId,
      fileUrl: messageData.fileUrl,
      fileType: "VOICE",
      createdAt: messageData.createdAt,
      updatedAt: messageData.createdAt // 👈 Ye missing hone se bhi 400 error aata hai
    }]);

    if (dbError) {
      console.error("❌ Database Error:", dbError.message);
    } else {
      console.log("✅ Voice message sent successfully!");
    }

  } catch (error: any) {
    console.error("❌ Unexpected Error:", error);
  }

};


const togglePinMessage = async (msg: any) => {
  if (!msg) return;

  // 1. Pehle status calculate karein
  const newPinStatus = !msg.isPinned;
  
  // 2. Local state update (Optimistic)
  setMessages(prev => prev.map(m => 
    m.id === msg.id ? { ...m, isPinned: newPinStatus } : m
  ));

  // 3. Database update
  const { error } = await supabase
    .from('Message')
    .update({ isPinned: newPinStatus }) // Ensure column name is exactly 'isPinned'
    .eq('id', msg.id);

  if (error) {
    console.error("Supabase Error:", error.message);
    // Error aaye toh state wapis purani kar dein
    setMessages(prev => prev.map(m => 
      m.id === msg.id ? { ...m, isPinned: !newPinStatus } : m
    ));
  }
  
  setContextMenu(null);
};

const isCancelledRef = useRef(false);


  const startRecording = async () => {
   isCancelledRef.current = false; // Reset ref
  setIsCancelled(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
      // ✅ Sabse zaroori check: Agar ref true hai toh send mat karo
      if (isCancelledRef.current) {
        console.log("🚫 Recording cancelled, not sending.");
        return;
      }
      
      const audioBlob = new Blob(chunks, { type: 'audio/webm' });
      sendVoiceMessage(audioBlob);
    };      
    recorder.start();
      setIsRecording(true);
    } catch (err) { console.error(err); }
  };

const cancelRecording = () => {
  isCancelledRef.current = true; // ✅ Ref ko foran true karein
  setIsCancelled(true);
  
  if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
    mediaRecorderRef.current.stop();
  }
  
  setIsRecording(false);
};
const finishAndSend = () => {
  isCancelledRef.current = false; // ✅ Ensure send signal
  setIsCancelled(false);
  
  if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
    mediaRecorderRef.current.stop();
  }
  
  setIsRecording(false);
};

const [callToken, setCallToken] = useState<string>("");

// Token Fetching Logic
useEffect(() => {
  const fetchToken = async () => {
    if (isVoiceActive && activeCallData && currentUser) {
      try {
        const resp = await fetch(`/api/livekit?room=${activeCallData.roomId}&username=${currentUser.name}`);
        const data = await resp.json();
        setCallToken(data.token);
      } catch (e) {
        console.error("Call Token Error:", e);
      }
    } else {
      setCallToken("");
    }
  };
  fetchToken();
}, [isVoiceActive, activeCallData?.roomId]);

// VoiceCallOverlay ke andar return se pehle add karein



const uploadToCloudinary = async (file: File | string) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
    { method: "POST", body: formData }
  );
  const data = await res.json();
  return data.secure_url;
};

const handleFileUpload = async (file: File) => {
  if (!currentUser?.id) return;
  try {
    const imageUrl = await uploadToCloudinary(file); // 🚀 Base64 ki jagah Direct Cloudinary
    const fileType = file.type.startsWith('image/') ? 'IMAGE' : 'FILE';
    await sendMessage(imageUrl, fileType);
    setShowPlusMenu(false);
  } catch (err) {
    console.error("Upload failed:", err);
  }
};

  useEffect(() => {
  if (authStatus === "unauthenticated") router.push("/login");
  if (authStatus === "authenticated") { fetchFriends(); }
}, [authStatus, router, fetchFriends]); // ✅ status ki jagah authStatus

  useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const handleNavigate = (tab: string) => {
    setActiveTab(tab);
    if (tab === "home") {
      setSelectedFriend(null);
      setSelectedServer(null);
      fetchFriends();
      fetchMessages();
    } else if (tab.startsWith("server-")) {
      const serverId = tab.replace("server-", "");
      setSelectedFriend(null);
      fetchServer(serverId); 
    }
  };

if (authLoading) {
  return (
    <div className="h-full bg-black flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-blue-500 font-medium animate-pulse">Synchronizing Session...</p>
      </div>
    </div>
  );
}

// ❌ Purana (Next-Auth): if (!session) return null;
// ✅ Naya (Supabase):
if (!currentUser) return null;
  return (

   
   <div className={`h-full w-full transition-all duration-700 relative overflow-hidden font-sans
      ${activeTheme === 'space-galaxy' ? 'bg-[#02010a]' : 'bg-black'}
    `}>

{activeTheme === 'space-galaxy' && <SpaceBackground />}

     <div className={`relative z-10 grid grid-rows-[auto_1fr] h-full w-full 
      ${activeTheme === 'space-galaxy' ? 'backdrop-blur-[1px]' : ''}
    `}>
      <Header 
  type={selectedServer ? "server" : "friends"}
  name={selectedServer? selectedServer.name : "Friends"}
  imageUrl={selectedServer?.imageUrl}
/>
  <div className="grid grid-cols-[auto_1fr] h-full overflow-hidden relative">
   

   
 

 
    
    {/* --- 1. MOBILE SIDEBAR OVERLAY --- */}
    {isSidebarOpen && (
      <div 
        className=" inset-0 bg-black/60 z-[100] h-full md:hidden transition-opacity duration-300"
        onClick={() => setIsSidebarOpen(false)}
      />
    )}

    {/* --- 2. SIDEBARS (Mobile: Slide-in | Desktop: Static) --- */}
    <aside className={`
          fixed inset-0 top-[48px] z-[110] flex transform transition-transform duration-300
          md:relative md:top-0 md:translate-x-0 md:z-auto ${activeTheme === 'space-galaxy' ? 'bg-black/20 backdrop-blur-xl' : ''}
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}>
      <Sidebar onNavigate={(tab) => { handleNavigate(tab); setIsSidebarOpen(false); }} activeTab={activeTab} />

      <div className={`w-80 flex flex-col border-r border-white/5 transition-all
              ${activeTheme === 'space-galaxy' ? 'bg-transparent' : 'bg-[#0F141B]'}
            `}>
        <div className="h-12 border-b border-white/5 flex items-center px-4 mt-3">
          <button className="bg-black/40 hover:bg-black/60 transition-all w-full text-left px-3 py-1.5 border-1 border-gray-700 rounded-md text-[12px] text-gray-400 font-medium">
            Find or start a conversation
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-4 no-scrollbar">
          {(activeTab === "home" || selectedFriend) ? (
            <div className="space-y-0.5">
              <div 
                onClick={() => { setActiveTab("home"); setSelectedFriend(null); setIsSidebarOpen(false); }}
                className={`flex items-center gap-3 p-2 rounded cursor-pointer text-[15px] font-medium transition-all ${(activeTab === "home" && !selectedFriend) ? "bg-white/10 text-white" : "text-[#949ba4] hover:text-[#dbdee1] hover:bg-white/5"}`}
              >
                <svg aria-hidden="true" role="img" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#c4c4c4b3" viewBox="0 0 24 24">
        <path fill="var(--interactive-icon-default)" d="M13 10a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"></path>
        <path fill="var(--interactive-icon-default)" d="M3 5v-.75C3 3.56 3.56 3 4.25 3s1.24.56 1.33 1.25C6.12 8.65 9.46 12 13 12h1a8 8 0 0 1 8 8 2 2 0 0 1-2 2 .21.21 0 0 1-.2-.15 7.65 7.65 0 0 0-1.32-2.3c-.15-.2-.42-.06-.39.17l.25 2c.02.15-.1.28-.25.28H9a2 2 0 0 1-2-2v-2.22c0-1.57-.67-3.05-1.53-4.37A15.85 15.85 0 0 1 3 5Z">
          </path>
          </svg> Friends
              </div>
              <div className="pt-5 pb-1 px-2 flex items-center justify-between group top-border">
                <p className="text-[11px] font-medium text-[#949ba4] uppercase tracking-wider">Direct Messages</p>
                <Plus size={14} className="text-[#949ba4] cursor-pointer hover:text-white" />
              </div>
              <div className="space-y-0.5">
      {liveFriends.map((friend) => {
  const isActive = selectedFriend?.id === friend.id;
  const isSpaceNameplate = friend.nameplate === 'space';

  return (
    <div
      key={friend.id}
      onClick={() => {
        handleFriendSelect(friend);
        setIsSidebarOpen(false);
      }}
      // 🔑 Base classes: Normal text color, transition etc.
      className={`
        flex items-center gap-3 p-2 rounded cursor-pointer group justify-between transition-all duration-300 relative overflow-hidden mb-[2px]
        ${isActive ? "text-white" : "text-[#949ba4] hover:text-white"}
      `}
    >
      {/* 🚀 SPACE NAMEPLATE LOGIC: Sirf Active ya Hover par Lottie chalega */}
      {isSpaceNameplate && (
        <div className={`absolute w-full inset-0 transition-opacity duration-500 
          ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
          <SpaceNameplateOverlay/>
        </div>
      )}

      {/* --- Friend Info Container (Relative z-10 taake animation ke upar dikhe) --- */}
    {/* --- Friend Info --- */}

      <div className="flex flex-row gap-2 z-10">

        <div className="relative w-9 h-9 rounded-full flex-shrink-0 shadow-lg">

          <HoverAvatar

            src={friend.image}

            name={friend.name}

            status={friend.liveStatus}

            className="w-9 h-9 rounded-full"

         

          />



          {/* REALTIME STATUS DOT */}

          <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-[#121212] flex items-center justify-center

            ${friend.liveStatus === "ONLINE" ? "bg-green-500" :

              friend.liveStatus === "DND" ? "bg-red-500" :

              friend.liveStatus === "IDLE" ? "bg-yellow-500" : "bg-gray-500"}

          `}>

            {friend.liveStatus === "DND" && <div className="w-2 h-[2px] bg-[#313338] rounded-full" />}

            {friend.liveStatus === "IDLE" && (

              <div className="w-2 h-2 bg-[#121212] rounded-full -translate-x-0.5 -translate-y-0.5" style={{ clipPath: "circle(100% at 20% 20%)" }} />

            )}

          </div>

        </div>



        <div className="flex flex-col min-w-0 relative top-[3px]">

          <span className={`text-[14px] font-medium truncate leading-tight transition-colors ${isActive ? "text-white" : "group-hover:text-white"}`}>

            {friend.name}

          
          </span>

          <span className="text-[10px] text-gray-400 leading-none truncate mt-0.5 font-medium">

            {friend.liveStatus.toLowerCase()}

          </span>

        </div>

      </div>



      {/* --- Badge / Unread Count --- */}

      {friend.count > 0 && (

        <div className="bg-[#f23f42] text-white text-[10px] font-medium px-1.5 py-0.5 rounded-full w-[18px] h-[18px] flex items-center justify-center shadow-lg animate-in zoom-in duration-300 z-10">

          {friend.count > 9 ? "9+" : friend.count}

        </div>

      )}

    </div>

  );

})}

              </div>
            </div>
          ) : (
            selectedServer ? <ServerSidebar server={selectedServer} onChannelSelect={(id) => { handleChannelSelect(id); setIsSidebarOpen(false); }} handleJoinVC={handleJoinVC} activeChannelId={activeChannelId} /> : <div className="p-4 text-center text-gray-500 text-xs animate-pulse">Loading details...</div>
          )}
        </div>

        {/* Voice Connection Bar */}
        {/* Sidebar.tsx ya Dashboard mein jahan UserControl hai */}

  {isVoiceActive && activeCallData && (selectedFriend?.id !== activeCallData.friendId || !selectedFriend) && (
    <div className="mx-2 mb-2 bg-[#232428] rounded-md p-2 border border-white/5 animate-in slide-in-from-bottom-2">
      <div className="flex items-center justify-between px-1">
        <div 
          className="flex flex-col cursor-pointer hover:opacity-80 flex-1 min-w-0"
          onClick={() => handleFriendSelect(activeCallData)} // Wapis call wali chat pe le jayega
        >
          <div className="flex items-center gap-1.5 text-[#23a559] font-medium text-[11px]">
            <div className="w-2 h-2 bg-[#23a559] rounded-full animate-pulse" /> 
            VOICE CONNECTED
          </div>
          <span className="text-white/70 text-[10px] truncate">
            {activeCallData.name}
          </span>
        </div>
        
        <div className="flex items-center gap-1">
          <button onClick={() => setIsMicMuted(!isMicMuted)} className="p-1.5 text-gray-400 hover:text-white">
            {isMicMuted ? <MicOff size={14} /> : <Mic size={14} />}
          </button>
          <button onClick={handleEndCall} className="p-1.5 text-[#f23f42] hover:bg-rose-500/10 rounded">
            <PhoneOff size={14} />
          </button>
        </div>
      </div>
    </div>
  )}
  
  
        <UserControl
        
         currentUser={currentUser}
          channel={presenceChannelRef.current} 
          onStatusUpdate={handleStatusUpdate}
          
          />
      </div>
    </aside>

    {/* --- 3. MAIN CONTENT --- */}
<div className={`flex-1 flex flex-col h-full relative overflow-hidden 
           ${activeTheme === 'space-galaxy' ? 'bg-black/20 backdrop-blur-xl' : ''}
        `}>      {activeTab === "home" && !selectedFriend ? (
        <div className="flex flex-col h-full">
            
          
          <FriendsManager
          fetchFriends={fetchFriends}
          currentUser={currentUser} 
          presenceState={presenceState}
          pendingRequests={pendingRequests} // ✅
  setPendingRequests={setPendingRequests} 
          mobileMenuTrigger={
          <button 
          onClick={() => setIsSidebarOpen(true)} 
          className="md:hidden p-1 -ml-1 text-[#b5bac1] hover:text-white"
           >
         <Menu size={24} />
         </button>
          }
          />
          
        </div>
      ) : (
        <div className={`flex-1 flex flex-col h-full relative overflow-hidden transition-all
          ${activeTheme === 'space-galaxy' ? ' backdrop-blur-md' : 'bg-[#0B0F14]'}
        `}>
          {/* Header */}
          <div className="h-12 sm:h-14 flex-none border-b border-white/5 mt-3 flex items-center justify-between px-4 backdrop-blur-md bg-black/10 z-100">
            <div className="flex items-center gap-3">
              <button onClick={() => setIsSidebarOpen(true)} className="md:hidden text-gray-400 hover:text-white mr-0"><Menu size={18} /></button>
              {selectedFriend ? (
      <>
        {/* ✅ FRIEND IMAGE & STATUS INDICATOR (Header Fix) */}
        <div className="flex items-center gap-3">
    <div className="relative">
      {/* 2. Aapka HoverAvatar */}
      <HoverAvatar 
        src={selectedFriend?.image} 
        status={currentStatus}
        className="w-9 h-9 rounded-full" 
      />

      {/* 3. Sidebar wala exact Status Dot logic */}
      <div
        className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-[#1e1f22] flex items-center justify-center 
        ${
          currentStatus === "ONLINE"
            ? "bg-green-500"
            : currentStatus === "DND"
            ? "bg-red-500"
            : currentStatus === "IDLE"
            ? "bg-yellow-500"
            : "bg-gray-500"
        }`}
      >
        {/* DND Logic */}
        {currentStatus === "DND" && (
          <div className="w-2 h-[2px] bg-[#1e1f22] rounded-full" />
        )}

        {/* IDLE Logic */}
        {currentStatus === "IDLE" && (
          <div
            className="w-2 h-2 bg-[#1e1f22] rounded-full -translate-x-0.5 -translate-y-0.5"
            style={{ clipPath: "circle(100% at 20% 20%)" }}
          />
        )}
      </div>
    </div>

    {/* User Details */}
    <div className="flex flex-col">
      <span className="text-[14px] font-medium text-white leading-tight">
        {selectedFriend?.name}
      </span>
      <span className="text-[10px] text-gray-400 font-medium capitalize">
        {currentStatus.toLowerCase()}
      </span>
    </div>
  </div>
        
      </>
    ) : (
      /* Server Channel Info (Hash icon + Name) */
      <div className="flex items-center gap-2">
        <Hash size={20} className="text-gray-400 hidden xs:block" />
        <span className="font-medium text-white text-[15px] truncate max-w-[120px] sm:max-w-none">
          {selectedServer?.channels?.find((c: any) => c.id === activeChannelId)?.name || "general"}
        </span>
      </div>
    )}
              
            </div>
            <div className="flex items-center gap-2 sm:gap-4 text-gray-400">
  <Phone 
  size={18} 
  className={`transition-colors ${
    isVoiceActive 
      ? 'text-green-500 cursor-not-allowed' // Call chal rahi hai toh green aur disabled feel
      : 'text-gray-400 hover:text-white cursor-pointer'
  }`} 
  onClick={() => {
    if (isVoiceActive) return; // 👈 Agay mat jao agar call active hai
    startCall();
  }}
/>
    <Video size={18} className="hidden sm:block hover:text-white cursor-pointer" />

  
  <PinnedMessages 
    channelId={activeChannelId || undefined}
    receiverId={selectedFriend?.id}
    scrollToMessage={scrollToMessage}
    messages={messages}
  />

  {/* --- SEARCH SECTION --- */}


  {/* Video, Users etc (sirf Desktop par) */}
  <Users 
    size={18} 
    className={`cursor-pointer hidden lg:block ${showMemberSidebar ? 'text-white' : ''}`}
    onClick={() => setShowMemberSidebar(!showMemberSidebar)} 
  />
  {currentUser?.id && (
  <InboxPopover 
    currentUserId={currentUser.id} 
        onNavigate={handleInboxNavigation}// 👈 Ye naya prop bhejien

    onOpen={() => {
      // Jab user Inbox kholay, database mein sab read mark kardo
      supabase
        .from('Notification')
        .update({ isRead: true })
        .eq('userId', currentUser.id)
        .then(() => console.log("Counts reset in DB"));
    }}
  />
)}
    <div className="relative">
    {/* Desktop: Hamesha SearchBar dikhao | Mobile: Sirf Icon dikhao */}
    <div className="hidden sm:block">
      <SearchBar friendName={selectedFriend?.name || "chat"}
      
  messages={messages}             // ✅ Aapki chat messages ki state
  scrollToMessage={scrollToMessage} />
    </div>

    {/* Mobile Search Icon: Click karne par popup toggle hoga */}
    <div className="sm:hidden">
      <Search 
        size={18} 
        className={`cursor-pointer transition-colors ${isSearchVisible ? 'text-white' : 'hover:text-white'}`}
        onClick={() => setIsSearchVisible(!isSearchVisible)}
      />
    </div>

    {/* MOBILE SEARCH POPUP: Icon se thora niche */}
    {isSearchVisible && (
      <div className="sm:hidden absolute top-10 right-0 z-50 w-[250px] animate-in fade-in slide-in-from-top-2 duration-200">
        {/* Backdrop to close when clicking outside */}
        <div className="fixed inset-0 z-[-1]" onClick={() => setIsSearchVisible(false)} />
        
        <div className="bg-[#1e1f22] p-2 rounded-md shadow-2xl border border-white/10">
          <SearchBar friendName={selectedFriend?.name || "chat"} 
          
  messages={messages}             // ✅ Aapki chat messages ki state
  scrollToMessage={scrollToMessage}
          />
        </div>
      </div>
    )}
  </div>
</div>
          </div>

          {/* Dashboard.tsx - Chat Header ke foran baad */}

  
  {/* Call Overlay: Sirf tab dikhayein jab call active ho aur DM selected ho */}
 {/* 🌐 GLOBAL VOICE LAYER (Dashboard ke end mein) */}
{/* Dashboard.tsx ke bilkul niche */}
{callToken && activeCallData && (
  <LiveKitRoom
    key={activeCallData.roomId}
    token={callToken}
    serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
    audio={true}
    connect={true}
    onDisconnected={handleEndCall}
  className="!h-[250px] w-full">
    <RoomAudioRenderer />

    {/* 🟢 CONDITION: Sirf tab Bara UI dikhao jab hum usi friend ke DM mein hon */}
    {isVoiceActive && selectedFriend?.id === activeCallData.friendId && (
      <div className=" z-[500] flex items-start justify-center">
        <div className="pointer-events-auto w-full">
           <VoiceCallOverlay 
             caller={currentUser}
             receiver={activeCallData} 
             isMicMuted={isMicMuted}
             callStatus={callStatus}
             onMuteToggle={() => setIsMicMuted(!isMicMuted)}
             onEndCall={handleEndCall}
           />
        </div>
      </div>
    )}
  </LiveKitRoom>
)}
  

  {/* Chat Messages Area */}
 
 {isVoiceActive && selectedVoiceChannel && (
      <div key="persistent-voice-layer" className={showFullVoiceUI ? "absolute inset-0 z-[200] bg-[#2b2d31] flex flex-col" : "hidden"}>
        <VoiceChannelUI key={`vc-${selectedVoiceChannel.id}`} channelId={selectedVoiceChannel.id} channelName={selectedVoiceChannel.name} isExternalMuted={isMicMuted} onMuteChange={setIsMicMuted} currentUser={currentUser} onClose={() => setShowFullVoiceUI(false)} onLeave={() => { if (vcChannelRef.current) supabase.removeChannel(vcChannelRef.current); setIsVoiceActive(false); setShowFullVoiceUI(false); }} />
      </div>
    )}
          {/* Messages Area */}
         <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 custom-scrollbar">
  {isMessagesLoading ? (
    <div className="flex flex-col items-center justify-center h-full gap-4">
      <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-gray-500 text-sm">Loading...</p>
    </div>
  ) : (
    <div className="flex flex-col justify-end min-h-full space-y-1">
      {/* --- DM INTRO SECTION --- */}
      {selectedFriend && (
        <div className="flex flex-col items-start px-2 mb-4 mt-6 sm:mt-10">
          <div className="w-16 h-16 sm:w-20 sm:h-20 mb-3">
            <HoverAvatar 
              src={selectedFriend.image} 
              name={selectedFriend.name}
                    status={selectedFriend.user?.liveStatus || presenceState[selectedFriend.userId]?.[0]?.status || 'OFFLINE'}
              className="w-full h-full rounded-full shadow-2xl" 
              onClick={(e: React.MouseEvent) => handleAvatarClick(e, selectedFriend.user)}
            />
          </div>
          <h1 className="text-xl sm:text-2xl font-medium text-white mb-2">{selectedFriend.name}</h1>
          <p className="text-[#b5bac1] text-sm sm:text-[15px]">
            This is the beginning of your direct message history with <span className="font-medium text-white">@{selectedFriend.name}</span>.
          </p>
          <div className="flex gap-2 mt-4">
            <button className="px-3 sm:px-4 py-1.5 bg-[#4e5058] hover:bg-[#6d6f78] text-white text-xs sm:text-sm font-medium rounded transition">Remove Friend</button>
            <button className="px-3 sm:px-4 py-1.5 bg-[#4e5058] hover:bg-[#6d6f78] text-white text-xs sm:text-sm font-medium rounded transition">Block</button>
          </div>
          
          {messages.length > 0 && (
            <div className="w-full flex items-center gap-2 mt-10 mb-2">
              <div className="h-[1px] bg-white/10 flex-1" />
              <span className="text-[10px] sm:text-[12px] font-medium text-[#949ba4] uppercase whitespace-nowrap">
                {new Date(messages[0].createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </span>
              <div className="h-[1px] bg-white/10 flex-1" />
            </div>
          )}
        </div>
      )}



      {/* --- CHANNEL INTRO SECTION --- */}
      {activeChannelId && (
        <div className="flex flex-col items-start mb-4 mt-6 sm:mt-10 px-2 sm:px-4">
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-[#313338] flex items-center justify-center mb-4 shadow-xl">
            <Hash size={30} className="text-white sm:w-10 sm:h-10" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-medium text-white mb-2">
            Welcome to #{selectedServer?.channels?.find((c: any) => c.id === activeChannelId)?.name || "general"}!
          </h1>
          <p className="text-[#b5bac1] text-sm sm:text-[15px]">
            This is the start of the <span className="font-medium text-white">#{selectedServer?.channels?.find((c: any) => c.id === activeChannelId)?.name || "general"}</span> channel.
          </p>
          <button className="mt-4 flex items-center gap-1.5 text-[#00a8fc] hover:underline text-xs sm:text-sm font-medium transition">
            <Pencil size={14} /> Edit Channel
          </button>
          {messages.length > 0 && (
            <div className="w-full flex items-center gap-2 mt-10 mb-2">
              <div className="h-[1px] bg-white/10 flex-1" />
              <span className="text-[10px] sm:text-[12px] font-medium text-[#949ba4] uppercase tracking-widest">
                {new Date(messages[0].createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </span>
              <div className="h-[1px] bg-white/10 flex-1" />
            </div>
          )}
        </div>
      )}

      {/* --- MESSAGES MAPPING --- */}
      {messages.map((msg, index) => {
        const prevMsg = messages[index - 1];
        const isSameUser = prevMsg && prevMsg.userId === msg.userId;
        const isTimeNear = prevMsg && (new Date(msg.createdAt).getTime() - new Date(prevMsg.createdAt).getTime()) < 300000;
        const compactMode = isSameUser && isTimeNear && !msg.replyToId;
        const repliedMsg = msg.replyTo || messages.find(m => m.id === msg.replyToId);
       const match = msg.content?.match(inviteRegex);
        const foundCode = match ? match[1] : null;
        const formatContent = (content: string) => {
    if (!content) return content;
    
    // Regex jo @username ko dhoondega
    const parts = content.split(/(@\w+)/g);
    
    return parts.map((part, i) => {
      if (part.startsWith("@")) {
        return (
          <span 
            key={i} 
            className="bg-indigo-500/30 text-indigo-400 px-1 rounded-[3px] font-medium cursor-pointer hover:bg-indigo-500 hover:text-white transition-all"
          >
            {part}
          </span>
        );
      }
      return part;
    });
  };

        return (
          <div 
            key={msg.id || index} 
            id={`msg-${msg.id}`} 
            onContextMenu={(e) => handleContextMenu(e, msg)} 
            className={`group relative flex flex-col px-4 py-[2px] hover:bg-white/[0.05] -mx-4 transition-colors ${!compactMode ? 'mt-4' : ''}`}
          >
                <div className="absolute -top-4 right-4 hidden group-hover:flex items-center bg-[#2b2d31] border border-black/40 rounded-[4px] shadow-lg z-20 overflow-hidden h-8">

      <button className="p-1.5 hover:bg-white/10 text-[#b5bac1] hover:text-[#dbdee1]"><Smile size={16}/></button>

      <button onClick={() => setReplyingTo(msg)} className="p-1.5 hover:bg-white/10 text-[#b5bac1] hover:text-[#dbdee1]"><Reply size={16}/></button>

      {msg.userId === currentUser?.id && (

        <button onClick={() => { setEditingMessage(msg.id); setEditContent(msg.content); }} className="p-1.5 hover:bg-white/10 text-[#b5bac1] hover:text-[#dbdee1]"><Pencil size={16}/></button>

      )}

      <button onClick={() => deleteMessage(msg.id)} className="p-1.5 hover:bg-rose-500/20 text-[#b5bac1] hover:text-rose-500"><Trash2 size={16}/></button>

    </div>
            {/* --- REPLY PREVIEW --- */}
            {repliedMsg && (
              <div className="flex items-center gap-1 mb-1 ml-4 opacity-70 relative">
                <div className="absolute left-[0px] top-[5px] w-9 h-[12px] border-l-2 border-t-2 border-[#4e5058] rounded-tl-[4px]" />
                <div className=" relative flex items-center left-[23px] top-[-3] gap-2 ml-4 truncate">
                  <HoverAvatar 
                    src={repliedMsg.user?.image} 
                    name={repliedMsg.user?.name} 
                    status={msg.user?.liveStatus || presenceState[repliedMsg.userId]?.[0]?.status || 'OFFLINE'}
                    className="w-4 h-4 rounded-full" 
                onClick={(e: React.MouseEvent) => handleAvatarClick(e, repliedMsg.user)}
                  />
                  <span className="text-[12px] font-medium text-white whitespace-nowrap">{repliedMsg.user?.name}</span>
                  <p className="text-[12px] text-[#fff] truncate">{repliedMsg.content}</p>
                </div>
              </div>
            )}

            {selectedUserForPopover && (
  <div className="fixed inset-0 z-[9999999] flex items-center justify-center pointer-events-none">
    <div className="pointer-events-auto">
      <GuestProfilePopover 
    user={selectedUserForPopover} // 🟢 guestUser ki jagah 'user' likhein
status={selectedUserForPopover.liveStatus || presenceState[selectedUserForPopover.id]?.[0]?.status || 'OFFLINE'}  
  coords={popoverCoords}
    onClose={() => setSelectedUserForPopover(null)}
    isFriend={selectedUserForPopover && friends?.some((f: any) => f.id === selectedUserForPopover.id)} 
  
  onAddFriend={async () => {
     try {
       await fetch("/api/friends/request", {
         method: "POST",
         body: JSON.stringify({ userId: selectedUserForPopover.id })
       });
       // toast.success("Friend request sent!"); // Ensure toast is imported
     } catch (err) {
       console.error(err);
     }
  }}
 onSendMessage={async (text: string) => { 
    // 1. Agar ye user current friend hai (DM mode), toh seedha sendMessage function use karein
    if (selectedFriend?.id === selectedUserForPopover.id) {
       await sendMessage(text, "TEXT");
    } else {
       // 2. Agar user selected nahi hai (Sidebar se kisi aur pe click kiya), toh ye logic chale:
       const realId = crypto.randomUUID();
       const messageData = {
         id: realId,
         content: text,
         fileType: "TEXT",
         userId: currentUser.id,
         user: currentUser,
         createdAt: new Date().toISOString(),
         receiverId: selectedUserForPopover.id,
       };

       // Broadcast trigger karein taake doosre user ko signal mil jaye
       supabase.channel(`user-messages-${selectedUserForPopover.id}`).send({
         type: 'broadcast',
         event: 'new_message_signal',
         payload: messageData
       });

       // Database mein save karein
       await supabase.from('Message').insert([{
         id: realId,
         content: text,
         userId: currentUser.id,
         receiverId: selectedUserForPopover.id,
         fileType: "TEXT"
       }]);

       toast.success(`Message sent to ${selectedUserForPopover.name}`);
    }
    }}
/>
  
    </div>
  </div>
)}

            <div className="flex items-start">
              <div className="w-10 flex-shrink-0 flex justify-center">
                {!compactMode ? (
                  <HoverAvatar 
                    src={msg.user?.profiles?.avatar || msg.user?.image} 
                    name={msg.user?.name}
                    status={msg.user?.liveStatus || presenceState[msg.userId]?.[0]?.status || 'OFFLINE'}
                    className="w-10 h-10 rounded-full" 
          onClick={(e: React.MouseEvent) => handleAvatarClick(e, msg.user)}

  
                  />
                ) : (
                  <span className="hidden group-hover:block text-[10px] text-[#949ba4] mt-1">
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                  </span>
                )}
              </div>
              
              <div className="ml-2 sm:ml-4 flex flex-col leading-[1.375rem] flex-1 min-w-0">
                {!compactMode && (
                  <div className="flex items-baseline gap-2">
                    <span className="text-[14px] sm:text-[15px] text-white font-semibold hover:underline cursor-pointer truncate">
                      {msg.user?.name}
                    </span>
                    <span className="text-[10px] sm:text-[11px] text-[#949ba4] font-medium whitespace-nowrap">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {msg.isPinned && <Pin size={12} className="text-gray-400 -rotate-45 fill-gray-400" />}
                  </div>
                )}


                <div className="max-w-full">
                  {editingMessage === msg.id ? (
                    <div className="flex flex-col gap-2 mt-1 w-full max-w-[400px]">
                      <input

                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        autoFocus
                        className="bg-[#383a40] text-white text-[14px] sm:text-[15px] p-2 rounded-md outline-none border border-indigo-500 w-full"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") updateMessage(msg.id, editContent);
                          if (e.key === "Escape") setEditingMessage(null);
                        }}
                      />
                      <div className="text-[9px] sm:text-[10px] text-gray-400">escape to cancel • enter to save</div>
                    </div>
                  ) : (
                    <div className="max-w-fit">
                      {msg.fileType === "VOICE" ? (
                        <VoicePlayer url={msg.fileUrl} />
                      ) : (msg.fileType === "STICKER" || msg.fileType === "GIF") ? (
                        <div className="relative group mt-1">
                          <img 
                            src={msg.fileUrl} 
                            alt={msg.fileType} 
                            className={`rounded-lg border border-white/5 shadow-lg object-contain ${
                              msg.fileType === 'STICKER' ? 'w-28 h-28 sm:w-40 sm:h-40' : 'w-full max-w-[220px] xs:max-w-[260px] sm:max-w-[300px]'
                            }`} 
                          />
                          {msg.fileType === "GIF" && (
                            <div className="absolute top-2 left-2 bg-black/50 text-white text-[9px] font-medium px-1.5 py-0.5 rounded uppercase">GIF</div>
                          )}
                        </div>
                      ) : msg.fileType === "IMAGE" ? (
                        <div className="mt-1">
                          <img 
                            src={msg.fileUrl} 
                            className="w-full max-w-[250px] xs:max-w-[280px] sm:max-w-[400px] h-auto rounded-lg border border-white/5 mt-1 cursor-zoom-in" 
                            alt="upload" 
                            onClick={() => window.open(msg.fileUrl, '_blank')} 
                          />
                        </div>
                      ) : (
<div className="text-[14px] sm:text-[15px] text-[#dbdee1] whitespace-pre-wrap break-words">
                          {formatContent(msg.content)}
          {foundCode && (
        <div className="mt-2">
          <ServerInviteCard 
            inviteCode={foundCode} 
            currentUserId={currentUser.id} 
            onJoinSuccess={fetchServers} 
          />
        </div>
      )}
                          {msg.updatedAt && msg.createdAt && new Date(msg.updatedAt).getTime() > new Date(msg.createdAt).getTime() + 1000 && (
                            <span className="text-[10px] text-gray-500 ml-1 select-none">(edited)</span>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
      <div ref={scrollRef} />
    </div>
  )}
</div>

          {/* --- INPUT AREA --- */}
          <div className="flex-none px-2 sm:px-4 pb-2 pt-2 sm:pb-3 relative bg-transparent">
            {replyingTo && (
              <div className="flex items-center justify-between px-4 mx-2 py-1 bg-[#2b2d31] rounded-t-md border-b border-white/5 animate-in slide-in-from-bottom-2">
                <div onClick={() => scrollToMessage(replyingTo.id)} className="flex items-center gap-2 text-xs cursor-pointer"><span className="text-gray-400">Replying to</span><span className="font-medium text-white">{replyingTo.user?.name}</span></div>
                <button onClick={() => setReplyingTo(null)} className="p-1 hover:bg-white/10 rounded-full transition"><X size={14} className="text-gray-400" /></button>
              </div>
            )}

            {/* Popups */}
            {showPlusMenu && <div className="absolute bottom-full mb-2 z-50"><PlusMenu onUpload={handleFileUpload} /></div>}
            {showEmojiModal && <div className="absolute bottom-full right-4 mb-2 z-50"><EmojiModal onEmojiSelect={(emoji: string) => setInputText(prev => prev + emoji)} /></div>}
            {showGifModal && <div className="absolute bottom-full right-4 mb-2 z-50"><GifModal onGifSelect={(url: string) => { sendMessage(url, "GIF"); setShowGifModal(false); }} /></div>}
            {showStickerModal && <div className="absolute bottom-full right-4 mb-2 z-20000">
              <StickerModal onStickerSelect={(url: string) => { sendMessage(url, "STICKER"); setShowStickerModal(false); }}
               onCustomUpload={() => {}} /></div>}


     <div className="relative w-full overflow-hidden rounded-lg">
             {isRecording && (
    <div className={`
      /* ✅ MOBILE: Floating above input */
      fixed bottom-[6px] left-4 right-4 z-50 animate-in slide-in-from-bottom-2
      /* ✅ DESKTOP: Back inside input bar flow */
      md:absolute md:inset-0 md:bottom-0 md:left-0 md:right-0 md:z-[60]
    `}>
      <div className="bg-[#5865f2] rounded-full flex items-center p-2.5 sm:p-3 gap-2 sm:gap-4 shadow-2xl md:shadow-none h-full border border-white/10 md:border-none">
        
        {/* Cancel Button */}
        <div className="flex items-center gap-2 px-2 sm:px-3 border-r border-white/20">            
           <button 
             onClick={(e) => { e.stopPropagation(); cancelRecording(); }} 
             className="text-white/80 hover:text-white font-medium text-[10px] sm:text-xs uppercase whitespace-nowrap"
           >
             Cancel
           </button>
        </div>      

        {/* Waves Animation */}
        <div className="flex-1 flex items-center gap-[2px] sm:gap-[3px] h-6 sm:h-8 overflow-hidden">
          {[...Array(typeof window !== 'undefined' && window.innerWidth < 768 ? 30 : 60)].map((_, i) => (
            <div 
              key={i} 
              className="w-[2px] bg-white/50 rounded-full animate-bounce" 
              style={{ 
                height: `${Math.random() * 100}%`, 
                animationDelay: `${i * 0.05}s` 
              }} 
            />
          ))}
        </div>

        {/* Recording Info & Send */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse hidden xs:block" />
          <span className="text-white font-medium text-[12px] sm:text-sm whitespace-nowrap">
            Recording
          </span>
          <button 
            onClick={(e) => { e.stopPropagation(); finishAndSend(); }} 
            className="bg-white p-1.5 sm:p-2 rounded-full text-[#5865f2] shadow-md transition-transform active:scale-95"
          >
            <Send className="rotate-45" size={18} />
          </button>
        </div>
      </div>
    </div>
  )}

            {/* --- RECORDING UI & INPUT --- */}
            <div className="bg-[#383a40]  flex items-center p-2 sm:p-3 gap-2 sm:gap-4 border border-transparent focus-within:border-white/5">
             
               
                  <PlusCircle size={24} className={`cursor-pointer transition flex-shrink-0 ${showPlusMenu ? 'text-white' : 'text-[#b5bac1] hover:text-white'}`} onClick={(e) => { e.stopPropagation(); setShowPlusMenu(!showPlusMenu); }} />
<input 
    value={inputText} 
    onChange={(e) => setInputText(e.target.value)}
    onKeyDown={(e) => e.key === "Enter" && sendMessage(inputText, "TEXT")}
    placeholder="Message..." 
    className="bg-transparent outline-none flex-1 text-white text-[14px] sm:text-[15px] min-w-0 placeholder:text-[#80848e]" 
  />                 
   <div className="flex items-center gap-3 sm:gap-3 shrink-0 ">
<button onClick={startRecording} className="text-[#b5bac1] hover:text-white cursor-pointer">
        <Mic size={20} />
      </button>                    <div className={`px-1 py-0.5 rounded-md cursor-pointer border-2 font-medium text-[10px]  sm:block ${showGifModal ? 'text-white border-white' : 'text-[#b5bac1] border-[#b5bac1] hover:text-white'}`} onClick={(e) => { e.stopPropagation(); setShowGifModal(!showGifModal); }}>GIF</div>
                  
   
<button 
  onClick={(e) => {
    e.stopPropagation(); // Taake click event parent tak na jaye
    setShowStickerModal(!showStickerModal);
    setShowEmojiModal(false); // Doosre modals band karo
  }} 
  className={`shrink-0 transition-colors ${showStickerModal ? 'text-white' : 'text-[#b5bac1] hover:text-white cursor-pointer'}`}
>
  <Sticker size={20} />
</button>
                    <Smile size={22} className={`cursor-pointer ${showEmojiModal ? 'text-[#ffcc4d]' : 'text-[#b5bac1] hover:text-white'}`} onClick={(e) => { e.stopPropagation(); setShowEmojiModal(!showEmojiModal); }} />
                  </div>
                
              
            </div>
          </div>
            
          </div>
        </div>
      )}
    </div>

    {/* Context Menu & Voice Overlays */}
    {contextMenu && <MessageContextMenu x={contextMenu.x} y={contextMenu.y} msg={contextMenu.msg} isOwner={contextMenu.msg.userId === currentUser?.id} onClose={() => setContextMenu(null)} onDelete={deleteMessage} onCopy={copyToClipboard} onReply={(m) => { setReplyingTo(m); setContextMenu(null); }} onEdit={(id) => { setEditingMessage(id); setEditContent(contextMenu.msg.content); setContextMenu(null); }} onPin={() => togglePinMessage(contextMenu.msg)} isPinned={contextMenu.msg.isPinned} />}

    

   
    {/* Dashboard.tsx ke bilkul niche */}
{incomingCall && (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none">
        <div className="pointer-events-auto"> {/* Taake clicks kaam karein */}
          <IncomingCallOverlay 
            callerName={incomingCall.callerName}
            callerImage={incomingCall.callerImage}
            onAccept={handleAcceptCall}
            onReject={handleRejectCall} // 👈 handleRejectCall use karein jo dashboard mein hai
          />
        </div>
      </div>
    )}



  </div>
  
  </div>
  </div>
);
// Dashboard.tsx ke states mein add karein

}