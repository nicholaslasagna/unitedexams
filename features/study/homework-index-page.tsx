"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ClipboardList,
  Clock3,
  Filter,
  Notebook,
  Search,
  Sparkles
} from "lucide-react";
import { courses, quizSets } from "@/data/seed";
import { fetchPublishedSetsByMode } from "@/features/study/study-set-source";
import { Card, CardBody } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { EmptyState } from "@/components/ui/empty-state";
import { InstitutionAccessNote } from "@/components/ui/institution-access-note";
import { useAccess } from "@/lib/hooks/use-access";
import { resolveQuizSetMode } from "@/lib/study/set-mode";
import type { QuizSet } from "@/lib/types";

function withPrefix(routePrefix: string, path: string) {
  return `${routePrefix}${path}`;
}

export function HomeworkIndexContent({
  routePrefix,
  title = "Homework",
  subtitle = "Take your time on hard problems. Step-by-step hints, full answers, and saved progress — built like an assignment, not a quick quiz.",
  showHeader = true
}: {
  routePrefix: string;
  title?: string;
  subtitle?: string;
  showHeader?: boolean;
}) {
  const access = useAccess();
  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState<string>("all");
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
    return sets.filter((set) => {
      const matchesSearch =
        !query ||
        `${set.title} ${set.description} ${set.tags.join(" ")}`.toLowerCase().includes(query);
      const matchesCourse = courseFilter === "all" || set.courseId === courseFilter;
      return matchesSearch && matchesCourse;
    });
  }, [search, courseFilter, sets]);

  const courseOptions = useMemo(() => {
    const seen = new Set<string>();
    sets.forEach((set) => seen.add(set.courseId));
    return courses.filter((course) => seen.has(course.id));
  }, [sets]);

  const totalQuestions = sets.reduce(
    (sum, set) => sum + (set.questions.length || set.questionCountTarget || 0),
    0
  );
  const totalMinutes = sets.reduce((sum, set) => sum + set.estMinutes, 0);

  return (
    <div className="space-y-8">
      {/* Hero */}
      {showHeader ? (
        <section className="relative">
          <div className="aurora absolute inset-0 -z-10 rounded-[2rem] opacity-90" aria-hidden />
          <div className="premium-card glow-border p-5 sm:p-7">
            <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div className="space-y-4">
                <span className="eyebrow">
                  <Notebook className="h-3 w-3" />
                  Homework workspace
                </span>
                <h1 className="font-display text-[2.4rem] font-semibold leading-[1.02] tracking-tight text-text sm:text-[3rem]">
                  {title}
                </h1>
                <p className="max-w-xl text-[15px] leading-relaxed text-text-secondary">{subtitle}</p>

                <div className="grid gap-3 sm:grid-cols-3">
                  <Stat label="Sets" value={sets.length} icon={<ClipboardList className="h-3.5 w-3.5" />} />
                  <Stat
                    label="Questions"
                    value={totalQuestions}
                    icon={<Sparkles className="h-3.5 w-3.5" />}
                  />
                  <Stat
                    label="Est. time"
                    value={`${totalMinutes}m`}
                    icon={<Clock3 className="h-3.5 w-3.5" />}
                  />
                </div>
              </div>

              <div className="space-y-3 rounded-[1.4rem] border border-borderc bg-surface/85 p-5">
                <p className="text-[10.5px] font-bold uppercase tracking-[0.18em] text-accent">
                  How homework works
                </p>
                <ul className="space-y-2.5">
                  {[
                    "One problem at a time — no overwhelm.",
                    "Step-by-step hints before the full answer.",
                    "Mark questions to come back to later.",
                    "Your progress saves across devices."
                  ].map((line) => (
                    <li
                      key={line}
                      className="flex items-start gap-2 text-[13.5px] text-text-secondary"
                    >
                      <span className="mt-[7px] inline-block h-1 w-1 rounded-full bg-accent" />
                      {line}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {/* Institution-covered users get a warm reminder once */}
      {access.messaging.showInstitutionNote ? (
        <InstitutionAccessNote variant="block" />
      ) : null}

      {/* Filter row */}
      <Card>
        <CardBody className="grid gap-3 p-4 md:grid-cols-[1fr_auto_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="pl-9"
              placeholder="Search homework sets, tags, or topics"
              aria-label="Search homework sets"
            />
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-borderc bg-soft px-3 py-2">
            <Filter className="h-4 w-4 text-muted" />
            <select
              value={courseFilter}
              onChange={(event) => setCourseFilter(event.target.value)}
              className="bg-transparent text-sm text-text outline-none"
              aria-label="Filter by course"
            >
              <option value="all">All courses</option>
              {courseOptions.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.code} · {course.name}
                </option>
              ))}
            </select>
          </div>
          <Button
            variant="ghost"
            onClick={() => {
              setSearch("");
              setCourseFilter("all");
            }}
          >
            Reset
          </Button>
        </CardBody>
      </Card>

      {/* List */}
      {loading ? (
        <div className="grid gap-4">
          {[0, 1, 2].map((idx) => (
            <Card key={idx}>
              <CardBody className="space-y-3 p-5">
                <div className="skeleton h-6 w-1/3" />
                <div className="skeleton h-4 w-2/3" />
                <div className="skeleton h-4 w-1/4" />
              </CardBody>
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Notebook className="h-6 w-6" />}
          title={
            sets.length === 0
              ? "No homework sets in the public library yet"
              : "Nothing matches that filter"
          }
          description={
            sets.length === 0
              ? "When a course wires up homework sets, they show up here. In the meantime, try the public quiz banks."
              : "Try clearing the search or switching to a different course."
          }
          action={
            sets.length === 0 ? (
              <>
                <Button asChild>
                  <Link href={withPrefix(routePrefix, "/courses")}>
                    Browse course hubs
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="ghost">
                  <Link href="/contact?intent=implementation">Request homework for a class</Link>
                </Button>
              </>
            ) : (
              <Button
                variant="secondary"
                onClick={() => {
                  setSearch("");
                  setCourseFilter("all");
                }}
              >
                Reset filter
              </Button>
            )
          }
        />
      ) : (
        <>
          <SectionHeading
            eyebrow={`${filtered.length} ${filtered.length === 1 ? "set" : "sets"}`}
            title="Available homework"
          />
          <div className="grid gap-4">
            {filtered.map((set, idx) => {
              const course = courses.find((item) => item.id === set.courseId);
              const questionCount = set.questions.length || set.questionCountTarget || 0;
              return (
                <Card
                  key={set.id}
                  className={`overflow-hidden transition-all duration-200 ease-out-expo hover:-translate-y-0.5 hover:shadow-card-hover hover:border-border-accent stagger-${(idx % 6) + 1}`}
                >
                  <div className="h-1.5 bg-gradient-to-r from-emerald-500/45 via-teal-500/45 to-success/45" />
                  <CardBody className="space-y-4 p-5 sm:p-6">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        {course ? (
                          <Link
                            href={withPrefix(routePrefix, `/courses/${course.id}`)}
                            className="text-[11px] uppercase tracking-[0.16em] text-text-secondary underline decoration-borderc underline-offset-4 hover:text-text"
                          >
                            {course.code}
                          </Link>
                        ) : (
                          <p className="text-[11px] uppercase tracking-[0.16em] text-text-secondary">
                            {set.courseId}
                          </p>
                        )}
                        <h3 className="mt-0.5 font-display text-xl font-semibold text-text">
                          {set.title}
                        </h3>
                        <p className="mt-1 text-[13.5px] leading-relaxed text-text-secondary">
                          {set.description}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Badge tone="success">Homework</Badge>
                        <Badge>{set.difficulty}</Badge>
                        <Badge tone="brand">
                          <span className="font-mono">{questionCount}</span> q
                        </Badge>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-[12px] text-text-secondary">
                      <span className="inline-flex items-center gap-1 rounded-full border border-borderc bg-soft px-2 py-1">
                        <Clock3 className="h-3 w-3" />
                        ~{set.estMinutes} min
                      </span>
                      {set.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-borderc bg-soft px-2 py-1"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <Button asChild size="lg" className="w-full sm:w-auto">
                      <Link href={withPrefix(routePrefix, `/homework/${set.id}`)}>
                        <Notebook className="h-4 w-4" />
                        Start homework
                      </Link>
                    </Button>
                  </CardBody>
                </Card>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  icon
}: {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-[1rem] border border-borderc bg-surface/85 p-3.5">
      <p className="flex items-center justify-between text-[10.5px] font-bold uppercase tracking-[0.18em] text-text-secondary">
        {label}
        {icon ? <span className="text-accent/80">{icon}</span> : null}
      </p>
      <p className="mt-1.5 font-mono text-2xl font-bold leading-none text-text">{value}</p>
    </div>
  );
}
