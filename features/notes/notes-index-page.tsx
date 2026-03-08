"use client";

import Image from "next/image";
import Link from "next/link";
import { BookOpenText, ExternalLink, FileText } from "lucide-react";
import { courses, notesByCourse } from "@/data/seed";
import { getCourseVisual } from "@/features/study/course-branding";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

function countSections(markdown: string) {
  return markdown
    .split("\n")
    .filter((line) => line.startsWith("## "))
    .length;
}

export function NotesIndexPage() {
  const noteCourses = courses.filter((course) => Boolean(notesByCourse[course.id]));

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-accent">Reference material</p>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-text sm:text-4xl">Notes</h1>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-text-secondary sm:text-base">
              Course-specific notes, cheat sheets, and reference links across your enrolled study lanes.
            </p>
          </div>
          <Badge tone="info">{noteCourses.length} course note stacks</Badge>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        {noteCourses.map((course) => {
          const content = notesByCourse[course.id];
          const visual = getCourseVisual(course.id);
          const sectionCount = countSections(content.notes);

          return (
            <Card key={course.id} className="overflow-hidden">
              <div className="grid gap-0 md:grid-cols-[180px_1fr]">
                <div className={`relative min-h-[160px] overflow-hidden border-b border-borderc md:min-h-full md:border-b-0 md:border-r ${visual.glowClass}`}>
                  <div className={`absolute inset-0 bg-gradient-to-br ${visual.surfaceClass}`} />
                  <Image
                    src={visual.artworkSrc}
                    alt={`${course.name} note artwork`}
                    fill
                    className="object-cover opacity-95"
                  />
                  <div className="absolute inset-x-0 bottom-0 p-4">
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-text-secondary">{course.code}</p>
                    <p className="mt-1 text-lg font-semibold text-text">{course.name}</p>
                  </div>
                </div>

                <CardBody className="space-y-4 p-5">
                  <p className="text-sm leading-relaxed text-text-secondary">{course.description}</p>

                  <div className="flex flex-wrap gap-2">
                    <Badge tone="brand">{sectionCount} note sections</Badge>
                    <Badge>{content.resources.length} references</Badge>
                    <Badge tone="success">Cheat sheet included</Badge>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-[1rem] border border-borderc bg-soft px-4 py-3">
                      <div className="flex items-center gap-2 text-text">
                        <FileText className="h-4 w-4 text-accent" />
                        <p className="text-sm font-semibold">Full notes</p>
                      </div>
                      <p className="mt-2 text-xs leading-relaxed text-text-secondary">
                        Structured review notes for the core exam patterns and problem types in this class.
                      </p>
                    </div>
                    <div className="rounded-[1rem] border border-borderc bg-soft px-4 py-3">
                      <div className="flex items-center gap-2 text-text">
                        <BookOpenText className="h-4 w-4 text-accent" />
                        <p className="text-sm font-semibold">Cheat sheet</p>
                      </div>
                      <p className="mt-2 text-xs leading-relaxed text-text-secondary">
                        Faster scan version for last-minute review before quizzes, homework, or exams.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Button asChild>
                      <Link href={`/app/notes/${course.id}`}>Open notes</Link>
                    </Button>
                    <Button variant="secondary" asChild>
                      <Link href={`/app/courses/${course.id}`}>Open course hub</Link>
                    </Button>
                  </div>

                  {content.resources.length > 0 ? (
                    <div className="rounded-[1rem] border border-borderc bg-soft px-4 py-3">
                      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-text-secondary">Reference links</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {content.resources.slice(0, 3).map((resource) => (
                          <a
                            key={resource.href}
                            href={resource.href}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 rounded-full border border-borderc px-3 py-1.5 text-xs text-text-secondary transition-colors hover:border-border-accent hover:text-text"
                          >
                            <span>{resource.label}</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </CardBody>
              </div>
            </Card>
          );
        })}
      </section>
    </div>
  );
}
