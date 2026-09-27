import React from "react";
import { Compass } from "lucide-react";
import Link from "next/link";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  white?: boolean;
}

const sizes = {
  sm: { icon: 16, text: "text-sm", wrap: "gap-1.5" },
  md: { icon: 18, text: "text-base", wrap: "gap-2" },
  lg: { icon: 22, text: "text-lg", wrap: "gap-2.5" },
};

export default function Logo({ size = "md", white = false }: LogoProps) {
  const s = sizes[size];
  return (
    <Link href="/" className={`flex items-center ${s.wrap} group select-none`}>
      <div
        className={`flex items-center justify-center rounded-lg p-1.5 transition-colors
          ${white ? "bg-white/10 text-white" : "bg-slate-900 text-white"}`}
      >
        <Compass size={s.icon} strokeWidth={2.2} />
      </div>
      <div className="flex items-baseline gap-1">
        <span
          className={`font-semibold tracking-tight ${s.text} ${
            white ? "text-white" : "text-slate-900"
          }`}
        >
          SmartTrip
        </span>
        <span
          className={`text-[10px] font-medium tracking-wide uppercase px-1.5 py-0.5 rounded ${
            white
              ? "bg-white/10 text-white/80"
              : "bg-slate-100 text-slate-600 border border-slate-200"
          }`}
        >
          AI
        </span>
      </div>
    </Link>
  );
}
