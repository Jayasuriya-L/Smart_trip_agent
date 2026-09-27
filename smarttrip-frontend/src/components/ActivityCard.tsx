import React from "react";
import { Activity } from "@/types";
import {
  Camera, UtensilsCrossed, Hotel, Train, Zap, ShoppingBag,
  Landmark, Smile, Clock, AlertCircle
} from "lucide-react";

const categoryIcons: Record<string, React.ReactNode> = {
  sightseeing: <Camera size={13} />,
  food: <UtensilsCrossed size={13} />,
  accommodation: <Hotel size={13} />,
  transport: <Train size={13} />,
  adventure: <Zap size={13} />,
  shopping: <ShoppingBag size={13} />,
  culture: <Landmark size={13} />,
  relaxation: <Smile size={13} />,
};

interface ActivityCardProps {
  activity: Activity;
  index: number;
}

export default function ActivityCard({ activity, index }: ActivityCardProps) {
  const icon = categoryIcons[activity.category] ?? <Camera size={13} />;
  const curr = activity.currency === "INR" ? "₹" : (activity.currency ? `${activity.currency} ` : "₹");

  return (
    <div className="flex gap-3 group animate-fade-in" style={{ animationDelay: `${index * 40}ms` }}>
      {/* Timeline dot */}
      <div className="flex flex-col items-center">
        <div className="w-6 h-6 rounded-md bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center shrink-0">
          {icon}
        </div>
        <div className="w-px flex-1 bg-slate-200 mt-1" />
      </div>

      {/* Content */}
      <div className="pb-3 flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div>
            <h4 className="font-medium text-slate-900 text-sm leading-tight">{activity.name}</h4>
            {activity.location && (
              <p className="text-[11px] text-slate-400 mt-0.5">{activity.location}</p>
            )}
          </div>
          <span className="text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded font-mono shrink-0">
            {curr}{activity.estimated_cost.toLocaleString()}
            {activity.is_estimate && "*"}
          </span>
        </div>

        {activity.description && (
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">{activity.description}</p>
        )}

        <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-400 font-medium">
          {activity.time && (
            <span className="flex items-center gap-1">
              <Clock size={11} />
              {activity.time}
            </span>
          )}
          {activity.duration_hours > 0 && (
            <span>{activity.duration_hours}h</span>
          )}
          {activity.category && (
            <span className="capitalize text-slate-400 font-normal">
              • {activity.category}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
