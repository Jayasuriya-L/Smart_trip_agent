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

/** Clean markdown → HTML renderer (bold, italic, lists, code, paragraphs) */
function renderMarkdown(text: string) {
  return text
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`(.+?)`/g, "<code class='bg-slate-100 px-1 py-0.5 rounded text-xs'>$1</code>")
    .replace(/^>\s(.+)$/gm, "<blockquote class='border-l-2 border-slate-300 pl-3 my-1 text-slate-500 italic'>$1</blockquote>")
    .replace(/^- (.+)$/gm, "<li class='ml-4 list-disc'>$1</li>")
    .replace(/\n\n/g, "</p><p class='mt-2'>")
    .replace(/^\s*<p>/, "<p>")
    .concat("</p>");
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1.5 py-2 px-1">
      <div className="w-2 h-2 rounded-full bg-slate-400 animate-pulse" />
      <div className="w-2 h-2 rounded-full bg-slate-400 animate-pulse delay-150" />
      <div className="w-2 h-2 rounded-full bg-slate-400 animate-pulse delay-300" />
    </div>
  );
}

function cleanChatMessageContent(content: string): string {
  if (!content) return "";
  const jsonIndex = content.indexOf('{');
  if (jsonIndex !== -1 && content.includes('"assistant_message"')) {
    const textBefore = content.substring(0, jsonIndex).trim();
    return textBefore || "Here is your requested trip itinerary:";
  }
  // Strip any internal data comments if present
  let clean = content.split("<!--ITINERARY_DATA:")[0];
  clean = clean.split("[Previous Itinerary Summary:")[0];
  return clean.trim();
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
      <div className="flex justify-end animate-fade-in my-1">
        <div className="flex items-end gap-2 max-w-[85%] sm:max-w-[75%]">
          <div className="bg-slate-900 text-white rounded-2xl rounded-br-sm px-4 py-3 shadow-xs">
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
          </div>
          <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
            <User size={13} className="text-slate-600" />
          </div>
        </div>
      </div>
    );
  }

  // AI message
  return (
    <div className="flex justify-start animate-fade-in my-1">
      <div className="flex items-start gap-2.5 w-full max-w-3xl">
        <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-xs">
          <Bot size={15} className="text-slate-700" />
        </div>
        <div className="flex flex-col gap-3 flex-1 min-w-0">
          {/* text bubble */}
          {(message.isLoading || displayContent) && (
            <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-xs">
              {message.isLoading ? (
                <TypingDots />
              ) : (
                <div
                  className="prose prose-sm text-sm text-slate-700 leading-relaxed"
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
        </div>
      </div>
    </div>
  );
}
