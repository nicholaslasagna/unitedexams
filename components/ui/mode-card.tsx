"use client";

import type { ReactNode } from "react";
import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";

type Tone = "default" | "study" | "exam" | "timed";

export function ModeCard({
  icon,
  title,
  subtitle,
  bullets,
  cta,
  active = false,
  locked = false,
  lockHint,
  tone = "default",
  onSelect,
  className
}: {
  icon?: ReactNode;
  title: string;
  subtitle?: string;
  bullets?: string[];
  cta?: ReactNode;
  active?: boolean;
  locked?: boolean;
  lockHint?: string;
  tone?: Tone;
  onSelect?: () => void;
  className?: string;
}) {
  const Wrapper: "button" | "div" = onSelect && !locked ? "button" : "div";

  return (
    <Wrapper
      type={Wrapper === "button" ? "button" : undefined}
      onClick={onSelect && !locked ? onSelect : undefined}
      data-active={active}
      data-tone={tone}
      className={cn(
        "mode-card group relative",
        locked && "opacity-95",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {icon ? (
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-borderc bg-surface text-accent">
              {icon}
            </span>
          ) : null}
          <div>
            <p className="font-display text-base font-semibold text-text">{title}</p>
            {subtitle ? (
              <p className="mt-0.5 text-[12.5px] text-text-secondary">{subtitle}</p>
            ) : null}
          </div>
        </div>
        {locked ? (
          <span className="inline-flex items-center gap-1 rounded-full border border-warn/40 bg-warn/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.16em] text-warn">
            <Lock className="h-3 w-3" />
            Premium
          </span>
        ) : null}
      </div>

      {bullets && bullets.length > 0 ? (
        <ul className="space-y-1.5">
          {bullets.map((line) => (
            <li
              key={line}
              className="flex items-start gap-2 text-[13px] leading-snug text-text-secondary"
            >
              <span className="mt-[7px] inline-block h-1 w-1 rounded-full bg-accent" />
              {line}
            </li>
          ))}
        </ul>
      ) : null}

      {locked && lockHint ? (
        <p className="rounded-xl border border-borderc bg-soft px-3 py-2 text-[12px] text-text-secondary">
          {lockHint}
        </p>
      ) : cta ? (
        <div className="flex">{cta}</div>
      ) : null}
    </Wrapper>
  );
}
