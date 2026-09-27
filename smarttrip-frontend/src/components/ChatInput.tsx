"use client";

import { useRef, useEffect, useState, KeyboardEvent } from "react";
import { ArrowUp } from "lucide-react";

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
  placeholder = "Ask anything about your trip or specify a destination...",
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
        <div className="flex flex-wrap gap-1.5 px-1">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setValue(s)}
              disabled={isLoading}
              className="text-xs px-3 py-1 bg-white border border-slate-200 rounded-full
                text-slate-600 hover:border-slate-300 hover:bg-slate-50
                transition-all disabled:opacity-50"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input container */}
      <div className="flex items-end gap-2 bg-white border border-slate-200/90 rounded-2xl px-4 py-3
        shadow-sm focus-within:border-slate-400 focus-within:ring-2 focus-within:ring-slate-100
        transition-all">
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
          type="button"
          onClick={submit}
          disabled={!value.trim() || isLoading}
          className="w-8 h-8 rounded-lg bg-slate-900 text-white
            flex items-center justify-center shrink-0
            disabled:opacity-30 disabled:cursor-not-allowed
            hover:bg-slate-800 active:scale-95
            transition-all shadow-xs"
          aria-label="Send message"
        >
          <ArrowUp size={16} strokeWidth={2.5} />
        </button>
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
        <span>
          Press <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-600 font-mono text-[10px]">Enter</kbd> to send
        </span>
        <span className="text-[10px] text-slate-400">Shift + Enter for new line</span>
      </div>
    </div>
  );
}
