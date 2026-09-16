"use client";

import { useMemo, useState } from "react";
import { ArrowLeftRight, PenLine, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { courseDatabase, courseSchemas } from "@/data/seed/db-exam1/relations";
import { cn } from "@/lib/utils";
import { ExpressionInput } from "./expression-input";
import { SchemaCard } from "./schema-card";
import type { TopicId } from "./topics";

/**
 * English ↔ algebra, plus a free builder over the course schemas.
 *
 * Practice mode launches a graded set. The builder is for trying an
 * expression against the real Staff/Hotel/Library data without being marked.
 */

type StudioMode = "practice" | "builder";
type PracticeDirection = "write" | "read";

export function AlgebraStudio({
  onStartPractice,
  className
}: {
  onStartPractice: (options: { topic: TopicId; label: string }) => void;
  className?: string;
}) {
  const [mode, setMode] = useState<StudioMode>("practice");
  const [direction, setDirection] = useState<PracticeDirection>("write");
  const [schemaId, setSchemaId] = useState(courseSchemas[1]?.id ?? "staff");
  const [draft, setDraft] = useState("Π_{city}(Branch)");

  const schema = useMemo(
    () => courseSchemas.find((entry) => entry.id === schemaId) ?? courseSchemas[0],
    [schemaId]
  );
  const available = schema?.relations.map((relation) => relation.name) ?? [];

  return (
    <div className={cn("space-y-5", className)}>
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Algebra studio">
        {(
          [
            { id: "practice", label: "English ↔ algebra", icon: ArrowLeftRight },
            { id: "builder", label: "Free builder", icon: PenLine }
          ] as const
        ).map((entry) => (
          <button
            key={entry.id}
            type="button"
            role="tab"
            aria-selected={mode === entry.id}
            onClick={() => setMode(entry.id)}
            className={cn(
              "inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-body-sm font-semibold transition",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-2/60",
              mode === entry.id
                ? "border-transparent bg-brand-gradient text-brand-fg shadow-soft"
                : "border-borderc bg-soft text-muted hover:text-text"
            )}
          >
            <entry.icon className="h-4 w-4" aria-hidden />
            {entry.label}
          </button>
        ))}
      </div>

      {mode === "practice" ? (
        <Card>
          <CardHeader>
            <h2 className="text-heading font-semibold text-text">English ↔ algebra</h2>
            <p className="mt-0.5 text-body-sm text-text-secondary">
              Same five questions every time: output, filters, tables, connections, projection.
              Equivalent expressions are marked correct even when they are not word-for-word.
            </p>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setDirection("write")}
                aria-pressed={direction === "write"}
                className={cn(
                  "rounded-xl border px-4 py-3 text-left transition",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-2/60",
                  direction === "write"
                    ? "border-border-accent bg-accent/10"
                    : "border-borderc bg-soft hover:border-border-accent"
                )}
              >
                <p className="text-body-sm font-semibold text-text">English → expression</p>
                <p className="mt-1 text-body-sm text-text-secondary">
                  Write the algebra. The schema sits beside the prompt so you have to decide where
                  each attribute lives.
                </p>
              </button>
              <button
                type="button"
                onClick={() => setDirection("read")}
                aria-pressed={direction === "read"}
                className={cn(
                  "rounded-xl border px-4 py-3 text-left transition",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-2/60",
                  direction === "read"
                    ? "border-border-accent bg-accent/10"
                    : "border-borderc bg-soft hover:border-border-accent"
                )}
              >
                <p className="text-body-sm font-semibold text-text">Expression → English</p>
                <p className="mt-1 text-body-sm text-text-secondary">
                  Say what the result actually contains — whose rows survive, whose attributes
                  come back, whether unmatched tuples are kept.
                </p>
              </button>
            </div>

            <Button
              onClick={() =>
                onStartPractice({
                  topic: direction === "write" ? "writing-expressions" : "reading-expressions",
                  label: direction === "write" ? "Writing algebra" : "Reading algebra"
                })
              }
            >
              <Sparkles className="h-4 w-4" aria-hidden />
              Start a set of 8
            </Button>
          </CardBody>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <h2 className="text-heading font-semibold text-text">Free builder</h2>
            <p className="mt-0.5 text-body-sm text-text-secondary">
              Run an expression against the course instance. Nothing is marked — this is for
              seeing what σ, ⋈ and ▷ actually return.
            </p>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="flex flex-wrap gap-2" role="tablist" aria-label="Schema">
              {courseSchemas.map((entry) => (
                <button
                  key={entry.id}
                  type="button"
                  role="tab"
                  aria-selected={schemaId === entry.id}
                  onClick={() => {
                    setSchemaId(entry.id);
                    setDraft(entry.relations[0]?.name ?? "");
                  }}
                  className={cn(
                    "rounded-xl border px-3 py-2 text-body-sm font-semibold transition",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-2/60",
                    schemaId === entry.id
                      ? "border-transparent bg-accent text-accent-fg"
                      : "border-borderc bg-soft text-muted hover:text-text"
                  )}
                >
                  {entry.label}
                </button>
              ))}
            </div>

            <SchemaCard schemaId={schemaId} />

            <ExpressionInput
              value={draft}
              onChange={setDraft}
              available={available}
              placeholder="σ_{salary > 10000}(Staff)"
            />

            <p className="text-caption text-faint">
              {Object.keys(courseDatabase).length} named relations from the lectures and Homework
              #1. A parse error is shown with a position; a valid expression prints the result
              table underneath.
            </p>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
