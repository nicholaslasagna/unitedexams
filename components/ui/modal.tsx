"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  className?: string;
}

export function Modal({ open, onClose, title, children, className }: ModalProps) {
  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={title}>
      <button type="button" className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} aria-label="Close modal" />
      <div className={cn("relative z-[71] w-full max-w-2xl rounded-2xl border border-borderc bg-surface shadow-glass", className)}>
        <div className="flex items-center justify-between border-b border-borderc px-5 py-4">
          <h2 className="text-lg font-bold text-text">{title}</h2>
          <button
            type="button"
            className="rounded-lg border border-borderc bg-soft p-2 text-muted hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-2/70"
            onClick={onClose}
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  );
}
