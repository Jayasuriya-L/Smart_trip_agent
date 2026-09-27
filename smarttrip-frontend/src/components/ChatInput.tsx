"use client";

import { useRef, useEffect, useState, KeyboardEvent } from "react";
import { Send } from "lucide-react";

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
  placeholder?: string;
}

const SUGGESTIONS = [
  "Plan a 3-day trip to Ooty for ₹10,000",
  "Budget beach trip to Goa for 2 people",
  "Weekend getaway from Bangalore under ₹5,000",
  "Family trip to Rajasthan — 7 days",
];

export default function ChatInput({
  onSend,
  isLoading,
  placeholder = "Tell me where you want to travel...",
}: ChatInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(ta.scrollHeight, 160)}px`;
  }, [value]);

  const submit = () => {
    const msg = value.trim();
    if (!msg || isLoading) return;
    onSend(msg);
    setValue("");
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div className="space-y-2">
      {/* Quick suggestion chips (only when empty) */}
      {!value && (
        <div className="flex flex-wrap gap-2 px-1">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => setValue(s)}
              disabled={isLoading}
              className="text-xs px-3 py-1.5 bg-white border border-slate-200 rounded-full
                text-slate-600 hover:border-brand-400 hover:text-brand-600 hover:bg-brand-50
                transition-all duration-150 disabled:opacity-50"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input row */}
      <div className="flex items-end gap-2 bg-white border border-slate-200 rounded-2xl px-4 py-3
        shadow-card focus-within:border-brand-400 focus-within:ring-2 focus-within:ring-brand-100
        transition-all duration-200">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
          rows={1}
          placeholder={placeholder}
          disabled={isLoading}
          className="flex-1 resize-none bg-transparent outline-none text-sm text-slate-800
            placeholder:text-slate-400 leading-relaxed min-h-[24px] max-h-40 disabled:opacity-60"
        />
        <button
          onClick={submit}
          disabled={!value.trim() || isLoading}
          className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 text-white
            flex items-center justify-center shrink-0
            disabled:opacity-40 disabled:cursor-not-allowed
            hover:from-brand-600 hover:to-brand-700 active:scale-95
            transition-all duration-150 shadow-sm"
          aria-label="Send message"
        >
          <Send size={15} strokeWidth={2.5} />
        </button>
      </div>

      <p className="text-xs text-slate-400 px-1">
        Press <kbd className="px-1 py-0.5 rounded bg-slate-100 text-slate-500 font-mono text-[10px]">Enter</kbd> to send · Shift+Enter for new line
      </p>
    </div>
  );
}
