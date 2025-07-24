import React, { useRef, useEffect } from "react";
import ChatMessageBubble from "./ChatMessageBubble";

interface Message {
  id: number;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
  isError?: boolean;
}

interface ChatMessageListProps {
  messages: Message[];
  userId: string;
  userAvatarUrl?: string;
  isLoading?: boolean; // Add isLoading prop
}

const ChatMessageList: React.FC<ChatMessageListProps> = ({
  messages,
  userId,
  userAvatarUrl,
  isLoading = false, // Default to false
}) => {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  if (!messages.length) return null;
  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {messages.map((msg, index) => (
        <ChatMessageBubble
          key={`${msg.sender}-${msg.timestamp.getTime()}-${index}`}
          message={msg}
          isOwnMessage={msg.sender === "user" && userId !== undefined}
          userAvatarUrl={msg.sender === "user" ? userAvatarUrl : undefined}
        />
      ))}
      {isLoading && (
        <div className="flex w-full items-start gap-3 justify-start">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center">
            <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
          </div>
          <div>
            <div className="prose prose-sm max-w-[80vw] sm:max-w-lg rounded-2xl px-4 py-3 shadow-md bg-white text-gray-900 border border-gray-200 rounded-bl-none">
              <span className="inline-block">
                <span className="inline-block w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0s] mr-1"></span>
                <span className="inline-block w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s] mr-1"></span>
                <span className="inline-block w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
              </span>
            </div>
            <div className="text-xs text-gray-400 mt-1 px-1 text-left">
              ...
            </div>
          </div>
        </div>
      )}
      <div ref={endRef} />
    </div>
  );
};

export default ChatMessageList;
