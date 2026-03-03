"use client";

import { createContext, useContext } from "react";

export type ToastTone = "default" | "success" | "error";

export interface ToastMessage {
  title: string;
  description?: string;
  tone?: ToastTone;
}

export interface ToastContextValue {
  push: (message: ToastMessage) => void;
}

export const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    return {
      push: () => {
        // no-op outside provider
      }
    };
  }
  return ctx;
}
