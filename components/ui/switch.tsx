"use client";

import { cn } from "@/lib/utils";

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
  className?: string;
}

export function Switch({ checked, onChange, label, description, disabled, className }: SwitchProps) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-borderc bg-soft px-4 py-3",
        "transition-colors duration-150 hover:bg-overlay hover:border-border-bright",
        disabled && "cursor-not-allowed opacity-50",
        className
      )}
    >
      <span>
        <span className="block text-sm font-semibold text-text">{label}</span>
        {description ? <span className="mt-0.5 block text-xs text-muted">{description}</span> : null}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent",
          "transition-colors duration-200 ease-out-expo",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
          checked ? "bg-accent" : "bg-borderc"
        )}
      >
        <span
          aria-hidden
          className={cn(
            "pointer-events-none inline-block h-5 w-5 rounded-full bg-surface shadow-subtle",
            "transition-transform duration-200 ease-out-expo",
            checked ? "translate-x-5" : "translate-x-0"
          )}
        />
      </button>
    </label>
  );
}
