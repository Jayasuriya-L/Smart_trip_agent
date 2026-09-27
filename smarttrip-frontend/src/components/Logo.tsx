import React from "react";
import { Plane } from "lucide-react";
import Link from "next/link";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  white?: boolean;
}

const sizes = {
  sm: { icon: 18, text: "text-base", wrap: "gap-1.5" },
  md: { icon: 22, text: "text-lg",   wrap: "gap-2"   },
  lg: { icon: 28, text: "text-2xl",  wrap: "gap-2.5" },
};

export default function Logo({ size = "md", white = false }: LogoProps) {
  const s = sizes[size];
  return (
    <Link href="/" className={`flex items-center ${s.wrap} group select-none`}>
      <div
        className={`flex items-center justify-center rounded-xl p-1.5
          ${white
            ? "bg-white/20 group-hover:bg-white/30"
            : "bg-gradient-to-br from-brand-500 to-teal-500 group-hover:from-brand-600 group-hover:to-teal-600"
          } transition-all duration-200`}
      >
        <Plane
          size={s.icon}
          className={white ? "text-white" : "text-white"}
          strokeWidth={2}
        />
      </div>
      <span
        className={`font-bold ${s.text} ${white ? "text-white" : "text-slate-800"} tracking-tight`}
      >
        Smart<span className={white ? "text-teal-300" : "text-brand-600"}>Trip</span>
        <span className={`font-light ${white ? "text-white/80" : "text-slate-500"}`}> AI</span>
      </span>
    </Link>
  );
}
