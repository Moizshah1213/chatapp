"use client";

interface StatusIconProps {
  status: string;
  size?: "sm" | "md";
}

export const StatusIcon = ({ status, size = "md" }: StatusIconProps) => {
  const statusColors: Record<string, string> = {
    ONLINE: "bg-[#23a559]",
    IDLE: "bg-[#f0b232]",
    DND: "bg-[#f23f43]",
    OFFLINE: "bg-[#80848e]",
  };

  const sizes = {
    sm: "w-[14px] h-[14px] border-[3px]",
    md: "w-[18px] h-[18px] border-[4px]"
  };

  const currentSize = sizes[size];

  return (
    <div className={`-right-1 rounded-full border-[#232428] flex items-center justify-center overflow-hidden transition-all ${currentSize} ${statusColors[status] || "bg-[#80848e]"}`}>
      
      {/* 1. DND Shape (Minus Sign) */}
      {status === "DND" && (
        <div className="w-[70%] h-[2px] bg-[#232428] rounded-full" />
      )}

      {/* 2. IDLE Shape (Moon Cutout) */}
      {status === "IDLE" && (
        <div className="w-2 h-2 bg-[#121212] rounded-full -translate-x-0.5 -translate-y-0.5"
        style={{ clipPath: 'circle(100% at 20% 20%)' }} />
      )}

      {/* 3. OFFLINE Shape (Hollow Circle) */}
      {status === "OFFLINE" && (
        <div className="w-[45%] h-[45%] bg-[#232428] rounded-full" />
      )}

      {/* ONLINE has no extra shape, just a solid green circle */}
    </div>
  );
};