"use client";
import { LucideIcon } from "lucide-react";

export const SidebarItem = ({ icon: Icon, label }: { icon: LucideIcon, label: string }) => {
  return (
    <div className="group relative flex items-center mb-4 cursor-pointer">
      {/* Indicator - Now Blue */}
      <div className="absolute left-0 bg-[#3b82f6] rounded-r-full transition-all w-0 group-hover:w-[4px] h-[8px] group-hover:h-[20px]" />
      
      <div className="mx-auto w-12 h-12 flex items-center justify-center transition-all duration-200 rounded-[24px] group-hover:rounded-[16px] bg-[#111111] text-gray-400 group-hover:bg-[#3b82f6] group-hover:text-white"
      >
        <Icon size={22} />
      </div>
    </div>
  );
};