import type { ReactNode } from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";

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
    <div className="relative min-h-screen overflow-hidden bg-[#050510] px-4 py-10 text-text">
      <div className="ambient-glow" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(114,92,255,0.18),transparent_48%),radial-gradient(circle_at_bottom_right,rgba(76,216,255,0.12),transparent_42%)]" />

      <div className="relative z-[1] mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-[1180px] items-center justify-center">
        <div className="grid w-full max-w-[980px] gap-6 rounded-[28px] border border-white/[0.08] bg-[rgba(7,8,24,0.86)] p-4 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-2xl lg:grid-cols-[1.1fr_0.9fr] lg:p-8">
          <section className="hidden rounded-[22px] border border-white/[0.08] bg-gradient-to-br from-[hsl(var(--brand-1)/0.22)] via-[hsl(var(--brand-2)/0.16)] to-transparent p-8 lg:flex lg:flex-col lg:justify-between">
            <div>
              <Link href="/" className="inline-flex items-center gap-2 rounded-xl border border-white/[0.14] bg-white/[0.05] px-3 py-2">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-accent-gradient text-white shadow-soft">
                  <Sparkles className="h-4 w-4" />
                </span>
                <span>
                  <p className="font-display text-base font-semibold text-white">United Exams</p>
                  <p className="text-[10px] font-semibold tracking-[0.22em] text-white/60 uppercase">Academic Premium</p>
                </span>
              </Link>
              <h1 className="mt-8 max-w-[14ch] font-display text-4xl font-semibold leading-tight text-white">
                Study smarter. Test stronger.
              </h1>
              <p className="mt-4 max-w-[34ch] text-sm leading-relaxed text-white/70">
                Guided walkthroughs, rigorous exam practice, and progress analytics with a calm, high-focus experience.
              </p>
            </div>
            <p className="text-xs text-white/55">© {new Date().getFullYear()} Imagicast Studios</p>
          </section>

          <section className="rounded-[22px] border border-white/[0.08] bg-[rgba(8,10,30,0.72)] p-6 md:p-8">
            <Link href="/" className="mb-4 inline-flex items-center gap-2 lg:hidden">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-accent-gradient text-white">
                <Sparkles className="h-3.5 w-3.5" />
              </span>
              <span className="font-display text-base font-semibold text-white">United Exams</span>
            </Link>

            <h2 className="font-display text-3xl font-semibold tracking-tight text-white">{title}</h2>
            <p className="mt-2 text-sm text-white/65">{subtitle}</p>

            <div className="mt-6 space-y-4">{children}</div>

            {footer ? <div className="mt-6 border-t border-white/[0.08] pt-4 text-sm text-white/70">{footer}</div> : null}
          </section>
        </div>
      </div>
    </div>
  );
}
