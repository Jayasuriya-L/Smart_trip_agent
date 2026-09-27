"use client";

import { Trip } from "@/types";
import Logo from "./Logo";
import {
  Plus, MapPin, ChevronRight, Settings, User,
  Compass, X
} from "lucide-react";
import { MOCK_TRIPS } from "@/lib/mockData";
import { format, parseISO } from "date-fns";

interface SidebarProps {
  currentSessionId: string;
  onNewTrip: () => void;
  onSelectTrip?: (trip: Trip) => void;
  isOpen: boolean;
  onClose: () => void;
}

function formatDate(dateStr: string) {
  try { return format(parseISO(dateStr), "MMM d, yyyy"); }
  catch { return dateStr; }
}

export default function Sidebar({
  currentSessionId,
  onNewTrip,
  onSelectTrip,
  isOpen,
  onClose,
}: SidebarProps) {
  const trips = MOCK_TRIPS;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30 lg:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={`fixed top-0 left-0 h-full w-72 bg-white border-r border-slate-200 z-40
          shadow-xl flex flex-col transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:static lg:shadow-none`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-5 pb-4 border-b border-slate-100">
          <Logo size="md" />
          <button
            onClick={onClose}
            className="lg:hidden text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* New Trip */}
        <div className="px-3 py-3">
          <button
            onClick={onNewTrip}
            className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl
              bg-gradient-to-r from-brand-500 to-teal-500 text-white text-sm font-medium
              hover:from-brand-600 hover:to-teal-600 active:scale-[0.98] transition-all duration-150 shadow-sm"
          >
            <Plus size={16} />
            New Trip
          </button>
        </div>

        {/* Previous trips */}
        <div className="flex-1 overflow-y-auto px-3 pb-3">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-2 mb-2 mt-1">
            Previous Trips
          </p>
          <div className="space-y-1">
            {trips.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-8 text-slate-400">
                <Compass size={28} className="opacity-50" />
                <p className="text-xs">No trips yet. Start planning!</p>
              </div>
            ) : (
              trips.map((trip) => (
                <button
                  key={trip.id}
                  onClick={() => onSelectTrip?.(trip)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left
                    hover:bg-brand-50 transition-colors group
                    ${trip.session_id === currentSessionId ? "bg-brand-50" : ""}`}
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-100 to-teal-100 flex items-center justify-center shrink-0">
                    <MapPin size={14} className="text-brand-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700 truncate">{trip.title}</p>
                    <p className="text-xs text-slate-400 truncate">
                      {formatDate(trip.created_at)}
                    </p>
                  </div>
                  <ChevronRight
                    size={14}
                    className="text-slate-300 group-hover:text-brand-400 transition-colors shrink-0"
                  />
                </button>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 px-3 py-3 space-y-1">
          <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-600
            hover:bg-slate-50 transition-colors text-sm">
            <Settings size={16} className="text-slate-400" />
            Settings
          </button>
          <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-600
            hover:bg-slate-50 transition-colors text-sm">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-brand-400 to-teal-400 flex items-center justify-center">
              <User size={12} className="text-white" />
            </div>
            My Profile
          </button>
        </div>
      </aside>
    </>
  );
}
