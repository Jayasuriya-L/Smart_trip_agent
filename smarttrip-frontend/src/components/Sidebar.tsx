"use client";

import Logo from "./Logo";
import { Plus, MessageSquare, Trash2, X, Compass } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ChatSessionInfo } from "@/types";

interface SidebarProps {
  currentSessionId: string;
  sessions: ChatSessionInfo[];
  onSelectSession: (sessionId: string) => void;
  onDeleteSession: (sessionId: string) => void;
  onNewTrip: () => void;
  isOpen: boolean;
  onClose: () => void;
}

function formatDate(dateStr: string) {
  try {
    return format(parseISO(dateStr), "MMM d, h:mm a");
  } catch {
    return dateStr;
  }
}

export default function Sidebar({
  currentSessionId,
  sessions,
  onSelectSession,
  onDeleteSession,
  onNewTrip,
  isOpen,
  onClose,
}: SidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={`fixed top-0 left-0 h-full w-72 bg-white border-r border-slate-200 z-40
          shadow-lg flex flex-col transition-transform duration-200 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:static lg:shadow-none`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-slate-100">
          <Logo size="md" />
          <button
            onClick={onClose}
            className="lg:hidden text-slate-400 hover:text-slate-700 transition-colors p-1"
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        {/* New Trip Button */}
        <div className="px-4 py-3">
          <button
            onClick={onNewTrip}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg
              bg-slate-900 text-white text-sm font-medium
              hover:bg-slate-800 active:scale-[0.99] transition-all shadow-sm"
          >
            <Plus size={16} />
            <span>New Trip</span>
          </button>
        </div>

        {/* Chat History List */}
        <div className="flex-1 overflow-y-auto px-3 pb-3">
          <div className="flex items-center justify-between px-2 mb-2 mt-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Chat History
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              {sessions.length}
            </span>
          </div>

          <div className="space-y-1">
            {sessions.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-10 text-slate-400">
                <Compass size={24} className="opacity-40" />
                <p className="text-xs font-medium">No previous trips yet</p>
                <p className="text-[11px] text-slate-400 text-center px-4">
                  Start by typing a destination in the chat
                </p>
              </div>
            ) : (
              sessions.map((session) => {
                const isActive = session.session_id === currentSessionId;
                return (
                  <div
                    key={session.session_id}
                    className={`group relative flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left
                      cursor-pointer transition-colors border
                      ${
                        isActive
                          ? "bg-slate-100 border-slate-200 text-slate-900"
                          : "border-transparent hover:bg-slate-50 text-slate-700"
                      }`}
                    onClick={() => onSelectSession(session.session_id)}
                  >
                    <div className="shrink-0 text-slate-400 group-hover:text-slate-600 transition-colors">
                      <MessageSquare size={15} />
                    </div>

                    <div className="flex-1 min-w-0 pr-6">
                      <p
                        className={`text-sm truncate leading-snug ${
                          isActive ? "font-semibold text-slate-900" : "font-normal text-slate-700"
                        }`}
                        title={session.title}
                      >
                        {session.title || "Trip Planning"}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">
                        {formatDate(session.updated_at || session.created_at)}
                      </p>
                    </div>

                    {/* Delete button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteSession(session.session_id);
                      }}
                      title="Delete chat"
                      aria-label="Delete chat"
                      className="absolute right-2 p-1.5 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50
                        opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 px-4 py-3 flex items-center justify-between text-xs text-slate-400">
          <span>SmartTrip Production</span>
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" title="System Ready" />
        </div>
      </aside>
    </>
  );
}
