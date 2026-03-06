"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Clock3, Search } from "lucide-react";
import { courses, quizSets } from "@/data/seed";
import { fetchPublishedSetsByMode } from "@/features/study/study-set-source";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { resolveQuizSetMode } from "@/lib/study/set-mode";
import type { QuizSet } from "@/lib/types";

function withPrefix(routePrefix: string, path: string) {
  return `${routePrefix}${path}`;
}

export function HomeworkIndexContent({
  routePrefix,
  title = "Homework Mode",
  subtitle = "Work assignments one question at a time with hints, full solutions, and mastery-first feedback."
}: {
  routePrefix: string;
  title?: string;
  subtitle?: string;
}) {
  const [search, setSearch] = useState("");
  const [sets, setSets] = useState<QuizSet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchPublishedSetsByMode("homework")
      .then((rows) => {
        if (!active) return;
        if (rows.length > 0) {
          setSets(rows);
        } else {
          setSets(quizSets.filter((set) => resolveQuizSetMode(set) === "homework"));
        }
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return sets;
    return sets.filter((set) =>
      `${set.title} ${set.description} ${set.tags.join(" ")}`.toLowerCase().includes(query)
    );
  }, [search, sets]);

  return (
    <div className="space-y-5 sm:space-y-6">
      <section>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-display-lg">{title}</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted text-text-secondary sm:text-base">{subtitle}</p>
      </section>

      <Card>
        <CardBody className="p-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="pl-9"
              placeholder="Search homework sets"
              aria-label="Search homework sets"
            />
          </div>
        </CardBody>
      </Card>

      {loading ? (
        <Card>
          <CardBody className="p-6 text-sm text-muted">Loading homework sets…</CardBody>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filtered.map((set, idx) => {
            const course = courses.find((item) => item.id === set.courseId);
            const questionCount = set.questions.length || set.questionCountTarget || 0;
            return (
              <Card key={set.id} className={`transition-all duration-200 ease-out-expo hover:shadow-card-hover hover:border-border-accent stagger-${(idx % 6) + 1}`}>
                <CardHeader className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
                  <div>
                    <p className="text-xs uppercase tracking-[0.14em] text-muted">{course?.code ?? set.courseId}</p>
                    <h2 className="text-heading font-semibold text-text">{set.title}</h2>
                    <p className="mt-1 text-sm text-muted text-text-secondary">{set.description}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge tone="success">Homework</Badge>
                    <Badge>{set.difficulty}</Badge>
                    <Badge tone="brand"><span className="font-mono">{questionCount}</span> questions</Badge>
                  </div>
                </CardHeader>
                <CardBody className="space-y-3 p-5 sm:p-6">
                  <div className="flex flex-wrap gap-2 text-xs text-muted">
                    <span className="inline-flex items-center gap-1 rounded-full border border-borderc px-2 py-1">
                      <Clock3 className="h-3 w-3" />
                      ~{set.estMinutes} min
                    </span>
                    {set.tags.map((tag) => (
                      <span key={tag} className="rounded-full border border-borderc px-2 py-1">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                    <Button asChild className="w-full sm:w-auto">
                      <Link href={withPrefix(routePrefix, `/homework/${set.id}`)}>Start Homework</Link>
                    </Button>
                    {course ? (
                      <Button variant="secondary" asChild className="w-full sm:w-auto">
                        <Link href={withPrefix(routePrefix, `/courses/${course.id}`)}>Open course hub</Link>
                      </Button>
                    ) : null}
                  </div>
                </CardBody>
              </Card>
            );
          })}
          {filtered.length === 0 ? (
            <Card>
              <CardBody className="p-6 text-sm text-muted">No homework sets match your search yet.</CardBody>
            </Card>
          ) : null}
        </div>
      )}
    </div>
  );
}
