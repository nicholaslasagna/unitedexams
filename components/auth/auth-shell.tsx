import type { ReactNode } from "react";
import Link from "next/link";
import { ShieldCheck, Sparkles } from "lucide-react";
import { ConstellationPattern } from "@/components/ui/constellation-pattern";
import { cn } from "@/lib/utils";

interface AuthHeroStat {
  label: string;
  value: string;
  detail?: string;
}

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
  eyebrow = "Focused academic workspace",
  heroTitle = (
    <>
      Study smarter. Test <span className="text-gradient">stronger.</span>
    </>
  ),
  heroDescription = "Guided walkthroughs, rigorous exam practice, and progress analytics with a calm, high-focus experience.",
  heroStats = [
    { label: "Modes", value: "Study + Timed", detail: "Quizzes, homework, and exam prep" },
    { label: "Momentum", value: "Streak-ready", detail: "Progress stays visible every day" },
    { label: "Security", value: "Verified", detail: "Protected sign-in and gated workflows" }
  ],
  heroAside,
  heroFooter,
  className
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
  eyebrow?: string;
  heroTitle?: ReactNode;
  heroDescription?: string;
  heroStats?: AuthHeroStat[];
  heroAside?: ReactNode;
  heroFooter?: ReactNode;
  className?: string;
}) {
  const defaultAside = (
    <div className="space-y-4">
      <div className="rounded-[1.35rem] border border-borderc bg-surface/80 p-4 shadow-subtle backdrop-blur-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-2">Session posture</p>
            <p className="mt-2 text-lg font-semibold text-text">Quiet, fast, and account-aware.</p>
          </div>
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-brand-2/35 bg-brand-2/10 text-brand-2">
            <ShieldCheck className="h-5 w-5" />
          </span>
        </div>
        <div className="mt-4 grid gap-2 text-sm text-text-secondary">
          <div className="rounded-xl border border-borderc bg-soft px-3 py-2">University-scoped access and verified professor workflows.</div>
          <div className="rounded-xl border border-borderc bg-soft px-3 py-2">Adaptive study modes, notes, homework, and exam simulations in one place.</div>
          <div className="rounded-xl border border-borderc bg-soft px-3 py-2">Low-friction recovery and approval flows when security checks are triggered.</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="relative min-h-screen overflow-hidden bg-bg px-4 py-6 text-text sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      {/*
       * Decorative layers — restricted to lg+ viewports.
       * On mobile, stacked backdrop-filters + 52px-blur mesh-hero
       * pseudo-elements + a constellation overlay can peg iOS Safari's
       * compositor for 10–20s before the form is fully painted. The
       * AuthShell is meant to be focused for sign-in; the visual flair
       * lives on landing pages instead.
       */}
      <div className="ambient-glow hidden lg:block" />
      <div className="pointer-events-none absolute inset-0 hidden bg-[radial-gradient(circle_at_top_left,hsl(var(--brand-1)/0.18),transparent_44%),radial-gradient(circle_at_bottom_right,hsl(var(--brand-3)/0.14),transparent_40%),linear-gradient(180deg,hsl(var(--bg)),hsl(var(--bg)/0.96))] lg:block" />
      <ConstellationPattern className="fixed hidden lg:block" opacity={0.03} variant="default" />

      <div className="relative z-[1] mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-[1280px] items-center justify-center">
        <div className={cn(
          "grid w-full gap-5 rounded-[2rem] border border-borderc/80 bg-surface/85 p-3 shadow-[0_24px_90px_hsl(var(--bg)/0.48)]",
          // Heavy backdrop-blur is desktop-only — keeps mobile compositing cheap.
          "lg:bg-surface/70 lg:backdrop-blur-2xl lg:grid-cols-[1.08fr_0.92fr] lg:p-5",
          className
        )}>
          {/*
           * Hero column — hidden on mobile. Avoids the mesh-hero blur
           * pseudo-elements and the marketing copy the user must
           * scroll past on a small screen.
           */}
          <section className="mesh-hero relative hidden overflow-hidden rounded-[1.7rem] border border-borderc/70 bg-[linear-gradient(145deg,hsl(var(--surface-raised)/0.95),hsl(var(--surface)/0.8))] p-5 sm:p-6 lg:block lg:p-8">
            <div className="absolute inset-x-0 top-0 h-24 bg-[radial-gradient(circle_at_top,hsl(var(--brand-2)/0.18),transparent_70%)]" />
            <div className="relative flex h-full flex-col justify-between gap-6">
              <div className="space-y-6">
                <Link
                  href="/"
                  className="inline-flex items-center gap-3 rounded-2xl border border-borderc/70 bg-surface/75 px-3 py-2 transition-colors duration-150 hover:bg-overlay"
                >
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-gradient text-accent-fg shadow-soft">
                    <Sparkles className="h-4 w-4" />
                  </span>
                  <span>
                    <p className="font-display text-base font-semibold text-text">United Exams</p>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted">Academic Premium</p>
                  </span>
                </Link>

                <div className="space-y-4">
                  <span className="inline-flex rounded-full border border-brand-2/35 bg-brand-2/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-brand-2">
                    {eyebrow}
                  </span>
                  <h1 className="max-w-[13ch] text-4xl font-display font-semibold leading-[0.96] tracking-tight text-text sm:max-w-[11ch] sm:text-5xl lg:text-6xl">
                    {heroTitle}
                  </h1>
                  <p className="max-w-[34rem] text-sm leading-relaxed text-text-secondary sm:text-base">
                    {heroDescription}
                  </p>
                </div>

                {heroStats?.length ? (
                  <div className="grid gap-3 sm:grid-cols-3">
                    {heroStats.map((stat) => (
                      <div key={stat.label} className="rounded-[1.25rem] border border-borderc bg-surface/70 p-4 backdrop-blur-sm">
                        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-text-secondary">{stat.label}</p>
                        <p className="mt-2 font-mono text-2xl font-bold text-text sm:text-3xl">{stat.value}</p>
                        {stat.detail ? <p className="mt-1 text-xs text-text-secondary">{stat.detail}</p> : null}
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>

              <div className="space-y-4">
                {heroAside ?? defaultAside}
                {heroFooter ? <div className="text-xs text-text-secondary">{heroFooter}</div> : null}
                <p className="text-center text-xs text-faint">© {new Date().getFullYear()} Imagicast Studios</p>
              </div>
            </div>
          </section>

          {/*
           * Form column — backdrop-blur is desktop-only.
           * On mobile we use a slightly more opaque surface instead;
           * visual difference is negligible, perf gain is large.
           */}
          <section className="rounded-[1.7rem] border border-borderc/70 bg-surface/95 p-5 shadow-subtle sm:p-6 lg:bg-[linear-gradient(180deg,hsl(var(--surface)/0.92),hsl(var(--surface-raised)/0.82))] lg:p-8 lg:backdrop-blur-xl">
            <div className="mb-5 lg:hidden">
              <Link href="/" className="inline-flex items-center gap-2 rounded-xl border border-borderc bg-soft px-3 py-2">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-brand-gradient text-accent-fg">
                  <Sparkles className="h-3.5 w-3.5" />
                </span>
                <span>
                  <p className="font-display text-base font-semibold text-text">United Exams</p>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted">Academic Premium</p>
                </span>
              </Link>
            </div>

            <div className="space-y-3">
              <h2 className="font-display text-3xl font-semibold tracking-tight text-text sm:text-display-lg">{title}</h2>
              <p className="max-w-[34rem] text-sm leading-relaxed text-text-secondary sm:text-base">{subtitle}</p>
            </div>

            <div className="mt-6 space-y-4">{children}</div>

            {footer ? <div className="mt-6 border-t border-borderc pt-4 text-sm text-muted">{footer}</div> : null}
          </section>
        </div>
      </div>
    </div>
  );
}
