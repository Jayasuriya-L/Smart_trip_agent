import React from "react";
import { Activity } from "@/types";
import {
  Camera, UtensilsCrossed, Hotel, Train, Zap, ShoppingBag,
  Landmark, Smile, Clock, AlertCircle
} from "lucide-react";

const categoryConfig: Record<
  string,
  { icon: React.ReactNode; color: string; bg: string }
> = {
  sightseeing:   { icon: <Camera     size={14} />, color: "text-blue-600",   bg: "bg-blue-50"   },
  food:          { icon: <UtensilsCrossed size={14} />, color: "text-orange-600", bg: "bg-orange-50" },
  accommodation: { icon: <Hotel      size={14} />, color: "text-purple-600", bg: "bg-purple-50" },
  transport:     { icon: <Train      size={14} />, color: "text-slate-600",  bg: "bg-slate-50"  },
  adventure:     { icon: <Zap        size={14} />, color: "text-amber-600",  bg: "bg-amber-50"  },
  shopping:      { icon: <ShoppingBag size={14} />, color: "text-pink-600",   bg: "bg-pink-50"   },
  culture:       { icon: <Landmark   size={14} />, color: "text-indigo-600", bg: "bg-indigo-50" },
  relaxation:    { icon: <Smile      size={14} />, color: "text-teal-600",   bg: "bg-teal-50"   },
};

interface ActivityCardProps {
  activity: Activity;
  index: number;
}

export default function ActivityCard({ activity, index }: ActivityCardProps) {
  const cfg = categoryConfig[activity.category] ?? categoryConfig.sightseeing;

  return (
    <div className="flex gap-3 group animate-fade-in" style={{ animationDelay: `${index * 60}ms` }}>
      {/* Timeline dot */}
      <div className="flex flex-col items-center">
        <div
          className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0
            ${cfg.bg} ${cfg.color} border border-white shadow-sm`}
        >
          {cfg.icon}
        </div>
        <div className="w-px flex-1 bg-slate-100 mt-1" />
      </div>

      {/* Content */}
      <div className="pb-4 flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div>
            <h4 className="font-medium text-slate-800 text-sm leading-tight">{activity.name}</h4>
            {activity.location && (
              <p className="text-xs text-slate-400 mt-0.5">{activity.location}</p>
            )}
          </div>
          <span className="text-xs font-semibold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full shrink-0">
            {activity.currency === "INR" ? "₹" : "$"}
            {activity.estimated_cost.toLocaleString()}
            {activity.is_estimate && "*"}
          </span>
        </div>

        <p className="text-xs text-slate-500 mt-1 leading-relaxed">{activity.description}</p>

        <div className="flex items-center gap-3 mt-2">
          <span className="flex items-center gap-1 text-xs text-slate-400">
            <Clock size={11} />
            {activity.time}
          </span>
          <span className="flex items-center gap-1 text-xs text-slate-400">
            {activity.duration_hours}h
          </span>
          {activity.is_estimate && (
            <span className="flex items-center gap-1 text-xs text-amber-500">
              <AlertCircle size={11} />
              Estimated
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
