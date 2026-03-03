"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Search } from "lucide-react";
import { getCourse, getCourseContent } from "@/data/seed";
import { Card, CardBody } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Markdown } from "@/components/ui/markdown";
import { Button } from "@/components/ui/button";

function extractHeadings(markdown: string) {
  return markdown
    .split("\n")
    .filter((line) => line.startsWith("## "))
    .map((line) => line.replace(/^##\s+/, "").trim());
}

function filterMarkdown(markdown: string, query: string) {
  if (!query.trim()) return markdown;
  const lowered = query.toLowerCase();
  const lines = markdown.split("\n");
  const result: string[] = [];
  let includeBlock = false;

  for (const line of lines) {
    const isHeading = line.startsWith("## ") || line.startsWith("# ");
    if (isHeading) {
      includeBlock = line.toLowerCase().includes(lowered);
      if (includeBlock) result.push(line);
      continue;
    }

    if (line.toLowerCase().includes(lowered)) {
      includeBlock = true;
      if (result.length > 0 && result[result.length - 1].trim().length > 0) result.push("");
    }

    if (includeBlock) result.push(line);
  }

  return result.join("\n").trim() || "No matching sections found.";
}

export default function NotesViewerPage() {
  const params = useParams<{ courseId: string }>();
  const course = getCourse(params.courseId);
  const content = getCourseContent(params.courseId);
  const [search, setSearch] = useState("");
  const notesMarkdown = content?.notes ?? "";

  const headings = useMemo(() => extractHeadings(notesMarkdown), [notesMarkdown]);
  const filtered = useMemo(() => filterMarkdown(notesMarkdown, search), [notesMarkdown, search]);

  if (!course || !content) {
    return (
      <div className="rounded-xl border border-dashed border-borderc bg-soft p-8 text-center">
        <p className="text-lg font-semibold text-text">Notes not found</p>
        <Button asChild className="mt-4">
          <Link href="/app/courses">Back to courses</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <Card>
          <CardBody className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Sections</p>
            <div className="space-y-1">
              {headings.map((heading) => (
                <a key={heading} href={`#${heading.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`} className="block rounded-lg px-2 py-1.5 text-sm text-muted hover:bg-soft hover:text-text">
                  {heading}
                </a>
              ))}
            </div>
            <Button asChild variant="ghost" className="w-full justify-between">
              <Link href={`/app/courses/${course.id}`}>Back to {course.code}</Link>
            </Button>
          </CardBody>
        </Card>
      </aside>

      <section className="space-y-4">
        <Card>
          <CardBody className="space-y-3 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Notes viewer</p>
            <h1 className="font-display text-3xl font-semibold">{course.name} Notes</h1>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="pl-9"
                placeholder="Search inside notes"
                aria-label="Search within notes"
              />
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-6">
            <Markdown content={filtered} />
          </CardBody>
        </Card>
      </section>
    </div>
  );
}
