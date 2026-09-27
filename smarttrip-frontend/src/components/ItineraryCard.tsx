"use client";

import { Itinerary } from "@/types";
import DayCard from "./DayCard";
import {
  MapPin, Calendar, Users, Wallet, TrendingDown,
  RefreshCw, DollarSign, Navigation, Download, ExternalLink,
  Train, Tag, AlertCircle
} from "lucide-react";

interface ItineraryCardProps {
  itinerary: Itinerary;
  onRegenerate?: () => void;
  onCheaper?:    () => void;
  onChangeDestination?: () => void;
}

function StatBadge({
  icon,
  label,
  value,
  sub,
  color = "blue",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  color?: "blue" | "teal" | "purple" | "amber" | "rose";
}) {
  const colors = {
    blue:   "bg-blue-50   border-blue-100  text-blue-600",
    teal:   "bg-teal-50   border-teal-100  text-teal-600",
    purple: "bg-purple-50 border-purple-100 text-purple-600",
    amber:  "bg-amber-50  border-amber-100  text-amber-600",
    rose:   "bg-rose-50   border-rose-100   text-rose-600",
  };
  return (
    <div className={`rounded-xl p-3 border ${colors[color]} flex items-center gap-2.5`}>
      <div className="shrink-0">{icon}</div>
      <div>
        <p className="text-xs text-slate-500 font-medium">{label}</p>
        <p className="font-bold text-slate-800 text-sm">{value}</p>
        {sub && <p className="text-xs text-slate-400">{sub}</p>}
      </div>
    </div>
  );
}

export default function ItineraryCard({
  itinerary,
  onRegenerate,
  onCheaper,
  onChangeDestination,
}: ItineraryCardProps) {
  const spent       = itinerary.total_estimated_cost;
  const budget      = itinerary.budget;
  const pct         = Math.min((spent / budget) * 100, 100);
  const overBudget  = spent > budget;
  const curr        = itinerary.currency === "INR" ? "₹" : "$";

  const handleDownload = () => {
    const text = JSON.stringify(itinerary, null, 2);
    const blob = new Blob([text], { type: "application/json" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `smarttrip-${itinerary.destination.replace(/\s+/g, "-").toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Overview header */}
      <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-card2">
        <div className="bg-gradient-to-r from-brand-600 via-brand-500 to-teal-500 p-5 text-white">
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <MapPin size={16} />
                <span className="font-bold text-xl">{itinerary.destination}</span>
              </div>
              {itinerary.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {itinerary.tags.map((tag) => (
                    <span
                      key={tag}
                      className="flex items-center gap-1 text-xs bg-white/20 px-2 py-0.5 rounded-full"
                    >
                      <Tag size={10} />
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="text-right">
              <p className="text-white/70 text-xs">Total Estimated Cost</p>
              <p className="text-2xl font-bold">
                {curr}{spent.toLocaleString()}
              </p>
              <p className="text-xs text-white/60">Budget: {curr}{budget.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 space-y-4">
          {/* Overview text */}
          <p className="text-sm text-slate-600 leading-relaxed">{itinerary.overview}</p>

          {/* Stat grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <StatBadge
              icon={<Calendar size={16} className="text-blue-500" />}
              label="Days"
              value={`${itinerary.num_days} Days`}
              color="blue"
            />
            <StatBadge
              icon={<Users size={16} className="text-purple-500" />}
              label="Travelers"
              value={`${itinerary.num_travelers} People`}
              color="purple"
            />
            <StatBadge
              icon={<Wallet size={16} className="text-amber-500" />}
              label="Budget"
              value={`${curr}${budget.toLocaleString()}`}
              color="amber"
            />
            <StatBadge
              icon={overBudget
                ? <AlertCircle size={16} className="text-rose-500" />
                : <TrendingDown size={16} className="text-teal-500" />}
              label={overBudget ? "Over Budget" : "Remaining"}
              value={`${curr}${Math.abs(itinerary.budget_remaining).toLocaleString()}`}
              color={overBudget ? "rose" : "teal"}
            />
          </div>

          {/* Budget bar */}
          <div>
            <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span>Budget usage</span>
              <span>{Math.round(pct)}%</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  overBudget
                    ? "bg-gradient-to-r from-rose-400 to-rose-600"
                    : "bg-gradient-to-r from-brand-400 to-teal-400"
                }`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2 pt-1">
            {onRegenerate && (
              <button
                onClick={onRegenerate}
                className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg
                  bg-brand-500 text-white hover:bg-brand-600 transition-colors"
              >
                <RefreshCw size={13} /> Regenerate
              </button>
            )}
            {onCheaper && (
              <button
                onClick={onCheaper}
                className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg
                  bg-teal-500 text-white hover:bg-teal-600 transition-colors"
              >
                <DollarSign size={13} /> Make it Cheaper
              </button>
            )}
            {onChangeDestination && (
              <button
                onClick={onChangeDestination}
                className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg
                  bg-purple-500 text-white hover:bg-purple-600 transition-colors"
              >
                <Navigation size={13} /> Change Destination
              </button>
            )}
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg
                border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors ml-auto"
            >
              <Download size={13} /> Download
            </button>
          </div>
        </div>
      </div>

      {/* Day Cards */}
      <div className="space-y-3">
        {itinerary.days.map((day) => (
          <DayCard key={day.day} day={day} />
        ))}
      </div>

      {/* Transportation */}
      {itinerary.transportation.length > 0 && (
        <div className="rounded-2xl border border-slate-200 shadow-card overflow-hidden">
          <div className="bg-slate-700 px-4 py-3 flex items-center gap-2 text-white">
            <Train size={16} />
            <h3 className="font-semibold text-sm">Transportation</h3>
          </div>
          <div className="bg-white divide-y divide-slate-100">
            {itinerary.transportation.map((t, i) => (
              <div key={i} className="px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <p className="font-medium text-sm text-slate-800">
                    {t.from} → {t.to}
                  </p>
                  <p className="text-xs text-slate-400">{t.mode} · {t.duration}</p>
                  {t.notes && <p className="text-xs text-slate-400 mt-0.5">{t.notes}</p>}
                </div>
                <span className="text-sm font-semibold text-brand-600">
                  ₹{t.estimated_cost.toLocaleString()}
                  {t.is_estimate && "*"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}



      {/* Estimate disclaimer */}
      <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-700">
        <AlertCircle size={14} className="shrink-0 mt-0.5" />
        <p>
          Items marked with <strong>*</strong> are estimates based on typical prices and may vary. 
          Always verify costs locally before your trip.
        </p>
      </div>
    </div>
  );
}
