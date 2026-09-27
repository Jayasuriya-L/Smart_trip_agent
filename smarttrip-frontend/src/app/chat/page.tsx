"use client";

import { useRef, useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useChat } from "@/hooks/useChat";
import ChatMessage from "@/components/ChatMessage";
import ChatInput from "@/components/ChatInput";
import Sidebar from "@/components/Sidebar";
import { ToastContainer, useToast } from "@/components/Toast";
import { Trip } from "@/types";
import { Menu, Bot, AlertTriangle } from "lucide-react";

const EXAMPLE_PROMPTS = [
  { emoji: "🏔️", text: "Plan a 3-day trip to Ooty",       sub: "for 2 people, ₹10,000 budget" },
  { emoji: "🏖️", text: "Plan a budget trip to Goa",        sub: "5 days, backpacker style" },
  { emoji: "🌿", text: "Find a weekend getaway",            sub: "from Bangalore, nature & hills" },
  { emoji: "🏰", text: "Heritage tour — Rajasthan",         sub: "7 days, family of 4" },
];

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function ChatPageInner() {
  const searchParams = useSearchParams();
  const [sessionId]    = useState(() => uid());
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const { toasts, addToast, dismiss } = useToast();

  const { messages, isLoading, error, sendMessage, clearMessages } = useChat(sessionId);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Pre-fill from landing page destination link
  useEffect(() => {
    const q = searchParams.get("q");
    if (q) sendMessage(q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Show error toast
  useEffect(() => {
    if (error) addToast(error, "error");
  }, [error]);

  const handleNewTrip = () => {
    clearMessages();
    setSidebarOpen(false);
    addToast("Started a new trip! 🗺️", "success");
  };

  const handleSelectTrip = (trip: Trip) => {
    setSidebarOpen(false);
    addToast(`Loaded: ${trip.title}`, "info");
  };

  const handleRegenerate = () => {
    sendMessage("Please regenerate the itinerary with different options.");
  };

  const handleCheaper = () => {
    sendMessage("Can you make the itinerary cheaper? Find more budget-friendly alternatives.");
  };

  const handleChangeDestination = () => {
    sendMessage("I'd like to change the destination. Can you suggest some alternatives?");
  };

  const hasOnlyWelcome = messages.length === 1;

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        currentSessionId={sessionId}
        onNewTrip={handleNewTrip}
        onSelectTrip={handleSelectTrip}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main chat area */}
      <div className="flex flex-col flex-1 min-w-0 h-full">

        {/* Top bar */}
        <header className="flex items-center gap-3 px-4 sm:px-6 py-3 bg-white border-b border-slate-200 shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-slate-500 hover:text-slate-700 transition-colors p-1"
            aria-label="Open sidebar"
          >
            <Menu size={22} />
          </button>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-teal-500
              flex items-center justify-center shadow-sm">
              <Bot size={15} className="text-white" />
            </div>
            <div>
              <p className="font-semibold text-sm text-slate-800 leading-none">SmartTrip AI</p>
              <p className="text-xs text-teal-500 leading-none mt-0.5">● Online</p>
            </div>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs text-slate-400 hidden sm:block">
              {process.env.NEXT_PUBLIC_API_URL ?? "Demo mode — using mock data"}
            </span>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

          {/* Welcome prompt cards */}
          {hasOnlyWelcome && (
            <div className="max-w-2xl mx-auto mt-4">
              <div className="grid sm:grid-cols-2 gap-3">
                {EXAMPLE_PROMPTS.map((p) => (
                  <button
                    key={p.text}
                    onClick={() => sendMessage(p.text)}
                    disabled={isLoading}
                    className="flex items-start gap-3 bg-white border border-slate-200 rounded-xl p-4
                      text-left hover:border-brand-300 hover:bg-brand-50 hover:shadow-card
                      transition-all duration-200 group disabled:opacity-50"
                  >
                    <span className="text-2xl">{p.emoji}</span>
                    <div>
                      <p className="font-medium text-sm text-slate-800 group-hover:text-brand-700">
                        {p.text}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">{p.sub}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Chat messages */}
          {messages.map((msg) => (
            <div key={msg.id} className="max-w-3xl mx-auto w-full">
              <ChatMessage
                message={msg}
                onRegenerate={handleRegenerate}
                onCheaper={handleCheaper}
                onChangeDestination={handleChangeDestination}
              />
            </div>
          ))}

          {/* Error banner */}
          {error && (
            <div className="max-w-3xl mx-auto w-full flex items-center gap-3 bg-red-50
              border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
              <AlertTriangle size={16} className="shrink-0" />
              <span>{error}</span>
              <span className="ml-auto text-xs text-red-400">Using mock data as fallback</span>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="border-t border-slate-200 bg-white px-4 sm:px-6 lg:px-8 py-4 shrink-0">
          <div className="max-w-3xl mx-auto">
            <ChatInput onSend={sendMessage} isLoading={isLoading} />
          </div>
        </div>
      </div>

      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense>
      <ChatPageInner />
    </Suspense>
  );
}
