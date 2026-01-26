"use client";
import { 
  Copy, Pencil, Reply, Pin, Trash2, MessageSquare, 
  UserPlus, ShieldAlert, Forward, Link as LinkIcon, Smile, CheckCircle2
} from "lucide-react";

interface ContextMenuProps {
  x: number;
  y: number;
  msg: any;
  onClose: () => void;
  onDelete: (id: string) => void;
  onCopy: (text: string) => void;
  onReply: (msg: any) => void;
  onEdit: (id: string) => void;
  isOwner: boolean;
  onPin: () => void; // ✅ Ye add karein
  isPinned: boolean;
}

export const MessageContextMenu = ({ 
  x, y, msg, onClose, onDelete, onCopy, onReply, onEdit, isOwner, onPin, isPinned
}: ContextMenuProps) => {
  
  // Screen se bahar na jaye uske liye thori adjustments
  const menuStyle = {
    top: `${y}px`,
    left: `${x}px`,
    transform: x > window.innerWidth - 250 ? 'translateX(-100%)' : 'none'
  };

  return (
    <>
      {/* Backdrop to close menu */}
      <div className="fixed inset-0 z-[100]" onClick={onClose} onContextMenu={(e) => { e.preventDefault(); onClose(); }} />
      
      <div 
        style={menuStyle}
        className="fixed w-[220px] bg-[#111214] rounded-sm shadow-xl border border-black/20 py-2 z-[110] animate-in fade-in zoom-in-95 duration-100 flex flex-col gap-[2px]"
      >
        {/* --- SECTION 1: ACTIONS --- */}
        <ContextItem label="Add Reaction" icon={<Smile size={14} />} onClick={onClose} />
        <ContextItem label="Edit Message" icon={<Pencil size={14} />} onClick={() => onEdit(msg.id)} disabled={!isOwner} />
        <ContextItem label="Reply" icon={<Reply size={14} />} onClick={() => onReply(msg)} />
        
        <div className="h-[1px] bg-white/5 my-1 mx-2" />

        {/* --- SECTION 2: UTILS --- */}
        <ContextItem label="Copy Text" icon={<Copy size={14} />} onClick={() => onCopy(msg.content)} />
        <ContextItem 
          label={isPinned ? "Unpin Message" : "Pin Message"} 
          icon={<Pin size={14} className={isPinned ? "fill-white" : ""} />} 
          onClick={() => { onPin(); onClose(); }} 
        />
        <ContextItem label="Forward" icon={<Forward size={14} />} onClick={onClose} />
        <ContextItem label="Copy Message ID" icon={<LinkIcon size={14} />} onClick={() => onCopy(msg.id)} />

        <div className="h-[1px] bg-white/5 my-1 mx-2" />

        {/* --- SECTION 3: DANGER ZONE --- */}
        <ContextItem 
          label="Delete Message" 
          icon={<Trash2 size={14} />} 
          onClick={() => onDelete(msg.id)} 
          danger 
          disabled={!isOwner}
        />
      </div>
    </>
  );
};

// Reusable Menu Item Component
const ContextItem = ({ label, icon, onClick, danger, disabled }: any) => (
  <button 
    disabled={disabled}
    onClick={onClick}
    className={`
      w-[92%] mx-auto flex items-center justify-between px-2 py-2 rounded-sm text-[13px] font-medium transition-colors
      ${disabled ? 'opacity-30 cursor-not-allowed' : 
        danger ? 'text-[#f23f42] hover:bg-[#da373c] hover:text-white' : 'text-[#b5bac1] hover:bg-[#4752c4] hover:text-white'}
    `}
  >
    {label}
    {icon}
  </button>
);