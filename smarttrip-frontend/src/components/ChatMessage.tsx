"use client";

import { ChatMessage as ChatMessageType } from "@/types";
import ItineraryCard from "./ItineraryCard";
import { Bot, User } from "lucide-react";

interface Props {
  message: ChatMessageType;
  onRegenerate?: () => void;
  onCheaper?: () => void;
  onChangeDestination?: () => void;
}

/** Minimal markdown → HTML renderer (bold, italic, lists, blockquotes) */
function renderMarkdown(text: string) {
  return text
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`(.+?)`/g, "<code>$1</code>")
    .replace(/^>\s(.+)$/gm, "<blockquote>$1</blockquote>")
    .replace(/^- (.+)$/gm, "<li>$1</li>")
    .replace(/(<li>[\s\S]*<\/li>)/, "<ul>$1</ul>")
    .replace(/\n\n/g, "</p><p>")
    .replace(/^\s*<p>/, "<p>")
    .concat("</p>")
    .replace(/^(?!<)/, "<p>");
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1.5 py-2 px-1">
      <div className="dot" />
      <div className="dot" />
      <div className="dot" />
    </div>
  );
}

function cleanChatMessageContent(content: string): string {
  if (!content) return "";
  const jsonIndex = content.indexOf('{');
  if (jsonIndex !== -1) {
    const textBefore = content.substring(0, jsonIndex).trim();
    return textBefore || "Here is your requested trip itinerary!";
  }
  return content;
}

export default function ChatMessage({
  message,
  onRegenerate,
  onCheaper,
  onChangeDestination,
}: Props) {
  const isUser = message.role === "user";
  const displayContent = cleanChatMessageContent(message.content);

  if (isUser) {
    return (
      <div className="flex justify-end animate-fade-in">
        <div className="flex items-end gap-2 max-w-[80%] sm:max-w-[70%]">
          <div className="bg-gradient-to-br from-brand-500 to-brand-600 text-white rounded-2xl rounded-br-sm px-4 py-3 shadow-card">
            <p className="text-sm leading-relaxed">{message.content}</p>
          </div>
          <div className="w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center shrink-0">
            <User size={14} className="text-brand-600" />
          </div>
        </div>
      </div>
    );
  }

  // AI message
  return (
    <div className="flex justify-start animate-fade-in">
      <div className="flex items-start gap-2 w-full max-w-3xl">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-teal-500 flex items-center justify-center shrink-0 shadow-sm">
          <Bot size={15} className="text-white" />
        </div>
        <div className="flex flex-col gap-3 flex-1 min-w-0">
          {/* text bubble */}
          {(message.isLoading || displayContent) && (
            <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-card">
              {message.isLoading ? (
                <TypingDots />
              ) : (
                <div
                  className="prose-chat text-sm text-slate-700"
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(displayContent) }}
                />
              )}
            </div>
          )}

          {/* itinerary */}
          {message.itinerary && !message.isLoading && (
            <ItineraryCard
              itinerary={message.itinerary}
              onRegenerate={onRegenerate}
              onCheaper={onCheaper}
              onChangeDestination={onChangeDestination}
            />
          )}

          {/* timestamp */}
          <p className="text-xs text-slate-400 px-1">
            {message.timestamp.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
      </div>
    </div>
  );
}
