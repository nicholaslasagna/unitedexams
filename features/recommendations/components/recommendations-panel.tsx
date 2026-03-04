import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { RecommendationItem } from "@/features/recommendations/scoring";

export function RecommendationsPanel({
  items,
  blockedByOnboarding
}: {
  items: RecommendationItem[];
  blockedByOnboarding: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <h2 className="inline-flex items-center gap-2 font-display text-lg font-bold text-white">
          <Sparkles className="h-5 w-5 text-accent" />
          Recommended For You
        </h2>
      </CardHeader>
      <CardBody className="space-y-3">
        {blockedByOnboarding ? (
          <div className="rounded-xl border border-borderc bg-soft p-4 text-sm text-muted">
            Add your courses to get personalized recommendations.
            <div className="mt-3">
              <Button asChild variant="secondary">
                <Link href="/app/account?onboarding=1">Complete onboarding</Link>
              </Button>
            </div>
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-borderc bg-soft p-4 text-sm text-muted">
            No recommendations yet. Complete one quiz to initialize mastery scoring.
          </div>
        ) : (
          items.map((item) => (
            <Link
              key={item.quizId}
              href={`/quiz/${item.quizId}`}
              className="block rounded-xl border border-borderc bg-soft px-4 py-3 transition hover:border-white/[0.14] hover:bg-white/[0.05]"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-text">{item.title}</p>
                <span className="font-mono text-xs text-accent">{item.estMinutes}m</span>
              </div>
              <p className="mt-1 text-xs text-muted">{item.reason}</p>
            </Link>
          ))
        )}
      </CardBody>
    </Card>
  );
}
