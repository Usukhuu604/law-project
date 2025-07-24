import React from "react";
import { Scale, BarChart3,  AlertCircle } from "lucide-react";

interface ChatHeaderProps {
  stats: { messageCount: number };
  connectionError: string | null;
  messageCount: number;
  isLoading: boolean;
  onClearChat: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ stats, connectionError, }) => (
  <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-700 rounded-xl flex items-center justify-center">
          <Scale className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-800">LawBridge</h1>
          <p className="text-sm text-gray-500">Legal AI Assistant</p>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        {connectionError && (
          <div className="flex items-center space-x-2 text-red-500 text-sm">
            <AlertCircle className="w-4 h-4" />
            <span>Connection Issue</span>
          </div>
        )}
        {stats.messageCount > 0 && !connectionError && (
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <BarChart3 className="w-4 h-4" />
            <span>{stats.messageCount} messages</span>
          </div>
        )}
       
      </div>
    </div>
  </div>
);

export default ChatHeader; 