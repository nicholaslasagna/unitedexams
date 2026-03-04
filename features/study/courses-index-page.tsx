"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Filter, Search } from "lucide-react";
import { courses, quizSets } from "@/data/seed";
import { Card, CardBody } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAppData } from "@/lib/app-data-context";
import { courseProgress } from "@/features/progress/metrics";
import { resolveQuizSetMode } from "@/lib/study/set-mode";

function withPrefix(routePrefix: string, path: string) {
  return `${routePrefix}${path}`;
}

export function CoursesIndexContent({
  routePrefix,
  title = "Course Catalog",
  subtitle = "Structured quiz sets, notes, cheat sheets, and resources across your core classes."
}: {
  routePrefix: string;
  title?: string;
  subtitle?: string;
}) {
  const { attempts } = useAppData();
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState<string>("all");

  const filtered = useMemo(() => {
    return courses.filter((course) => {
      const searchMatch =
        search.trim().length === 0 ||
        `${course.name} ${course.code} ${course.topics.join(" ")}`.toLowerCase().includes(search.toLowerCase());
      const diffMatch = difficulty === "all" || course.difficulty === difficulty;
      return searchMatch && diffMatch;
    });
  }, [search, difficulty]);

  return (
    <div className="space-y-6">
      <section>
        <h1 className="font-display text-4xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-2 text-muted">{subtitle}</p>
      </section>

      <Card>
        <CardBody className="grid gap-3 p-4 md:grid-cols-[1fr_auto_auto] md:items-center">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="pl-9"
              placeholder="Search by course, code, or topic"
              aria-label="Search courses"
            />
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-borderc bg-soft px-3 py-2">
            <Filter className="h-4 w-4 text-muted" />
            <select
              value={difficulty}
              onChange={(event) => setDifficulty(event.target.value)}
              className="bg-transparent text-sm text-text outline-none"
              aria-label="Filter by difficulty"
            >
              <option value="all">All levels</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>

          <Button
            variant="ghost"
            onClick={() => {
              setSearch("");
              setDifficulty("all");
            }}
          >
            Reset filters
          </Button>
        </CardBody>
      </Card>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((course) => {
          const progress = courseProgress(attempts, course.id);
          const courseSets = quizSets.filter((quiz) => quiz.courseId === course.id);
          const quizCount = courseSets.filter((set) => resolveQuizSetMode(set) === "quiz").length;
          const examCount = courseSets.filter((set) => resolveQuizSetMode(set) === "exam").length;
          const homeworkCount = courseSets.filter((set) => resolveQuizSetMode(set) === "homework").length;
          return (
            <Card key={course.id} className="group overflow-hidden hover:-translate-y-0.5 hover:shadow-glass">
              <CardBody className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.14em] text-muted">{course.code}</p>
                    <h2 className="font-display text-2xl font-semibold text-text">{course.name}</h2>
                  </div>
                  <span className="text-3xl" aria-hidden>
                    {course.icon}
                  </span>
                </div>

                <p className="text-sm leading-relaxed text-muted">{course.description}</p>

                <div className="flex flex-wrap gap-2">
                  <Badge tone={course.difficulty === "Advanced" ? "warn" : "default"}>{course.difficulty}</Badge>
                  <Badge tone="brand">
                    {quizCount} quiz • {examCount} exam • {homeworkCount} hw
                  </Badge>
                  <Badge tone="success">{progress}% mastery</Badge>
                </div>

                <div className="flex flex-wrap gap-2">
                  {course.tags.map((tag) => (
                    <span key={tag} className="rounded-full border border-borderc px-2 py-1 text-[11px] text-muted">
                      {tag}
                    </span>
                  ))}
                </div>

                <Button asChild className="w-full justify-between">
                  <Link href={withPrefix(routePrefix, `/courses/${course.id}`)}>
                    Open learning hub
                    <span aria-hidden>→</span>
                  </Link>
                </Button>
              </CardBody>
            </Card>
          );
        })}
      </section>
    </div>
  );
}
