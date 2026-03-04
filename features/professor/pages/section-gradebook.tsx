"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAppData } from "@/lib/app-data-context";
import {
  getSectionGradebook,
  listProfessorSections,
  type SectionGradebookRow,
  type SectionSummary
} from "@/features/professor/api";

export function ProfessorSectionGradebookPage({ sectionId }: { sectionId?: string } = {}) {
  const params = useParams<{ id?: string; sectionId?: string }>();
  const resolvedSectionId = sectionId ?? params.sectionId ?? params.id ?? "";
  const { profile, supabase } = useAppData();

  const [section, setSection] = useState<SectionSummary | null>(null);
  const [rows, setRows] = useState<SectionGradebookRow[]>([]);
  const [loading, setLoading] = useState(true);

  const isProfessor = profile.role === "professor" || profile.role === "admin";

  useEffect(() => {
    if (!supabase || !resolvedSectionId) {
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);
    Promise.all([listProfessorSections(supabase), getSectionGradebook(supabase, resolvedSectionId)])
      .then(([sections, gradebookRows]) => {
        if (!active) return;
        setSection(sections.find((item) => item.id === resolvedSectionId) ?? null);
        setRows(gradebookRows);
      })
      .catch(() => {
        if (!active) return;
        setSection(null);
        setRows([]);
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [resolvedSectionId, supabase]);

  const grouped = useMemo(() => {
    const byAssignment = new Map<string, SectionGradebookRow[]>();
    for (const row of rows) {
      const key = `${row.assignment_id}:${row.assignment_title}`;
      const list = byAssignment.get(key) ?? [];
      list.push(row);
      byAssignment.set(key, list);
    }
    return Array.from(byAssignment.entries());
  }, [rows]);

  if (!isProfessor) {
    return (
      <Card>
        <CardBody className="p-8 text-center text-sm text-muted">Professor access required for gradebook data.</CardBody>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardBody className="p-8 text-sm text-muted">Loading gradebook…</CardBody>
      </Card>
    );
  }

  if (!section) {
    return (
      <Card>
        <CardBody className="p-8 text-sm text-muted">Section not found.</CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-4xl font-semibold tracking-tight">Gradebook</h1>
          <p className="mt-2 text-sm text-muted">{section.name}</p>
        </div>
        <Button variant="secondary" asChild>
          <Link href={`/app/sections/${section.id}`}>Back to section</Link>
        </Button>
      </section>

      {grouped.length === 0 ? (
        <Card>
          <CardBody className="p-6 text-sm text-muted">No submissions yet.</CardBody>
        </Card>
      ) : (
        grouped.map(([key, gradeRows]) => {
          const [, assignmentTitle] = key.split(":");
          return (
            <Card key={key}>
              <CardHeader>
                <h2 className="font-display text-2xl font-semibold">{assignmentTitle}</h2>
              </CardHeader>
              <CardBody className="space-y-2">
                {gradeRows.map((row) => (
                  <div key={`${row.assignment_id}:${row.student_id}`} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-borderc bg-soft px-3 py-2 text-sm">
                    <span className="font-medium text-text">{row.display_name}</span>
                    <span className="text-muted">
                      {row.latest_status ? row.latest_status : "Not submitted"}
                      {row.latest_score !== null ? ` · ${row.latest_score}%` : ""}
                      {row.submitted_at ? ` · ${new Date(row.submitted_at).toLocaleString()}` : ""}
                    </span>
                  </div>
                ))}
              </CardBody>
            </Card>
          );
        })
      )}
    </div>
  );
}
