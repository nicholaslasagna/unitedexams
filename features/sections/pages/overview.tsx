"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { BellRing, BookOpenText, FolderOpen, GraduationCap } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAppData } from "@/lib/app-data-context";
import { isUniversityAdmin, isVerifiedProfessor } from "@/lib/auth/roles";
import { listJoinedSections, type JoinedSectionSummary } from "@/features/professor/api";
import { ProfessorOverviewPage } from "@/features/professor/pages/overview";
import { getCourse } from "@/data/seed";
import { getCourseVisual } from "@/features/study/course-branding";

export function SectionsOverviewPageContent() {
  const { supabase, user, profile } = useAppData();
  const [joinedSections, setJoinedSections] = useState<JoinedSectionSummary[]>([]);
  const [selectedSectionId, setSelectedSectionId] = useState("");
  const [loading, setLoading] = useState(true);

  const isProfessor = isVerifiedProfessor(profile);
  const isSchoolAdmin = isUniversityAdmin(profile);

  useEffect(() => {
    if (isProfessor || isSchoolAdmin) {
      setLoading(false);
      return;
    }

    if (!supabase || !user) {
      setJoinedSections([]);
      setSelectedSectionId("");
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);
    listJoinedSections(supabase, user.id)
      .then((rows) => {
        if (!active) return;
        setJoinedSections(rows);
        setSelectedSectionId((current) =>
          current && rows.some((row) => row.sectionId === current) ? current : rows[0]?.sectionId ?? ""
        );
      })
      .catch(() => {
        if (!active) return;
        setJoinedSections([]);
        setSelectedSectionId("");
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [isProfessor, isSchoolAdmin, supabase, user]);

  const selectedSection = useMemo(
    () => joinedSections.find((row) => row.sectionId === selectedSectionId) ?? joinedSections[0] ?? null,
    [joinedSections, selectedSectionId]
  );
  const selectedCourse = selectedSection ? getCourse(selectedSection.courseId) : null;
  const selectedVisual = getCourseVisual(selectedSection?.courseId ?? "");

  if (isProfessor) {
    return <ProfessorOverviewPage />;
  }

  if (isSchoolAdmin) {
    return (
      <Card className="mesh-hero overflow-hidden">
        <CardBody className="space-y-4 p-8">
          <span className="inline-flex rounded-full border border-brand-2/35 bg-brand-2/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-brand-2">
            University administration
          </span>
          <h1 className="text-3xl font-display font-semibold tracking-tight text-text">Section workspaces are reserved for students and professors.</h1>
          <p className="max-w-2xl text-sm leading-relaxed text-text-secondary">
            School admin accounts manage professor verification and oversight, but they do not enter class workspaces directly.
          </p>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8">
      <section className="mesh-hero overflow-hidden rounded-[2rem] border border-borderc/80 bg-surface/65 shadow-[0_24px_80px_hsl(var(--bg)/0.4)] backdrop-blur-xl">
        <div className="grid gap-5 p-5 sm:p-6 xl:grid-cols-[1.15fr_0.85fr] xl:p-8">
          <div className="space-y-5">
            <span className="inline-flex rounded-full border border-brand-2/35 bg-brand-2/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-brand-2">
              Class workspace
            </span>
            <div className="space-y-3">
              <h1 className="max-w-[12ch] text-4xl font-display font-semibold leading-[0.96] tracking-tight text-text sm:text-5xl">
                Everything your instructor posted, grouped by class.
              </h1>
              <p className="max-w-2xl text-sm leading-relaxed text-text-secondary sm:text-base">
                Open materials, announcements, and class-specific homework from the same section entry point instead of hunting through separate pages.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-[1.25rem] border border-borderc bg-surface/70 p-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-text-secondary">Joined sections</p>
                <p className="mt-2 font-mono text-3xl font-bold text-text">{joinedSections.length}</p>
                <p className="mt-1 text-xs text-text-secondary">Active classes tied to your account.</p>
              </div>
              <div className="rounded-[1.25rem] border border-borderc bg-surface/70 p-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-text-secondary">Selected course</p>
                <p className="mt-2 font-mono text-2xl font-bold text-text">{selectedCourse?.code ?? "—"}</p>
                <p className="mt-1 text-xs text-text-secondary">Current section focus.</p>
              </div>
              <div className="rounded-[1.25rem] border border-borderc bg-surface/70 p-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-text-secondary">Access</p>
                <p className="mt-2 font-mono text-2xl font-bold text-text">Materials</p>
                <p className="mt-1 text-xs text-text-secondary">Homework, updates, and files from one entry point.</p>
              </div>
            </div>
          </div>

          <Card className="overflow-hidden border-borderc/80 bg-[linear-gradient(180deg,hsl(var(--surface)/0.92),hsl(var(--surface-raised)/0.82))]">
            <CardBody className="space-y-4 p-5 sm:p-6">
              {selectedSection ? (
                <>
                  <div className="overflow-hidden rounded-[1.3rem] border border-borderc bg-surface/70">
                    <div className={`relative h-36 bg-gradient-to-br ${selectedVisual.surfaceClass}`}>
                      <Image
                        src={selectedVisual.artworkSrc}
                        alt={`${selectedSection.sectionName} artwork`}
                        fill
                        className="object-cover opacity-95"
                      />
                    </div>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-text-secondary">Selected section</p>
                    <p className="mt-2 text-xl font-semibold text-text">{selectedSection.sectionName}</p>
                    <p className="mt-1 text-sm text-text-secondary">
                      {selectedCourse?.name ?? selectedSection.courseId}
                      {selectedSection.term ? ` · ${selectedSection.term}` : ""}
                    </p>
                  </div>
                </>
              ) : (
                <div className="rounded-[1rem] border border-borderc bg-soft px-4 py-4 text-sm text-text-secondary">
                  Join a class section to unlock course-specific materials, homework, and announcements.
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </section>

      {loading ? (
        <Card>
          <CardBody className="p-6 text-sm text-muted">Loading sections…</CardBody>
        </Card>
      ) : joinedSections.length === 0 ? (
        <Card>
          <CardBody className="space-y-4 p-8">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-brand-2/35 bg-brand-2/10 text-brand-2">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xl font-semibold text-text">No class sections yet</p>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-text-secondary">
                Join a professor section from the account page to unlock class-specific materials, homework, and announcements here.
              </p>
            </div>
            <Button asChild>
              <Link href="/app/account">Open account settings</Link>
            </Button>
          </CardBody>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <div>
                <h2 className="text-heading font-semibold">Section switcher</h2>
                <p className="mt-1 text-sm text-text-secondary">Switch the focused class here, or use any of the section cards below.</p>
              </div>
            </CardHeader>
            <CardBody className="space-y-4">
              <select
                value={selectedSection?.sectionId ?? ""}
                onChange={(event) => setSelectedSectionId(event.target.value)}
                className="h-11 w-full rounded-[10px] border border-borderc bg-surface px-3 text-sm text-text"
              >
                {joinedSections.map((section) => (
                  <option key={section.sectionId} value={section.sectionId}>
                    {section.sectionName} ({section.courseId})
                  </option>
                ))}
              </select>

              {selectedSection ? (
                <div className="grid gap-3 lg:grid-cols-[1.1fr_0.9fr]">
                  <div className={`relative overflow-hidden rounded-[1.5rem] border border-borderc bg-surface/75 p-5 ${selectedVisual.glowClass}`}>
                    <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${selectedVisual.surfaceClass}`} />
                    <div className="relative space-y-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge tone="brand">{selectedSection.courseId}</Badge>
                        {selectedSection.term ? <Badge>{selectedSection.term}</Badge> : null}
                      </div>
                      <div>
                        <h3 className="text-2xl font-display font-semibold text-text">{selectedSection.sectionName}</h3>
                        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-text-secondary">
                          {selectedCourse?.description ?? "Open the section workspace to review what your instructor has posted for this class."}
                        </p>
                      </div>
                      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                        <Button asChild>
                          <Link href={`/app/sections/${selectedSection.sectionId}/materials`}>Open materials</Link>
                        </Button>
                        <Button variant="secondary" asChild>
                          <Link href={`/app/sections/${selectedSection.sectionId}`}>Open section workspace</Link>
                        </Button>
                        <Button variant="ghost" asChild>
                          <Link href={`/app/announcements?section=${selectedSection.sectionId}`}>View announcements</Link>
                        </Button>
                      </div>
                    </div>
                  </div>

                  <Card>
                    <CardBody className="space-y-3 p-5">
                      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-text-secondary">Inside this class</p>
                      <div className="grid gap-3 text-sm text-text-secondary">
                        <div className="rounded-[1rem] border border-borderc bg-soft px-4 py-3">
                          <div className="flex items-start gap-3">
                            <FolderOpen className="mt-0.5 h-4 w-4 text-brand-2" />
                            <div>
                              <p className="font-semibold text-text">Materials</p>
                              <p className="mt-1">Lecture notes, handouts, uploaded files, and section-specific study documents.</p>
                            </div>
                          </div>
                        </div>
                        <div className="rounded-[1rem] border border-borderc bg-soft px-4 py-3">
                          <div className="flex items-start gap-3">
                            <BookOpenText className="mt-0.5 h-4 w-4 text-brand-2" />
                            <div>
                              <p className="font-semibold text-text">Homework and assignments</p>
                              <p className="mt-1">Instructor-linked work that belongs only to this section, not the public learning hub.</p>
                            </div>
                          </div>
                        </div>
                        <div className="rounded-[1rem] border border-borderc bg-soft px-4 py-3">
                          <div className="flex items-start gap-3">
                            <BellRing className="mt-0.5 h-4 w-4 text-brand-2" />
                            <div>
                              <p className="font-semibold text-text">Announcements</p>
                              <p className="mt-1">Course-specific updates, due date changes, and instructor reminders for this exact class.</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                </div>
              ) : null}
            </CardBody>
          </Card>

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {joinedSections.map((section, idx) => {
              const course = getCourse(section.courseId);
              const visual = getCourseVisual(section.courseId);
              const active = selectedSection?.sectionId === section.sectionId;
              return (
                <button
                  key={section.sectionId}
                  type="button"
                  onClick={() => setSelectedSectionId(section.sectionId)}
                  className={`text-left rounded-[1.5rem] border p-0 transition-all duration-200 ease-out-expo hover:border-border-accent hover:shadow-card-hover ${active ? "border-brand-2/45 shadow-card-hover" : "border-borderc"} stagger-${(idx % 6) + 1}`}
                >
                  <div className="overflow-hidden rounded-[1.5rem] bg-surface">
                    <div className={`relative h-32 bg-gradient-to-br ${visual.surfaceClass}`}>
                      <Image
                        src={visual.artworkSrc}
                        alt={`${section.sectionName} artwork`}
                        fill
                        className="object-cover opacity-95"
                      />
                    </div>
                    <div className="space-y-4 p-5">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge tone="brand">{section.courseId}</Badge>
                        {section.term ? <Badge>{section.term}</Badge> : null}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-text">{section.sectionName}</h3>
                        <p className="mt-1 text-sm text-text-secondary">{course?.name ?? section.courseId}</p>
                      </div>
                      <div className="flex items-center justify-between text-sm font-semibold text-text-secondary">
                        <span>{active ? "Currently selected" : "Tap to focus"}</span>
                        <span aria-hidden>→</span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </section>
        </>
      )}
    </div>
  );
}
