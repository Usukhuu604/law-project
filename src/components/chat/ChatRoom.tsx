import React, { useState } from "react";
import { ChatHeader } from "./ChatHeader";
import { MessageList } from "./MessageList";
import { ChatInput } from "./ChatInput";
import TypingIndicator from "./TypingIndicator";
import { VideoCallModal } from "@/components/chat/VideoCallModal";
import { LiveKitRoom } from "@livekit/components-react";
import useChatRoomState from "@/app/chatroom/hooks/useChatRoomState";

interface ChatRoomProps {
  chatRoomId: string;
}

const ChatRoom: React.FC<ChatRoomProps> = ({ chatRoomId }) => {
  const chatRoomState = useChatRoomState(chatRoomId);
  const {
    messages,
    setMessages,
    user,
    otherUser,
    typingUsers,
    isSending,
    isConnected,
    handleSendMessage,
    handleSendFile,
    handleTyping,
    messagesEndRef,
    handleJoinCall,
    handleLeaveCall,
    activeCallType,
    liveKitToken,
  } = chatRoomState;
  const [showUserInfo, setShowUserInfo] = useState(false);

  const handleCallAction = (type: "video" | "audio") => {
    if (activeCallType) {
      handleLeaveCall();
    } else {
      handleJoinCall(type);
    }
  };

  React.useEffect(() => {
    console.log("LiveKit Token (effect):", liveKitToken);
  }, [liveKitToken]);

  return (
    <>
      <main className="w-full h-full flex flex-col bg-white dark:bg-gray-900 overflow-hidden relative">
        <ChatHeader
          user={otherUser}
          onVideoCall={() => handleCallAction("video")}
          onAudioCall={() => handleCallAction("audio")}
          isCallActive={!!activeCallType}
          onEndCall={handleLeaveCall}
        />
        <div className="flex-1 overflow-y-auto px-4 py-4 bg-gray-50 dark:bg-gray-900 relative">
          <MessageList
            messages={messages}
            setMessages={setMessages}
            currentUserId={user?.id}
          />
          <TypingIndicator typingUsers={typingUsers} />
          <div ref={messagesEndRef} />
        </div>
        <div className="flex-shrink-0 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-4 z-10">
          <ChatInput
            onSend={handleSendMessage}
            onFileChange={handleSendFile}
            onTyping={handleTyping}
            isSending={isSending}
            disabled={!isConnected}
          />
        </div>
        {showUserInfo && (
          <div className="absolute right-0 top-0 bottom-0 w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 shadow-lg z-30 transform transition-transform duration-300">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Хэрэглэгчийн мэдээлэл
                </h3>
                <button className="p-2" onClick={() => setShowUserInfo(false)}>
                  ×
                </button>
              </div>
              <div className="text-center">
                {/* Avatar and user info here */}
              </div>
            </div>
            <div className="p-4 space-y-2">
              <button
                className="w-full justify-start"
                onClick={() => handleCallAction("audio")}
              >
                Дуудлага хийх
              </button>
              <button
                className="w-full justify-start"
                onClick={() => handleCallAction("video")}
              >
                Видео дуудлага
              </button>
            </div>
          </div>
        )}
      </main>
      {activeCallType && liveKitToken && (
        <LiveKitRoom
          token={liveKitToken}
          serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_SERVER_URL}
          connect
        >
          <VideoCallModal
            onEndCall={handleLeaveCall}
            callType={activeCallType}
            user={otherUser}
          />
        </LiveKitRoom>
      )}
      {showUserInfo && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-20 md:hidden"
          onClick={() => setShowUserInfo(false)}
        />
      )}
    </>
  );
};

export default ChatRoom;
