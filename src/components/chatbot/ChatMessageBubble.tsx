import React from "react";
import { User, Bot } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/cjs/styles/prism";

interface Message {
  id: number;
  text: string | { answer: string };
  sender: "user" | "bot";
  timestamp: Date;
  isError?: boolean;
}

interface ChatMessageBubbleProps {
  message: Message;
  isOwnMessage: boolean;
  userAvatarUrl?: string;
}

const ChatMessageBubble: React.FC<ChatMessageBubbleProps> = ({
  message,
  isOwnMessage,
  userAvatarUrl,
}) => (
  <div
    className={`flex w-full items-start gap-3 ${
      isOwnMessage ? "justify-end" : "justify-start"
    }`}
  >
    {!isOwnMessage && (
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center">
        <Bot className="w-4 h-4 text-white" />
      </div>
    )}
    <div>
      <div
        className={`prose prose-sm max-w-[80vw] sm:max-w-lg rounded-2xl px-4 py-3 shadow-md transition-all duration-200 ${
          isOwnMessage
            ? "bg-gradient-to-r from-blue-600 via-blue-500 to-purple-700 text-white rounded-br-none border border-white/20 shadow-lg hover:shadow-2xl"
            : "bg-white text-gray-900 border border-gray-200 rounded-bl-none"
        }`}
      >
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            code: ({
              inline,
              className,
              children,
              ...props
            }: React.HTMLAttributes<HTMLElement> & { inline?: boolean }) => {
              const match = /language-(\w+)/.exec(className || "");
              let codeString = "";
              if (Array.isArray(children)) {
                codeString = (children as (string | undefined)[]).filter((c): c is string => typeof c === "string").join("");
              } else if (typeof children === "string") {
                codeString = children;
              } else {
                // Defensive: if children is not string/array, render a warning
                return <code className={className} {...props}>[Invalid code block]</code>;
              }
              codeString = codeString.replace(/\n$/, "");
              return !inline ? (
                <SyntaxHighlighter
                  style={vscDarkPlus}
                  language={match?.[1] || "javascript"}
                  PreTag="div"
                  className="rounded-md"
                  {...props}
                >
                  {codeString}
                </SyntaxHighlighter>
              ) : (
                <code className={className} {...props}>
                  {codeString}
                </code>
              );
            },
          }}
        >
          {typeof message.text === "string"
            ? message.text
            : typeof message.text === "object" &&
              message.text !== null &&
              "answer" in message.text
            ? String((message.text as { answer: string }).answer)
            : JSON.stringify(message.text)}
        </ReactMarkdown>
      </div>
      <div
        className={`text-xs text-gray-400 mt-1 px-1 ${
          isOwnMessage ? "text-right" : "text-left"
        }`}
      >
        {message.timestamp.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </div>
    </div>
    {isOwnMessage &&
      (userAvatarUrl ? (
        <img
          src={userAvatarUrl}
          alt="User avatar"
          className="w-8 h-8 rounded-full object-cover bg-gray-300"
        />
      ) : (
        <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
          <User className="w-4 h-4 text-gray-600" />
        </div>
      ))}
  </div>
);

export default ChatMessageBubble;
