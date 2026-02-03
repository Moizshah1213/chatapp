// components/navigation/Header.tsx
"use client";

import { Hash, Users, AtSign } from "lucide-react";

interface HeaderProps {
  type: "friends" | "conversation" | "server";
  name: string;
  imageUrl?: string;
}

export const Header = ({ type, name, imageUrl }: HeaderProps) => {
  return (
 <div className="flex items-center justify-center w-full px-4 h-8 border-b border-white/5 bg-[#313338]/50 backdrop-blur-md relative">
      
      {/* Wrapper div jo content ko center rakhegi */}
      <div className="flex items-center gap-x-2">
        {/* 1. Icons */}
        {type === "friends" && (
        <svg aria-hidden="true" role="img" xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="#c4c4c4b3" viewBox="0 0 24 24">
        <path fill="var(--interactive-icon-default)" d="M13 10a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"></path>
        <path fill="var(--interactive-icon-default)" d="M3 5v-.75C3 3.56 3.56 3 4.25 3s1.24.56 1.33 1.25C6.12 8.65 9.46 12 13 12h1a8 8 0 0 1 8 8 2 2 0 0 1-2 2 .21.21 0 0 1-.2-.15 7.65 7.65 0 0 0-1.32-2.3c-.15-.2-.42-.06-.39.17l.25 2c.02.15-.1.28-.25.28H9a2 2 0 0 1-2-2v-2.22c0-1.57-.67-3.05-1.53-4.37A15.85 15.85 0 0 1 3 5Z">
          </path>
          </svg>
        )}
        {type === "conversation" && (
          <AtSign className="w-5 h-5 text-[#80848e]" />
        )}
        {type === "server" && imageUrl && (
          <div className="relative w-4 h-4 mr-1">
             <img src={imageUrl} className="rounded-md object-cover w-full h-full" alt="pfp" />
          </div>
        )}

        {/* 2. Name */}
        <h3 className="font-normal text-white/800 item-center text-[12px] tracking-normal relative top-[1px]">
          {name}
        </h3>
      </div>

      {/* Right side actions - isko 'absolute' rakha hai taake center alignment kharab na ho */}
      <div className="absolute right-4 flex items-center">
        {/* Future Search/Inbox icons yahan ayenge */}
      </div>
    </div>
  );
};