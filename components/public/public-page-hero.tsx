import type { ReactNode } from "react";
import { Card, CardBody } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface PublicPageHeroStat {
  label: string;
  value: string;
  detail?: string;
}

export function PublicPageHero({
  eyebrow,
  title,
  description,
  actions,
  stats,
  aside,
  className
}: {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
  stats?: PublicPageHeroStat[];
  aside?: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("mx-auto w-full max-w-[1280px] px-0 sm:px-2 md:px-6", className)}>
      <div className="story-panel signal-grid overflow-hidden rounded-[2.25rem] border border-borderc/80 shadow-[0_26px_90px_hsl(var(--bg)/0.4)] backdrop-blur-xl">
        <div className="grid gap-6 px-5 py-5 sm:px-7 sm:py-7 lg:grid-cols-[1.08fr_0.92fr] lg:px-10 lg:py-10">
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="editorial-kicker">{eyebrow}</span>
              <span className="rounded-full border border-borderc bg-surface/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
                Built for real coursework
              </span>
            </div>

            <div className="space-y-4">
              <h1 className="max-w-[13ch] text-4xl font-display font-semibold leading-[0.94] tracking-tight text-text sm:text-5xl md:text-[3.9rem]">
                {title}
              </h1>
              <p className="max-w-2xl text-sm leading-relaxed text-text-secondary sm:text-lg">{description}</p>
            </div>

            {actions ? <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">{actions}</div> : null}

            {stats?.length ? (
              <div className="grid gap-3 md:grid-cols-3">
                {stats.map((stat, index) => (
                  <div
                    key={stat.label}
                    className={cn(
                      "rounded-[1.3rem] border border-borderc bg-surface/72 p-4 backdrop-blur-md",
                      index === 0 && "md:col-span-2"
                    )}
                  >
                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-text-secondary">{stat.label}</p>
                    <div className="mt-2 flex items-end justify-between gap-3">
                      <p className="font-mono text-3xl font-bold text-text sm:text-4xl">{stat.value}</p>
                      {stat.detail ? (
                        <p className="max-w-[18ch] text-right text-xs leading-relaxed text-text-secondary">{stat.detail}</p>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          <Card className="story-panel overflow-hidden rounded-[1.8rem] border-borderc bg-surface/82 shadow-[0_18px_52px_hsl(var(--bg)/0.28)]">
            <CardBody className="h-full p-1.5 sm:p-2">
              <div className="signal-grid h-full rounded-[1.4rem] border border-borderc/80 bg-[linear-gradient(160deg,hsl(var(--surface)/0.92),hsl(var(--surface-raised)/0.76))] p-5 sm:p-6">
                {aside}
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </section>
  );
}
