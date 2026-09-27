"use client";

import { useState } from "react";
import { DayPlan } from "@/types";
import ActivityCard from "./ActivityCard";
import { Hotel, ChevronDown, ChevronUp, Star } from "lucide-react";

interface DayCardProps {
  day: DayPlan;
}

const gradients = [
  "from-brand-500 to-brand-700",
  "from-teal-500 to-teal-700",
  "from-purple-500 to-purple-700",
  "from-rose-500 to-rose-700",
  "from-amber-500 to-amber-700",
];

export default function DayCard({ day }: DayCardProps) {
  const [open, setOpen] = useState(day.day === 1);
  const grad = gradients[(day.day - 1) % gradients.length];

  return (
    <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-card animate-slide-up">
      {/* Header */}
      <button
        onClick={() => setOpen((o) => !o)}
        className={`w-full bg-gradient-to-r ${grad} p-4 flex items-center justify-between text-white`}
      >
        <div className="flex items-center gap-3">
          <span className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold">
            {day.day}
          </span>
          <div className="text-left">
            <p className="font-semibold text-base">{day.title}</p>
            <p className="text-xs text-white/75">{day.theme}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold bg-white/20 px-3 py-1 rounded-full">
            ₹{day.day_total_cost.toLocaleString()}
          </span>
          {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
      </button>

      {/* Body */}
      {open && (
        <div className="bg-white p-4">
          {/* Activities timeline */}
          <div className="mb-4">
            {day.activities.map((act, i) => (
              <ActivityCard key={act.id} activity={act} index={i} />
            ))}
          </div>

          {/* Accommodation */}
          {day.accommodation && (
            <div className="bg-purple-50 border border-purple-100 rounded-xl p-3 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center shrink-0">
                <Hotel size={16} className="text-purple-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <p className="font-medium text-sm text-slate-800">
                    {day.accommodation.name}
                  </p>
                  <span className="text-xs font-semibold text-purple-600">
                    ₹{day.accommodation.estimated_cost_per_night.toLocaleString()}/night
                    {day.accommodation.is_estimate && "*"}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-slate-400">{day.accommodation.type}</span>
                  {day.accommodation.rating && (
                    <span className="flex items-center gap-0.5 text-xs text-amber-500">
                      <Star size={11} fill="currentColor" />
                      {day.accommodation.rating}
                    </span>
                  )}
                  {day.accommodation.location && (
                    <span className="text-xs text-slate-400">• {day.accommodation.location}</span>
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
