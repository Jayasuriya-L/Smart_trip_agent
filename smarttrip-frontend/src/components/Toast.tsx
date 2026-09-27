"use client";

import { useEffect, useState } from "react";
import { CheckCircle, XCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "info";

interface ToastProps {
  id: string;
  message: string;
  type: ToastType;
  onDismiss: (id: string) => void;
}

const icons = {
  success: <CheckCircle size={16} className="text-emerald-500" />,
  error:   <XCircle    size={16} className="text-red-500"     />,
  info:    <Info       size={16} className="text-brand-500"   />,
};

const borders = {
  success: "border-l-emerald-400",
  error:   "border-l-red-400",
  info:    "border-l-brand-400",
};

function Toast({ id, message, type, onDismiss }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(() => onDismiss(id), 4000);
    return () => clearTimeout(t);
  }, [id, onDismiss]);

  return (
    <div
      className={`flex items-start gap-3 bg-white border border-slate-200 border-l-4 ${borders[type]}
        rounded-xl shadow-card2 px-4 py-3 animate-slide-up min-w-[280px] max-w-sm`}
    >
      <span className="mt-0.5 shrink-0">{icons[type]}</span>
      <p className="text-sm text-slate-700 flex-1 leading-snug">{message}</p>
      <button
        onClick={() => onDismiss(id)}
        className="text-slate-400 hover:text-slate-600 transition-colors shrink-0"
      >
        <X size={14} />
      </button>
    </div>
  );
}

// ── Toast container / manager ─────────────────────────────────
export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContainerProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto">
          <Toast {...t} onDismiss={onDismiss} />
        </div>
      ))}
    </div>
  );
}

// ── Hook to use toasts ────────────────────────────────────────
export function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = (message: string, type: ToastType = "info") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const dismiss = (id: string) =>
    setToasts((prev) => prev.filter((t) => t.id !== id));

  return { toasts, addToast, dismiss };
}
