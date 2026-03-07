import Link from "next/link";
import { PublicShell } from "@/components/layout/public-shell";
import { PublicPageHero } from "@/components/public/public-page-hero";
import { Button } from "@/components/ui/button";
import { LeaderboardPageContent } from "@/features/leaderboard/page";

export default function PublicLeaderboardPage() {
  return (
    <PublicShell>
      <div className="space-y-8 pb-12 md:space-y-10 md:pb-14">
        <PublicPageHero
          eyebrow="Momentum board"
          title="See who is actually putting in the work."
          description="The public board shows the top performers while respecting privacy controls. Sign in to unlock the full ranking and your own position."
          actions={
            <>
              <Button asChild size="lg">
                <Link href="/login?next=/app/leaderboard">Sign in for full board</Link>
              </Button>
              <Button asChild variant="secondary" size="lg">
                <Link href="/courses">Start studying</Link>
              </Button>
            </>
          }
          stats={[
            { label: "Public preview", value: "Top 5", detail: "Visible without an account" },
            { label: "Full access", value: "Sign in", detail: "See your own place and more entries" },
            { label: "Privacy", value: "Respected", detail: "Display settings still apply" }
          ]}
          aside={
            <div className="space-y-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-accent">What this board is for</p>
                <p className="mt-1 text-sm text-text-secondary">
                  It rewards consistency and study momentum, not empty vanity metrics.
                </p>
              </div>
              <div className="grid gap-3">
                <div className="rounded-[1.15rem] border border-borderc bg-surface/80 p-4">
                  <p className="text-sm font-semibold text-text">Progress has visibility</p>
                  <p className="mt-1 text-xs leading-relaxed text-text-secondary">
                    Students can measure momentum against real usage rather than guessing how they compare.
                  </p>
                </div>
                <div className="rounded-[1.15rem] border border-borderc bg-surface/80 p-4">
                  <p className="text-sm font-semibold text-text">Privacy still wins</p>
                  <p className="mt-1 text-xs leading-relaxed text-text-secondary">
                    Real-name and university visibility follow account settings rather than exposing people by default.
                  </p>
                </div>
                <div className="rounded-[1.15rem] border border-borderc bg-surface/80 p-4">
                  <p className="text-sm font-semibold text-text">The full board lives in the app</p>
                  <p className="mt-1 text-xs leading-relaxed text-text-secondary">
                    Public visitors get the preview. Signed-in users can open the complete ranking view.
                  </p>
                </div>
              </div>
            </div>
          }
        />

        <div className="mx-auto w-full max-w-[1240px] px-0 sm:px-2 md:px-6">
          <LeaderboardPageContent publicMode showHeader={false} />
        </div>
      </div>
    </PublicShell>
  );
}
