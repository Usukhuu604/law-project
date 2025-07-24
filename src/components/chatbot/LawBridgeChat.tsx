"use client";
import useLawBridgeChat from "./useLawBridgeChat";
import ChatHeader from "./ChatHeader";
import ChatMessageList from "./ChatMessageList";
import ChatInput from "./ChatInput";
import WelcomeScreen from "./WelcomeScreen";

export default function LawBridgeChat() {
  const {
    user, isLoaded, loading, connectionError, stats, messages, showWelcome,
    inputMessage, setInputMessage, isLoading, clearChat, sendMessage, handleKeyPress, inputRef
  } = useLawBridgeChat();

  if (!isLoaded || loading) return <div className="flex h-screen w-full items-center justify-center">Loading...</div>;
  if (!user) return <div className="flex h-screen items-center justify-center">Please sign in to use LawBridge AI assistant.</div>;

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-14">
      <ChatHeader stats={stats} connectionError={connectionError} messageCount={messages.length} isLoading={isLoading} onClearChat={clearChat} />
      <div className="flex-1 flex flex-col overflow-hidden">
        {showWelcome && messages.length === 0 ? <WelcomeScreen /> : <ChatMessageList messages={messages} userId={user.id} isLoading={isLoading} />}
      </div>
      <ChatInput inputMessage={inputMessage} setInputMessage={setInputMessage} isLoading={isLoading} onSend={sendMessage} onKeyPress={handleKeyPress} inputRef={inputRef} />
    </div>
  );
}
