"use client";
import { Upload, Plus, FileText, BarChart2 } from "lucide-react";

export const PlusMenu = ({ onUpload }: { onUpload: (file: File) => void }) => {
  return (
    <div className="absolute bottom-20 left-4 w-56 bg-[#111214] rounded-lg shadow-2xl border border-white/10 p-2 z-[100] animate-in fade-in slide-in-from-bottom-2">
      <label className="flex items-center gap-3 p-2.5 hover:bg-[#4752c4] rounded-md cursor-pointer group transition-colors">
        <div className="bg-[#2b2d31] p-1.5 rounded-full group-hover:bg-transparent">
          <Upload size={18} className="text-[#b5bac1] group-hover:text-white" />
        </div>
        <span className="text-[14px] font-medium text-[#dbdee1] group-hover:text-white">Upload a File</span>
        <input type="file" className="hidden" onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0])} />
      </label>

      <button className="w-full flex items-center gap-3 p-2.5 hover:bg-[#4752c4] rounded-md cursor-pointer group transition-colors">
        <div className="bg-[#2b2d31] p-1.5 rounded-full group-hover:bg-transparent">
          <Plus size={18} className="text-[#b5bac1] group-hover:text-white" />
        </div>
        <span className="text-[14px] font-medium text-[#dbdee1] group-hover:text-white">Create Thread</span>
      </button>

      <button className="w-full flex items-center gap-3 p-2.5 hover:bg-[#4752c4] rounded-md cursor-pointer group transition-colors border-t border-white/5 mt-1">
        <div className="bg-[#2b2d31] p-1.5 rounded-full group-hover:bg-transparent">
          <BarChart2 size={18} className="text-[#b5bac1] group-hover:text-white" />
        </div>
        <span className="text-[14px] font-medium text-[#dbdee1] group-hover:text-white">Create Poll</span>
      </button>
    </div>
  );
};