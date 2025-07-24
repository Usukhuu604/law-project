"use client";

import React, { useState, useRef } from "react";
import { Paperclip, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { getSocket } from "@/lib/socket";

interface ChatInputProps {
  chatRoomId?: string;
  onFileChange?: (file: File) => void;
  isSending?: boolean;
  sender?: {
    id: string;
    username: string;
    imageUrl: string;
  };
  onSend?: (content: string) => void | Promise<void>;
  onTyping?: (typing: boolean) => void;
  disabled?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  chatRoomId,
  onFileChange,
  isSending,
  sender,
  onSend,
  onTyping,
  disabled,
}) => {
  const [msg, setMsg] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMsg(e.target.value);
    if (onTyping) {
      onTyping(true);
    }
  };

  const handleBlur = () => {
    if (onTyping) {
      onTyping(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!msg.trim()) return;

    if (onSend) {
      await onSend(msg.trim());
    } else if (chatRoomId && sender) {
      const socket = getSocket();
      socket.emit("chat-message", {
        chatRoomId,
        sender,
        type: "TEXT",
        content: msg.trim(),
      });
    }
    setMsg("");
    if (onTyping) {
      onTyping(false);
    }
  };

  const handleFileIconClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0] && onFileChange) {
      onFileChange(e.target.files[0]);
    }
    e.target.value = "";
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-2 md:gap-4 p-2 md:p-3"
    >
      <input
        type="file"
        ref={fileInputRef}
        hidden
        onChange={handleFileSelected}
      />
      <button
        type="button"
        onClick={handleFileIconClick}
        title="Attach file"
        className="p-2 text-slate-500 hover:text-blue-600 transition"
      >
        <Paperclip size={22} />
      </button>
      <input
        value={msg}
        onChange={handleInputChange}
        onBlur={handleBlur}
        className="flex-1 rounded-full border border-slate-300 bg-slate-100 px-4 py-2 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Type a message..."
        disabled={isSending || disabled}
      />
      <button
        type="submit"
        disabled={!msg.trim() || isSending || disabled}
        className={cn(
          "p-2.5 rounded-full text-white transition",
          "bg-blue-600 hover:bg-blue-700",
          "disabled:opacity-50 disabled:bg-blue-400"
        )}
      >
        <Send size={20} />
      </button>
    </form>
  );
};
