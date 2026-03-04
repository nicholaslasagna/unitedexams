import type { ReactNode } from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { ConstellationPattern } from "@/components/ui/constellation-pattern";

export function AuthShell({
  title,
  subtitle,
  children,
  footer
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-bg px-4 py-10 text-text">
      {/* Background layers */}
      <div className="ambient-glow" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,hsl(var(--brand-1)/0.18),transparent_48%),radial-gradient(circle_at_bottom_right,hsl(var(--brand-3)/0.12),transparent_42%)]" />
      <ConstellationPattern className="fixed" opacity={0.03} variant="default" />

      <div className="relative z-[1] mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-[1180px] items-center justify-center">
        <div className="grid w-full max-w-[980px] gap-6 rounded-[28px] border border-borderc bg-surface/90 p-4 shadow-elevated backdrop-blur-2xl animate-scale-spring lg:grid-cols-[1.1fr_0.9fr] lg:p-8">

          {/* Branded sidebar — desktop only */}
          <section className="hidden rounded-[22px] border border-borderc bg-gradient-to-br from-[hsl(var(--brand-1)/0.22)] via-[hsl(var(--brand-2)/0.16)] to-transparent p-8 lg:flex lg:flex-col lg:justify-between">
            <div>
              <Link href="/" className="inline-flex items-center gap-2 rounded-xl border border-border-bright bg-soft px-3 py-2 transition-colors duration-150 hover:bg-overlay">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-brand-gradient text-accent-fg shadow-soft">
                  <Sparkles className="h-4 w-4" />
                </span>
                <span>
                  <p className="font-display text-base font-semibold text-text">United Exams</p>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted">Academic Premium</p>
                </span>
              </Link>
              <h1 className="mt-8 max-w-[14ch] font-display text-4xl font-semibold leading-tight text-text">
                Study smarter. Test{" "}
                <span className="text-gradient">stronger.</span>
              </h1>
              <p className="mt-4 max-w-[34ch] text-sm leading-relaxed text-text-secondary">
                Guided walkthroughs, rigorous exam practice, and progress analytics with a calm, high-focus experience.
              </p>
            </div>
            <p className="text-xs text-faint">© {new Date().getFullYear()} Imagicast Studios</p>
          </section>

          {/* Form area */}
          <section className="rounded-[22px] border border-borderc bg-surface/80 p-6 backdrop-blur-xl md:p-8">
            {/* Mobile logo */}
            <Link href="/" className="mb-4 inline-flex items-center gap-2 lg:hidden">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-brand-gradient text-accent-fg">
                <Sparkles className="h-3.5 w-3.5" />
              </span>
              <span className="font-display text-base font-semibold text-text">United Exams</span>
            </Link>

            <h2 className="font-display text-display-lg tracking-tight text-text">{title}</h2>
            <p className="mt-2 text-sm text-text-secondary">{subtitle}</p>

            <div className="mt-6 space-y-4">{children}</div>

            {footer ? (
              <div className="mt-6 border-t border-borderc pt-4 text-sm text-muted">{footer}</div>
            ) : null}
          </section>
        </div>
      </div>
    </div>
  );
}
