"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { useAppData } from "@/lib/app-data-context";
import { listProfessorSections, type SectionSummary } from "@/features/professor/api";

interface SectionLinkIndexProps {
  title: string;
  subtitle: string;
  variant: "materials" | "homework" | "gradebook";
}

export function SectionLinkIndex({ title, subtitle, variant }: SectionLinkIndexProps) {
  const { supabase, profile } = useAppData();
  const [sections, setSections] = useState<SectionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const isProfessor = profile.role === "professor" || profile.role === "admin";

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    let active = true;
    setLoading(true);
    listProfessorSections(supabase)
      .then((rows) => {
        if (!active) return;
        setSections(rows);
      })
      .catch(() => {
        if (!active) return;
        setSections([]);
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [supabase]);

  const buildHref = (sectionId: string) => {
    if (variant === "materials") return `/app/sections/${sectionId}/materials`;
    if (variant === "gradebook") return `/app/sections/${sectionId}/gradebook`;
    return `/app/sections/${sectionId}`;
  };

  if (!isProfessor) {
    return (
      <Card>
        <CardBody className="p-8 text-sm text-muted">Professor access required.</CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <section>
        <h1 className="font-display text-4xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-2 text-sm text-muted">{subtitle}</p>
      </section>

      <Card>
        <CardHeader>
          <h2 className="font-display text-2xl font-semibold">Select section</h2>
        </CardHeader>
        <CardBody className="space-y-2">
          {loading ? (
            <p className="text-sm text-muted">Loading sections…</p>
          ) : sections.length === 0 ? (
            <p className="text-sm text-muted">No sections available.</p>
          ) : (
            sections.map((section) => (
              <Link
                key={section.id}
                href={buildHref(section.id)}
                className="block rounded-lg border border-borderc bg-soft px-3 py-2 text-sm text-text hover:bg-overlay"
              >
                {section.name}
                <span className="ml-2 text-xs text-muted">
                  {section.course_id}
                  {section.term ? ` · ${section.term}` : ""}
                </span>
              </Link>
            ))
          )}
        </CardBody>
      </Card>
    </div>
  );
}
