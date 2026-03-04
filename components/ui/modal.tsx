"use client";

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

type ModalSize = "sm" | "md" | "lg" | "full";

const sizeClasses: Record<ModalSize, string> = {
  sm: "max-w-md",
  md: "max-w-2xl",
  lg: "max-w-4xl",
  full: "max-w-[90vw]"
};

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  size?: ModalSize;
  children: ReactNode;
  className?: string;
}

export function Modal({ open, onClose, title, description, size = "md", children, className }: ModalProps) {
  const descId = description ? "modal-desc" : undefined;
  const previousOverflow = useRef<string>("");

  useEffect(() => {
    if (!open) return;

    previousOverflow.current = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow.current;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 animate-[fadeIn_150ms_ease-out]" role="dialog" aria-modal="true" aria-label={title} aria-describedby={descId}>
      <button type="button" className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} aria-label="Close modal" />
      <div className={cn("relative z-[71] w-full rounded-2xl border border-borderc bg-surface shadow-elevated animate-[scaleIn_150ms_ease-out]", sizeClasses[size], className)}>
        <div className="flex items-center justify-between border-b border-borderc px-5 py-4">
          <div>
            <h2 className="text-lg font-bold text-text">{title}</h2>
            {description ? <p id={descId} className="mt-0.5 text-sm text-muted">{description}</p> : null}
          </div>
          <button
            type="button"
            className="rounded-lg border border-borderc bg-soft p-2 text-muted hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/65"
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
