"use client";

import { useRef, useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useChat } from "@/hooks/useChat";
import ChatMessage from "@/components/ChatMessage";
import ChatInput from "@/components/ChatInput";
import Sidebar from "@/components/Sidebar";
import { ToastContainer, useToast } from "@/components/Toast";
import { ChatSessionInfo } from "@/types";
import { chatApi } from "@/lib/api";
import { Menu, Compass, AlertTriangle } from "lucide-react";

const EXAMPLE_PROMPTS = [
  { text: "Plan a 3-day trip to Ooty", sub: "For 2 people, ₹10,000 budget" },
  { text: "Plan a budget trip to Goa", sub: "3 days, beach and seafood" },
  { text: "Weekend getaway to Coorg", sub: "Nature, coffee plantations" },
  { text: "Heritage tour in Rajasthan", sub: "7 days, cultural sights" },
];

function uid() {
  return "session-" + Math.random().toString(36).slice(2, 9) + Date.now().toString(36);
}

function ChatPageInner() {
  const searchParams = useSearchParams();
  const [sessionId, setSessionId] = useState<string>(() => uid());
  const [sessions, setSessions] = useState<ChatSessionInfo[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const { toasts, addToast, dismiss } = useToast();

  const refreshSessions = useCallback(async () => {
    try {
      const list = await chatApi.listSessions();
      if (Array.isArray(list)) {
        setSessions(list);
      }
    } catch {
      // Ignore background session list errors gracefully
    }
  }, []);

  const { messages, isLoading, error, sendMessage, clearMessages, loadSession } = useChat(
    sessionId,
    refreshSessions
  );

  // Initial sessions load
  useEffect(() => {
    refreshSessions();
  }, [refreshSessions]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Pre-fill from landing page destination link if provided
  useEffect(() => {
    const q = searchParams.get("q");
    if (q) {
      sendMessage(q);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Show error toast
  useEffect(() => {
    if (error) {
      addToast(error, "error");
    }
  }, [error, addToast]);

  const handleNewTrip = useCallback(() => {
    const newId = uid();
    setSessionId(newId);
    clearMessages();
    setSidebarOpen(false);
    addToast("Started a new trip session", "info");
  }, [clearMessages, addToast]);

  const handleSelectSession = useCallback(
    async (sid: string) => {
      if (sid === sessionId) {
        setSidebarOpen(false);
        return;
      }
      setSessionId(sid);
      await loadSession(sid);
      setSidebarOpen(false);
    },
    [sessionId, loadSession]
  );

  const handleDeleteSession = useCallback(
    async (sid: string) => {
      try {
        await chatApi.deleteSession(sid);
        setSessions((prev) => prev.filter((s) => s.session_id !== sid));
        addToast("Chat deleted", "info");

        // If currently open session was deleted, start fresh
        if (sid === sessionId) {
          handleNewTrip();
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to delete chat";
        addToast(msg, "error");
      }
    },
    [sessionId, handleNewTrip, addToast]
  );

  const handleRegenerate = () => {
    sendMessage("Please regenerate the itinerary with alternative recommendations.");
  };

  const handleCheaper = () => {
    sendMessage("Can you make this itinerary cheaper? Look for budget stays and lower-cost options.");
  };

  const handleChangeDestination = () => {
    sendMessage("I would like to change the destination. Can you suggest some alternatives?");
  };

  const hasOnlyWelcome = messages.length === 1;

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden text-slate-800">
      {/* Real-time Session Sidebar */}
      <Sidebar
        currentSessionId={sessionId}
        sessions={sessions}
        onSelectSession={handleSelectSession}
        onDeleteSession={handleDeleteSession}
        onNewTrip={handleNewTrip}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main chat viewport */}
      <div className="flex flex-col flex-1 min-w-0 h-full">
        {/* Top Header */}
        <header className="flex items-center justify-between px-4 sm:px-6 py-3 bg-white border-b border-slate-200/90 shrink-0">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-slate-500 hover:text-slate-800 transition-colors p-1"
              aria-label="Open chat history"
            >
              <Menu size={20} />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center shadow-xs">
                <Compass size={15} />
              </div>
              <div>
                <p className="font-semibold text-sm text-slate-900 leading-tight">SmartTrip AI</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                  <span className="text-[11px] text-slate-500 font-medium">Production Active</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleNewTrip}
              className="text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
            >
              + New Trip
            </button>
          </div>
        </header>

        {/* Message scroll container */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
          {/* Welcome suggestions */}
          {hasOnlyWelcome && (
            <div className="max-w-2xl mx-auto mt-6 mb-4 animate-fade-in">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 px-1">
                Suggested ideas to get started:
              </p>
              <div className="grid sm:grid-cols-2 gap-2.5">
                {EXAMPLE_PROMPTS.map((p) => (
                  <button
                    key={p.text}
                    type="button"
                    onClick={() => sendMessage(p.text)}
                    disabled={isLoading}
                    className="flex flex-col gap-1 bg-white border border-slate-200/90 rounded-xl p-3.5
                      text-left hover:border-slate-400 hover:bg-slate-50/80 shadow-2xs
                      transition-all disabled:opacity-50"
                  >
                    <p className="font-medium text-sm text-slate-800">{p.text}</p>
                    <p className="text-xs text-slate-400">{p.sub}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Chat history messages */}
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

          {/* Error Banner */}
          {error && (
            <div className="max-w-3xl mx-auto w-full flex items-center gap-3 bg-red-50
              border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
              <AlertTriangle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input area */}
        <div className="border-t border-slate-200/90 bg-white px-4 sm:px-6 lg:px-8 py-4 shrink-0">
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
