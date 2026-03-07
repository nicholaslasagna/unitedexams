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
    <section className={cn("mx-auto w-full max-w-[1240px] px-0 sm:px-2 md:px-6", className)}>
      <div className="mesh-hero overflow-hidden rounded-[2rem] border border-borderc/80 bg-surface/60 shadow-[0_24px_80px_hsl(var(--bg)/0.42)] backdrop-blur-xl">
        <div className="grid gap-5 px-5 py-5 sm:px-7 sm:py-7 lg:grid-cols-[1.12fr_0.88fr] lg:px-10 lg:py-10">
          <div className="space-y-5">
            <span className="inline-flex rounded-full border border-brand-2/35 bg-brand-2/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-brand-2">
              {eyebrow}
            </span>

            <div className="space-y-4">
              <h1 className="max-w-[12ch] text-4xl font-display font-semibold leading-[0.96] tracking-tight text-text sm:text-5xl">
                {title}
              </h1>
              <p className="max-w-2xl text-sm leading-relaxed text-text-secondary sm:text-lg">{description}</p>
            </div>

            {actions ? <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">{actions}</div> : null}

            {stats?.length ? (
              <div className="grid gap-3 sm:grid-cols-3">
                {stats.map((stat) => (
                  <div key={stat.label} className="rounded-[1.25rem] border border-borderc bg-surface/70 p-4">
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-text-secondary">{stat.label}</p>
                    <p className="mt-2 font-mono text-3xl font-bold text-text">{stat.value}</p>
                    {stat.detail ? <p className="mt-1 text-xs text-text-secondary">{stat.detail}</p> : null}
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          <Card className="relative overflow-hidden border-borderc bg-[linear-gradient(180deg,hsl(var(--surface)/0.92),hsl(var(--surface-raised)/0.82))]">
            <div className="absolute inset-x-0 top-0 h-24 bg-[radial-gradient(circle_at_top,hsl(var(--brand-2)/0.18),transparent_70%)]" />
            <CardBody className="relative h-full p-5 sm:p-6">{aside}</CardBody>
          </Card>
        </div>
      </div>
    </section>
  );
}
