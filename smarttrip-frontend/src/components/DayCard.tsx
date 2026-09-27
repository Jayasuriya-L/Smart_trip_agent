"use client";

import { useState } from "react";
import { DayPlan } from "@/types";
import ActivityCard from "./ActivityCard";
import { Hotel, ChevronDown, ChevronUp, Star } from "lucide-react";

interface DayCardProps {
  day: DayPlan;
}

export default function DayCard({ day }: DayCardProps) {
  const [open, setOpen] = useState(day.day === 1);

  return (
    <div className="rounded-xl overflow-hidden border border-slate-200 shadow-2xs bg-white transition-all">
      {/* Header */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full bg-slate-50 hover:bg-slate-100/70 p-4 flex items-center justify-between text-slate-900 transition-colors border-b border-transparent data-[open=true]:border-slate-200"
        data-open={open}
      >
        <div className="flex items-center gap-3">
          <span className="w-7 h-7 rounded-md bg-slate-900 text-white flex items-center justify-center text-xs font-semibold shrink-0">
            {day.day}
          </span>
          <div className="text-left min-w-0">
            <p className="font-semibold text-sm text-slate-900">{day.title}</p>
            {day.theme && (
              <p className="text-xs text-slate-500 truncate mt-0.5">{day.theme}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="text-xs font-semibold font-mono bg-white border border-slate-200 px-2.5 py-1 rounded-md text-slate-700 shadow-2xs">
            ₹{day.day_total_cost.toLocaleString()}
          </span>
          <div className="text-slate-400">
            {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
        </div>
      </button>

      {/* Body */}
      {open && (
        <div className="bg-white p-4 space-y-4">
          {/* Activities timeline */}
          <div>
            {day.activities.map((act, i) => (
              <ActivityCard key={act.id} activity={act} index={i} />
            ))}
          </div>

          {/* Accommodation */}
          {day.accommodation && (
            <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-3.5 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0 text-slate-600">
                <Hotel size={15} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <p className="font-medium text-sm text-slate-900 truncate">
                    {day.accommodation.name}
                  </p>
                  <span className="text-xs font-semibold text-slate-900 font-mono">
                    ₹{day.accommodation.estimated_cost_per_night.toLocaleString()}/night
                    {day.accommodation.is_estimate && "*"}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="text-xs text-slate-500 font-medium">
                    {day.accommodation.type}
                  </span>
                  {day.accommodation.rating && (
                    <span className="flex items-center gap-0.5 text-xs text-amber-600 font-medium">
                      <Star size={11} fill="currentColor" />
                      {day.accommodation.rating}
                    </span>
                  )}
                  {day.accommodation.location && (
                    <span className="text-xs text-slate-400">
                      • {day.accommodation.location}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
