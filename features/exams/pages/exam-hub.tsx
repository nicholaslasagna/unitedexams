"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { GraduationCap, ShieldAlert } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAppData } from "@/lib/app-data-context";
import { isVerifiedProfessor } from "@/lib/auth/roles";
import { listProfessorSections, type SectionSummary } from "@/features/professor/api";
import { listSectionExams } from "@/features/exams/api";
import { getCourse } from "@/data/seed";
import { getCourseVisual } from "@/features/study/course-branding";
import { StudentExamListPage } from "@/features/exams/pages/student-exam-list";

interface SectionExamMeta {
  total: number;
  published: number;
}

export function ExamHubPage() {
  const { supabase, user, profile } = useAppData();
  const isProfessor = isVerifiedProfessor(profile);
  const isProfessorRole = profile.role === "professor";

  const [loading, setLoading] = useState(true);
  const [sections, setSections] = useState<SectionSummary[]>([]);
  const [examCounts, setExamCounts] = useState<Record<string, SectionExamMeta>>({});

  useEffect(() => {
    if (!isProfessor || !supabase || !user) {
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);

    void (async () => {
      try {
        const nextSections = await listProfessorSections(supabase);
        if (!active) return;

        setSections(nextSections);

        const countEntries = await Promise.all(
          nextSections.map(async (section) => {
            try {
              const exams = await listSectionExams(supabase, section.id);
              return [
                section.id,
                {
                  total: exams.length,
                  published: exams.filter((exam) => exam.published).length
                }
              ] as const;
            } catch {
              return [section.id, { total: 0, published: 0 }] as const;
            }
          })
        );

        if (!active) return;
        setExamCounts(Object.fromEntries(countEntries));
      } catch {
        if (!active) return;
        setSections([]);
        setExamCounts({});
      } finally {
        if (!active) return;
        setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [isProfessor, supabase, user]);

  const introCopy = useMemo(() => {
    if (isProfessor) {
      return {
        title: "Design exams by section",
        description:
          "Choose the class you want, open the exam builder, and configure timing, proctor controls, open-notes policy, and release rules from there."
      };
    }

    if (isProfessorRole) {
      return {
        title: "Professor verification required",
        description:
          "Your account is marked as professor, but exam authoring stays locked until your university verification is approved."
      };
    }

    return {
      title: "Timed Exams",
      description: "Exams are visible only when your section access allows them."
    };
  }, [isProfessor, isProfessorRole]);

  if (!isProfessor && !isProfessorRole) {
    return <StudentExamListPage />;
  }

  if (!isProfessor) {
    return (
      <div className="space-y-6">
        <section className="space-y-3">
          <h1 className="text-display-lg font-semibold tracking-tight">{introCopy.title}</h1>
          <p className="max-w-2xl text-sm text-text-secondary">{introCopy.description}</p>
        </section>

        <Card className="mesh-hero overflow-hidden">
          <CardBody className="space-y-4 p-8">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-warn/35 bg-warn/10 text-warn">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xl font-semibold text-text">Exam authoring is locked until verification completes.</p>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-text-secondary">
                Once your university admin approves your professor account, this page will switch from student-facing exam listings to section-based exam design tools.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" asChild>
                <Link href="/app/sections">Open sections</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/app/account">Review account status</Link>
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-5 md:space-y-6">
      <section className="space-y-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-1.5">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-2">Timed assessment</p>
            <h1 className="text-[1.9rem] font-display font-semibold tracking-tight text-text sm:text-[2.2rem]">Exams</h1>
            <p className="max-w-[42rem] text-[14px] leading-relaxed text-text-secondary">
              {isProfessor
                ? "Choose a section, open its exam studio, and manage timing, proctoring, and release settings there."
                : introCopy.description}
            </p>
          </div>
          <Button variant="secondary" asChild className="w-full lg:w-auto">
            <Link href="/app/sections">Open professor sections</Link>
          </Button>
        </div>

        <Card>
          <CardBody className="grid gap-2.5 p-3.5 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-[0.95rem] border border-borderc bg-soft px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-text-secondary">Sections</p>
              <p className="mt-1 font-mono text-[1.35rem] font-bold leading-none text-text">{sections.length}</p>
            </div>
            <div className="rounded-[0.95rem] border border-borderc bg-soft px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-text-secondary">Published</p>
              <p className="mt-1 font-mono text-[1.35rem] font-bold leading-none text-text">
                {Object.values(examCounts).reduce((sum, item) => sum + item.published, 0)}
              </p>
            </div>
            <div className="rounded-[0.95rem] border border-borderc bg-soft px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-text-secondary">Total exams</p>
              <p className="mt-1 font-mono text-[1.35rem] font-bold leading-none text-text">
                {Object.values(examCounts).reduce((sum, item) => sum + item.total, 0)}
              </p>
            </div>
            <div className="rounded-[0.95rem] border border-borderc bg-soft px-4 py-3 text-[13px] text-text-secondary">
              Each section keeps its own exam queue, monitoring view, and proctor settings.
            </div>
          </CardBody>
        </Card>
      </section>

      {loading ? (
        <Card>
          <CardBody className="p-6 text-sm text-muted">Loading your exam sections…</CardBody>
        </Card>
      ) : sections.length === 0 ? (
        <Card>
          <CardBody className="space-y-4 p-8">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-brand-2/35 bg-brand-2/10 text-brand-2">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xl font-semibold text-text">No sections yet</p>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-text-secondary">
                Create a section first. Once a class exists, you can start designing exams for it immediately from this page.
              </p>
            </div>
            <Button asChild>
              <Link href="/app/sections">Create a section</Link>
            </Button>
          </CardBody>
        </Card>
      ) : (
        <section className="space-y-3.5">
          <div>
            <h2 className="text-[1.75rem] font-display font-semibold text-text">Choose a class</h2>
            <p className="mt-1 text-[14px] text-text-secondary">
              Open any section below to start building or managing exams for that class.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {sections.map((section, index) => {
              const course = getCourse(section.course_id);
              const visual = getCourseVisual(section.course_id);
              const counts = examCounts[section.id] ?? { total: 0, published: 0 };

              return (
                <Card
                  key={section.id}
                  className={`overflow-hidden transition-all duration-200 ease-out-expo hover:shadow-card-hover hover:border-border-accent stagger-${(index % 6) + 1}`}
                >
                  <div className={`relative h-32 overflow-hidden border-b border-borderc bg-gradient-to-br ${visual.surfaceClass}`}>
                    <Image
                      src={visual.artworkSrc}
                      alt={`${section.name} artwork`}
                      fill
                      className="object-cover opacity-90"
                    />
                  </div>
                  <CardBody className="space-y-3.5 p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone="brand">{section.course_id}</Badge>
                      {section.term ? <Badge>{section.term}</Badge> : null}
                      <Badge tone={counts.published > 0 ? "success" : "warn"}>
                        {counts.published} published
                      </Badge>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-text">{section.name}</h3>
                      <p className="mt-1 text-[13px] text-text-secondary">
                        {course?.name ?? section.course_id}
                      </p>
                    </div>

                    <div className="grid gap-2.5 sm:grid-cols-2">
                      <div className="rounded-[0.95rem] border border-borderc bg-soft px-4 py-2.5">
                        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-faint">Exams</p>
                        <p className="mt-1.5 font-mono text-[1.35rem] font-bold text-text">{counts.total}</p>
                      </div>
                      <div className="rounded-[0.95rem] border border-borderc bg-soft px-4 py-2.5">
                        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-faint">Join code</p>
                        <p className="mt-1.5 font-mono text-sm font-bold text-text">{section.join_code}</p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                      <Button asChild className="w-full sm:w-auto">
                        <Link href={`/app/professor/sections/${section.id}/exams`}>
                          Design exam
                        </Link>
                      </Button>
                      <Button variant="secondary" asChild className="w-full sm:w-auto">
                        <Link href={`/app/professor/sections/${section.id}/quiz-builder`}>
                          Open quiz builder
                        </Link>
                      </Button>
                      <Button variant="ghost" asChild className="w-full sm:w-auto">
                        <Link href={`/app/sections/${section.id}`}>Open section</Link>
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
