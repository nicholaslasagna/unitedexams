"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { CheckCircle2, AlertTriangle, Info, X } from "lucide-react";
import { ToastContext, type ToastMessage } from "@/lib/hooks/use-toast";

interface InternalToast extends ToastMessage {
  id: string;
  dismissing?: boolean;
}

const TOAST_DURATION = 4000;

/**
 * Errors stay until they are dismissed.
 *
 * Everything used to disappear after 4 seconds, errors included - so
 * "Couldn't save your changes" could come and go while someone was looking
 * at their keyboard, and the failure was then invisible. Confirmations are
 * fine to auto-clear; failures are the one thing a person has to actually
 * see, and they are also the ones worth re-reading.
 */
function autoDismissMs(tone: ToastMessage["tone"]) {
  return tone === "error" ? null : TOAST_DURATION;
}

const toneAccent = {
  default: "bg-accent",
  success: "bg-success",
  error: "bg-danger"
} as const;

const toneIcon = {
  default: Info,
  success: CheckCircle2,
  error: AlertTriangle
} as const;

const toneIconColor = {
  default: "text-accent",
  success: "text-success",
  error: "text-danger"
} as const;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<InternalToast[]>([]);

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) =>
      prev.map((item) => (item.id === id ? { ...item, dismissing: true } : item))
    );
    window.setTimeout(() => remove(id), 200);
  }, [remove]);

  const push = useCallback((message: ToastMessage) => {
    const id = Math.random().toString(36).slice(2, 10);
    const toast: InternalToast = { id, tone: "default", ...message };
    setToasts((prev) => [toast, ...prev].slice(0, 4));
    const ms = autoDismissMs(toast.tone);
    if (ms !== null) window.setTimeout(() => dismiss(id), ms);
  }, [dismiss]);

  const value = useMemo(() => ({ push }), [push]);

  useEffect(() => {
    const onExternalToast = (event: Event) => {
      const custom = event as CustomEvent<ToastMessage | undefined>;
      if (!custom.detail?.title) return;
      push(custom.detail);
    };

    window.addEventListener("ue:toast", onExternalToast);
    return () => window.removeEventListener("ue:toast", onExternalToast);
  }, [push]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed right-4 top-4 z-[80] flex w-[min(380px,92vw)] flex-col gap-2"
        aria-live="polite"
        aria-atomic="false"
      >
        {toasts.map((toast) => {
          const tone = toast.tone ?? "default";
          const Icon = toneIcon[tone];
          return (
            <div
              key={toast.id}
              className={`pointer-events-auto relative overflow-hidden rounded-xl border border-borderc bg-surface shadow-elevated ${
                toast.dismissing ? "animate-slide-out-right" : "animate-slide-in-right"
              }`}
              role={tone === "error" ? "alert" : "status"}
            >
              {/* Left accent stripe */}
              <div className={`absolute left-0 top-0 bottom-0 w-1 ${toneAccent[tone]}`} />

              <div className="flex items-start gap-3 px-4 py-3 pl-5">
                <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${toneIconColor[tone]}`} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-text">{toast.title}</p>
                  {toast.description ? (
                    <p className="mt-0.5 text-xs text-muted">{toast.description}</p>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={() => dismiss(toast.id)}
                  className="rounded-md p-1 text-muted hover:text-text transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
                  aria-label="Dismiss"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Countdown bar — only when something is actually counting down. */}
              {autoDismissMs(tone) !== null ? (
                <div className="h-[2px] w-full bg-borderc/30">
                  <div
                    className={`h-full ${toneAccent[tone]} opacity-60`}
                    style={{
                      animation: toast.dismissing
                        ? "none"
                        : `toastProgress ${TOAST_DURATION}ms linear forwards`
                    }}
                  />
                </div>
              ) : null}

              <style jsx>{`
                @keyframes toastProgress {
                  from { width: 100%; }
                  to { width: 0%; }
                }
              `}</style>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
