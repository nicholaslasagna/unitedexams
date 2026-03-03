"use client";

import { useCallback, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { CheckCircle2, AlertTriangle, Info } from "lucide-react";
import { ToastContext, type ToastMessage } from "@/lib/hooks/use-toast";

interface InternalToast extends ToastMessage {
  id: string;
}

const toneStyle = {
  default: "border-borderc bg-surface text-text",
  success: "border-success/30 bg-success/10 text-text",
  error: "border-danger/30 bg-danger/10 text-text"
} as const;

const toneIcon = {
  default: Info,
  success: CheckCircle2,
  error: AlertTriangle
} as const;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<InternalToast[]>([]);

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const push = useCallback((message: ToastMessage) => {
    const id = Math.random().toString(36).slice(2, 10);
    const toast: InternalToast = { id, tone: "default", ...message };
    setToasts((prev) => [toast, ...prev].slice(0, 4));
    window.setTimeout(() => remove(id), 3500);
  }, [remove]);

  const value = useMemo(() => ({ push }), [push]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-[80] flex w-[min(360px,92vw)] flex-col gap-2">
        {toasts.map((toast) => {
          const tone = toast.tone ?? "default";
          const Icon = toneIcon[tone];
          return (
            <div key={toast.id} className={`pointer-events-auto rounded-xl border px-4 py-3 shadow-soft ${toneStyle[tone]}`}>
              <div className="flex items-start gap-3">
                <Icon className="mt-0.5 h-4 w-4 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{toast.title}</p>
                  {toast.description ? <p className="mt-0.5 text-xs text-muted">{toast.description}</p> : null}
                </div>
                <button
                  type="button"
                  onClick={() => remove(toast.id)}
                  className="rounded-md px-2 py-1 text-xs text-muted hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-2/60"
                >
                  Close
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
