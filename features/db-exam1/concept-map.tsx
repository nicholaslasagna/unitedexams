"use client";

import { useMemo } from "react";
import { ArrowDown, Check, CircleDashed, Play } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress";
import type { Attempt } from "@/lib/types";
import { cn } from "@/lib/utils";
import { pathWithMastery, type MasteryLevel } from "./mastery";
import type { TopicId } from "./topics";

/**
 * The learning path.
 *
 * Ordered by prerequisite, not locked by it. A learner who wants to jump
 * straight to semijoins can — gating material behind a quiz score mostly
 * teaches people to game the quiz. What the path does instead is tell the
 * truth about ordering: outer joins make more sense once equijoin does, and
 * the card says so rather than refusing to open.
 */

const LEVEL_BADGE: Record<MasteryLevel, { label: string; tone: "default" | "success" | "warn" | "danger" }> =
  {
    "not-started": { label: "Not started", tone: "default" },
    weak: { label: "Weak", tone: "danger" },
    learning: { label: "Learning", tone: "warn" },
    mastered: { label: "Mastered", tone: "success" }
  };

export function ConceptMap({
  attempts,
  onStartPractice,
  className
}: {
  attempts: Attempt[];
  onStartPractice: (options: { topic: TopicId; label: string }) => void;
  className?: string;
}) {
  const path = useMemo(() => pathWithMastery(attempts), [attempts]);

  return (
    <Card className={className}>
      <CardHeader>
        <h2 className="text-heading font-semibold text-text">Learning path</h2>
        <p className="mt-0.5 text-body-sm text-text-secondary">
          The order the material builds in. Nothing is locked — but the earlier topics make the
          later ones much cheaper.
        </p>
      </CardHeader>
      <CardBody className="space-y-1">
        {path.map((topic, index) => {
          const badge = LEVEL_BADGE[topic.mastery.level];
          const isLast = index === path.length - 1;

          return (
            <div key={topic.id}>
              <div
                className={cn(
                  "rounded-xl border px-4 py-3 transition",
                  topic.mastery.level === "mastered"
                    ? "border-success/35 bg-success/5"
                    : topic.mastery.level === "weak"
                      ? "border-danger/35 bg-danger/5"
                      : "border-borderc bg-surface dark:bg-surface-raised"
                )}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={cn(
                          "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[0.7rem] font-bold",
                          topic.mastery.level === "mastered"
                            ? "bg-success text-white"
                            : "bg-soft text-faint"
                        )}
                        aria-hidden
                      >
                        {topic.mastery.level === "mastered" ? (
                          <Check className="h-3.5 w-3.5" />
                        ) : topic.mastery.level === "not-started" ? (
                          <CircleDashed className="h-3.5 w-3.5" />
                        ) : (
                          index + 1
                        )}
                      </span>
                      <h3 className="text-body-sm font-semibold text-text">{topic.label}</h3>
                      <Badge tone={badge.tone} size="sm">
                        {topic.mastery.level === "not-started"
                          ? badge.label
                          : `${badge.label} · ${topic.mastery.score}%`}
                      </Badge>
                      <span className="text-caption text-faint">{topic.source}</span>
                    </div>

                    <p className="ml-8 mt-1.5 text-body-sm leading-relaxed text-text-secondary">
                      {topic.summary}
                    </p>

                    {!topic.ready && topic.prerequisites.length > 0 ? (
                      <p className="ml-8 mt-1.5 text-caption text-faint">
                        Easier after{" "}
                        {topic.prerequisites
                          .map((id) => path.find((entry) => entry.id === id)?.label ?? id)
                          .join(" and ")}
                        .
                      </p>
                    ) : null}

                    {topic.mastery.attempted > 0 ? (
                      <div className="ml-8 mt-2 max-w-xs">
                        <ProgressBar value={topic.mastery.score} />
                        <p className="mt-1 text-caption text-faint">
                          {topic.mastery.correct} of {topic.mastery.attempted} recent answers correct
                        </p>
                      </div>
                    ) : null}
                  </div>

                  <Button
                    variant={topic.mastery.level === "weak" ? "primary" : "secondary"}
                    size="sm"
                    onClick={() => onStartPractice({ topic: topic.id, label: topic.label })}
                  >
                    <Play className="h-3.5 w-3.5" aria-hidden />
                    {topic.mastery.level === "not-started" ? "Start" : "Practise"}
                  </Button>
                </div>
              </div>

              {!isLast ? (
                <div className="flex justify-center py-0.5" aria-hidden>
                  <ArrowDown className="h-3.5 w-3.5 text-faint" />
                </div>
              ) : null}
            </div>
          );
        })}
      </CardBody>
    </Card>
  );
}
