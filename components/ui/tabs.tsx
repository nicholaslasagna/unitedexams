"use client";

import { cn } from "@/lib/utils";

interface TabsProps {
  tabs: { id: string; label: string }[];
  value: string;
  onChange: (id: string) => void;
  className?: string;
}

export function Tabs({ tabs, value, onChange, className }: TabsProps) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)} role="tablist" aria-label="Sections">
      {tabs.map((tab) => {
        const active = tab.id === value;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={active}
            aria-controls={`panel-${tab.id}`}
            className={cn(
              "rounded-xl px-4 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-2/60",
              active
                ? "bg-brand-gradient text-white shadow-soft"
                : "border border-borderc bg-soft text-muted hover:text-text"
            )}
            onClick={() => onChange(tab.id)}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
