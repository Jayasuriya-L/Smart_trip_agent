"use client";

import { Itinerary } from "@/types";
import DayCard from "./DayCard";
import {
  MapPin, Calendar, Users, Wallet, TrendingDown,
  RefreshCw, DollarSign, Navigation, Download,
  Train, Tag, AlertCircle
} from "lucide-react";

interface ItineraryCardProps {
  itinerary: Itinerary;
  onRegenerate?: () => void;
  onCheaper?: () => void;
  onChangeDestination?: () => void;
}

function StatBadge({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-xl p-3 border border-slate-200/90 bg-slate-50/70 flex items-center gap-3">
      <div className="text-slate-500 shrink-0">{icon}</div>
      <div className="min-w-0">
        <p className="text-[11px] text-slate-500 font-medium tracking-wide uppercase">{label}</p>
        <p className="font-semibold text-slate-900 text-sm tracking-tight truncate">{value}</p>
        {sub && <p className="text-[11px] text-slate-400">{sub}</p>}
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
  const spent = itinerary.total_estimated_cost;
  const budget = itinerary.budget;
  const pct = Math.min((spent / Math.max(budget, 1)) * 100, 100);
  const overBudget = spent > budget && budget > 0;
  const curr = itinerary.currency === "INR" ? "₹" : (itinerary.currency ? `${itinerary.currency} ` : "₹");

  const handleDownload = () => {
    const text = JSON.stringify(itinerary, null, 2);
    const blob = new Blob([text], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `smarttrip-${itinerary.destination.replace(/\s+/g, "-").toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4 animate-fade-in w-full">
      {/* Overview header */}
      <div className="rounded-2xl overflow-hidden border border-slate-200/90 shadow-sm bg-white">
        <div className="bg-slate-900 p-5 text-white">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2">
                <MapPin size={17} className="text-slate-300" />
                <span className="font-semibold text-xl tracking-tight">{itinerary.destination}</span>
              </div>
              {itinerary.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  {itinerary.tags.map((tag) => (
                    <span
                      key={tag}
                      className="flex items-center gap-1 text-[11px] font-medium bg-white/10 text-slate-200 px-2.5 py-0.5 rounded-md"
                    >
                      <Tag size={10} />
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="text-right">
              <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Total Estimated Cost</p>
              <p className="text-2xl font-bold tracking-tight text-white mt-0.5">
                {curr}{spent.toLocaleString()}
              </p>
              {budget > 0 && (
                <p className="text-xs text-slate-400 mt-0.5">Budget: {curr}{budget.toLocaleString()}</p>
              )}
            </div>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {/* Overview text */}
          <p className="text-sm text-slate-600 leading-relaxed">{itinerary.overview}</p>

          {/* Stat grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <StatBadge
              icon={<Calendar size={16} />}
              label="Duration"
              value={`${itinerary.num_days} Days`}
            />
            <StatBadge
              icon={<Users size={16} />}
              label="Travelers"
              value={`${itinerary.num_travelers} People`}
            />
            <StatBadge
              icon={<Wallet size={16} />}
              label="Budget"
              value={budget > 0 ? `${curr}${budget.toLocaleString()}` : "Flexible"}
            />
            <StatBadge
              icon={overBudget ? <AlertCircle size={16} className="text-rose-500" /> : <TrendingDown size={16} className="text-emerald-600" />}
              label={overBudget ? "Over Budget" : "Remaining"}
              value={budget > 0 ? `${curr}${Math.abs(itinerary.budget_remaining).toLocaleString()}` : "N/A"}
            />
          </div>

          {/* Budget progress bar */}
          {budget > 0 && (
            <div>
              <div className="flex justify-between text-xs text-slate-500 mb-1 font-medium">
                <span>Budget Allocated</span>
                <span>{Math.round(pct)}% used</span>
              </div>
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    overBudget ? "bg-rose-500" : "bg-slate-900"
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          )}

          {/* Clean action buttons */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
            {onRegenerate && (
              <button
                type="button"
                onClick={onRegenerate}
                className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg
                  bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-2xs"
              >
                <RefreshCw size={13} />
                <span>Regenerate</span>
              </button>
            )}
            {onCheaper && (
              <button
                type="button"
                onClick={onCheaper}
                className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg
                  bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-2xs"
              >
                <DollarSign size={13} />
                <span>Make it Cheaper</span>
              </button>
            )}
            {onChangeDestination && (
              <button
                type="button"
                onClick={onChangeDestination}
                className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg
                  bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-2xs"
              >
                <Navigation size={13} />
                <span>Change Destination</span>
              </button>
            )}
            <button
              type="button"
              onClick={handleDownload}
              className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg
                bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-2xs ml-auto"
            >
              <Download size={13} />
              <span>Export JSON</span>
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
      {itinerary.transportation && itinerary.transportation.length > 0 && (
        <div className="rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden bg-white">
          <div className="bg-slate-900 px-4 py-3 flex items-center gap-2 text-white">
            <Train size={15} />
            <h3 className="font-semibold text-xs uppercase tracking-wider">Transportation Plan</h3>
          </div>
          <div className="divide-y divide-slate-100">
            {itinerary.transportation.map((t, i) => (
              <div key={i} className="px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <p className="font-medium text-sm text-slate-800">
                    {t.from} → {t.to}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">{t.mode} · {t.duration}</p>
                  {t.notes && <p className="text-xs text-slate-500 mt-0.5">{t.notes}</p>}
                </div>
                <span className="text-sm font-semibold text-slate-900 font-mono">
                  {curr}{t.estimated_cost.toLocaleString()}
                  {t.is_estimate && "*"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Estimate disclaimer */}
      <div className="flex items-start gap-2 bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-3 text-xs text-slate-500">
        <AlertCircle size={14} className="shrink-0 mt-0.5 text-slate-400" />
        <p>
          Prices marked with <strong>*</strong> are estimates. Real costs may vary based on season, availability, and bookings.
        </p>
      </div>
    </div>
  );
}
