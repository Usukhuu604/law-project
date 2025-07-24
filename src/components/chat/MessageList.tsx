"use client";

import React, { useRef, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { MessageBubble } from "./MessageBubble";
import { Message } from "@/app/chatroom/types/chat";
import { getSocket } from "@/lib/socket";

interface MessageListProps {
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  currentUserId?: string;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  setMessages,
  currentUserId,
}) => {
  const { user, isLoaded } = useUser();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  useEffect(() => {
    const socket = getSocket();

    socket.on("chat-message", (newMessage: Message) => {
      setMessages((prev) => [...prev, newMessage]);
    });

    return () => {
      socket.off("chat-message");
    };
  }, [setMessages]);

  if (!isLoaded) {
    return (
      <div className="p-4 text-center text-sm text-slate-500">
        Loading messages...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {messages
        .filter((msg) => msg && msg.userId)
        .map((msg, index) => {
          const isOwnMessage = msg.userId === (currentUserId || user?.id);
          return (
            <MessageBubble
              key={`${msg.userId}-${msg.type}-${msg.content}-${index}`}
              message={msg}
              isOwnMessage={isOwnMessage}
            />
          );
        })}
      <div ref={scrollRef} />
    </div>
  );
};
