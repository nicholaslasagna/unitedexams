"use client";

import {
  BookOpenCheck,
  Brain,
  CircleCheckBig,
  Clock3,
  FileQuestion,
  Sparkles,
  TrendingUp
} from "lucide-react";

/**
 * A static, decorative preview that hints at what the in-product
 * experience looks like. Designed to feel alive without relying on
 * a real attempt or live data.
 */
export function HeroPreview() {
  return (
    /*
     * The product preview itself is the visual moment. We removed the
     * spinning conic-gradient + glowing border that surrounded it —
     * those decorations made the card look like a "generated SaaS
     * landing template" rather than a real product surface. The mock
     * UI inside is interesting on its own.
     */
    <div className="relative isolate overflow-hidden rounded-[1.6rem]">
      <div className="premium-card relative">
        {/* Top bar */}
        <div className="flex items-center justify-between gap-3 border-b border-borderc/70 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-danger/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-warn/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-success/80" />
          </div>
          <div className="flex flex-1 items-center justify-center">
            <div className="flex items-center gap-2 rounded-full border border-borderc bg-soft px-3 py-1 text-[11px] text-text-secondary">
              <span className="font-mono">unitedexams.com</span>
              <span className="text-faint">/</span>
              <span className="font-semibold text-text">CSE-240</span>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-success/30 bg-success/12 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-success">
            <span className="live-dot" />
            Live
          </span>
        </div>

        {/* Body */}
        <div className="grid gap-3 p-4 sm:p-5 lg:grid-cols-[0.92fr_1.08fr]">
          {/* Left column: course hero + lanes */}
          <div className="space-y-3">
            <div className="rounded-[1.1rem] border border-borderc bg-[linear-gradient(160deg,hsl(var(--surface-raised)/0.95),hsl(var(--soft)/0.85))] p-4">
              <div className="flex items-center gap-2">
                <span className="rounded-full border border-brand-2/30 bg-brand-2/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.16em] text-brand-2">
                  CSE-240
                </span>
                <span className="rounded-full border border-success/30 bg-success/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.16em] text-success">
                  72% mastery
                </span>
              </div>
              <p className="mt-2 font-display text-base font-semibold text-text">
                Computer Architecture
              </p>
              <p className="mt-0.5 text-[12px] text-text-secondary">
                Pipeline · cache · RISC-V · hazards
              </p>

              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                {[
                  { label: "Quiz", value: "12" },
                  { label: "Exam", value: "5" },
                  { label: "HW", value: "8" }
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-[0.85rem] border border-borderc bg-surface/80 px-2 py-2"
                  >
                    <p className="font-mono text-base font-bold leading-none text-text">{stat.value}</p>
                    <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-text-secondary">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[1.1rem] border border-borderc bg-surface/85 p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-accent">
                Recommended next
              </p>
              <p className="mt-1.5 text-sm font-semibold text-text">
                Pipeline hazards · short walkthrough
              </p>
              <p className="mt-1 text-[12px] text-text-secondary">
                You missed 3/4 last attempt. 8 min to fix it.
              </p>
              <div className="mt-3 flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full border border-borderc bg-soft px-2 py-0.5 text-[10.5px] text-text-secondary">
                  <Clock3 className="h-3 w-3" />
                  8 min
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-borderc bg-soft px-2 py-0.5 text-[10.5px] text-text-secondary">
                  <Brain className="h-3 w-3" />
                  Study mode
                </span>
              </div>
            </div>
          </div>

          {/* Right column: question + chart */}
          <div className="space-y-3">
            <div className="rounded-[1.1rem] border border-borderc bg-surface/90 p-4">
              <div className="flex items-center justify-between gap-2">
                <span className="rounded-full border border-borderc bg-soft px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.16em] text-text-secondary">
                  Question 4 / 12
                </span>
                <span className="font-mono text-[11px] text-text-secondary">04:21</span>
              </div>
              <p className="mt-2.5 text-[13.5px] font-semibold leading-snug text-text">
                Which forwarding path resolves the EX/MEM hazard between
                <span className="mx-1 rounded-md bg-soft px-1.5 py-0.5 font-mono text-[12px] text-text">
                  add x1
                </span>
                and the next dependent ALU op?
              </p>

              <div className="mt-3 space-y-2">
                {[
                  { key: "A", text: "Stall the pipeline by one cycle", ok: false },
                  { key: "B", text: "Forward EX/MEM register to ALU input", ok: true },
                  { key: "C", text: "Use a branch predictor heuristic", ok: false },
                  { key: "D", text: "Flush the IF stage", ok: false }
                ].map((opt) => (
                  <div
                    key={opt.key}
                    className={`flex items-center gap-2 rounded-[0.8rem] border px-3 py-2 text-[12.5px] ${
                      opt.ok
                        ? "border-success/35 bg-success/10 text-text"
                        : "border-borderc bg-surface text-text-secondary"
                    }`}
                  >
                    <span
                      className={`inline-flex h-5 w-5 items-center justify-center rounded-md border text-[10.5px] font-bold ${
                        opt.ok
                          ? "border-success/45 bg-success/15 text-success"
                          : "border-borderc bg-soft text-text-secondary"
                      }`}
                    >
                      {opt.key}
                    </span>
                    <span className="flex-1">{opt.text}</span>
                    {opt.ok ? (
                      <CircleCheckBig className="h-4 w-4 text-success" />
                    ) : null}
                  </div>
                ))}
              </div>

              <div className="mt-3 flex items-center justify-between gap-2 rounded-[0.8rem] border border-accent/30 bg-accent/10 px-3 py-2 text-[11.5px] text-text">
                <span className="inline-flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-accent" />
                  Why <span className="font-semibold">B</span>: forwarding bypasses the write-back stall.
                </span>
                <span className="font-mono text-text-secondary">+8 XP</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-[1.1rem] border border-borderc bg-surface/85 p-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-text-secondary">
                  Topic mastery
                </p>
                <div className="mt-2 space-y-1.5">
                  {[
                    { label: "Pipeline", v: 84 },
                    { label: "Cache", v: 62 },
                    { label: "ISA", v: 91 }
                  ].map((row) => (
                    <div key={row.label}>
                      <div className="flex items-center justify-between text-[10.5px] text-text-secondary">
                        <span>{row.label}</span>
                        <span className="font-mono text-text">{row.v}%</span>
                      </div>
                      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-borderc">
                        <div
                          className="h-full rounded-full bg-brand-gradient"
                          style={{ width: `${row.v}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[1.1rem] border border-borderc bg-surface/85 p-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-text-secondary">
                  This week
                </p>
                <div className="mt-2 flex items-end gap-1.5">
                  {[14, 22, 9, 28, 34, 18, 26].map((v, idx) => (
                    <div
                      key={idx}
                      className="flex-1 rounded-t-md bg-brand-gradient/80"
                      style={{ height: `${v + 12}px`, opacity: 0.45 + v / 80 }}
                    />
                  ))}
                </div>
                <div className="mt-2 flex items-center justify-between text-[10.5px] text-text-secondary">
                  <span className="inline-flex items-center gap-1">
                    <TrendingUp className="h-3 w-3 text-success" />
                    +18%
                  </span>
                  <span className="font-mono">151 min</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-[1.1rem] border border-borderc bg-soft/80 px-3 py-2.5 text-[11.5px] text-text-secondary">
              <span className="inline-flex items-center gap-1.5">
                <FileQuestion className="h-3.5 w-3.5 text-accent" />
                3 flagged questions
              </span>
              <span className="inline-flex items-center gap-1.5">
                <BookOpenCheck className="h-3.5 w-3.5 text-success" />
                Saved progress
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
