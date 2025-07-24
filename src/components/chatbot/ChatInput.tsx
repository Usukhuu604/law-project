import React, { RefObject } from "react";
import { Send } from "lucide-react";

interface ChatInputProps {
  inputMessage: string;
  setInputMessage: (msg: string) => void;
  isLoading: boolean;
  onSend: () => void;
  onKeyPress: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  inputRef: RefObject<HTMLTextAreaElement>;
}

const ChatInput: React.FC<ChatInputProps> = ({ inputMessage, setInputMessage, isLoading, onSend, onKeyPress, inputRef }) => (
  <div className="bg-white border-t border-gray-200 px-6 py-4">
    <div className="flex items-center space-x-4">
      <textarea
        ref={inputRef}
        value={inputMessage}
        onChange={(e) => setInputMessage(e.target.value)}
        onKeyDown={onKeyPress}
        placeholder="Type your legal question here..."
        rows={1}
        className="flex-1 resize-none border border-gray-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        disabled={isLoading}
      />
      <button
        onClick={onSend}
        disabled={isLoading || !inputMessage.trim()}
        className="bg-gradient-to-r from-blue-600 to-purple-700 hover:from-blue-700 hover:to-purple-800 text-white px-4 py-2 rounded-xl flex items-center space-x-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Send className="w-4 h-4" />
        <span>Send</span>
      </button>
    </div>
  </div>
);

export default ChatInput; 