"use client";

import React from "react";
import { Video, PhoneCall, Shield, PhoneOff } from "lucide-react";
import { User } from "@/app/chatroom/types/chat";

interface ChatHeaderProps {
  user: User;
  onVideoCall: () => void;
  onAudioCall: () => void;
  isCallActive: boolean;
  onEndCall: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  user,
  onVideoCall,
  onAudioCall,
  isCallActive,
  onEndCall,
}) => {
  // Improved: fallback for missing avatar, show initials, and more distinct header
  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-100 border-b border-slate-200 px-4 sm:px-6 py-3 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 sm:space-x-4">
          <div className="relative flex-shrink-0">
           
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-white font-bold border-2 border-blue-200 shadow">
                {user.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2)}
              </div>
            
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base md:text-lg font-semibold text-slate-800 truncate">
                {user.name}
              </h2>
              {user.isLawyer && (
                <div className="hidden sm:flex items-center space-x-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                  <Shield className="w-3 h-3" />
                  <span>Verified</span>
                </div>
              )}
            </div>
            <p className="text-xs sm:text-sm text-slate-500">
              {isCallActive ? "In call..." : "Online"}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2 sm:space-x-3">
          {isCallActive ? (
            <button
              onClick={onEndCall}
              className="p-2 md:p-3 rounded-full bg-red-600 hover:bg-red-700 text-white"
              title="End call"
            >
              <PhoneOff className="w-5 h-5" />
            </button>
          ) : (
            <>
              <button
                onClick={onAudioCall}
                className="p-2 md:p-3 rounded-full bg-slate-100 hover:bg-slate-200"
                title="Start audio call"
              >
                <PhoneCall className="w-5 h-5 text-slate-600" />
              </button>
              <button
                onClick={onVideoCall}
                className="p-2 md:p-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white"
                title="Start video call"
              >
                <Video className="w-5 h-5" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
