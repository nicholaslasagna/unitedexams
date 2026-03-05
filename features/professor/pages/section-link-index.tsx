"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppData } from "@/lib/app-data-context";
import { isVerifiedProfessor } from "@/lib/auth/roles";
import {
  listJoinedSections,
  listProfessorSections,
  type JoinedSectionSummary,
  type SectionSummary
} from "@/features/professor/api";

interface SectionLinkIndexProps {
  title: string;
  subtitle: string;
  variant: "materials" | "homework" | "gradebook";
}

export function SectionLinkIndex({ title, subtitle, variant }: SectionLinkIndexProps) {
  const { supabase, profile, user } = useAppData();
  const [sections, setSections] = useState<SectionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const isProfessor = isVerifiedProfessor(profile);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    let active = true;
    setLoading(true);
    const toSummary = (row: JoinedSectionSummary): SectionSummary => ({
      id: row.sectionId,
      name: row.sectionName,
      term: row.term,
      course_id: row.courseId,
      join_code: "",
      created_at: row.joinedAt
    });

    const run = isProfessor
      ? listProfessorSections(supabase)
      : user
        ? listJoinedSections(supabase, user.id).then((rows) => rows.map(toSummary))
        : Promise.resolve([] as SectionSummary[]);

    run
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
  }, [isProfessor, supabase, user]);

  const buildHref = (sectionId: string) => {
    if (variant === "materials") return `/app/sections/${sectionId}/materials`;
    if (variant === "gradebook") return `/app/sections/${sectionId}/gradebook`;
    return `/app/sections/${sectionId}`;
  };

  if (!isProfessor && variant === "gradebook") {
    return (
      <Card>
        <CardBody className="p-8 text-sm text-text-secondary">Professor access required for gradebook.</CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-display-lg font-semibold tracking-tight">{title}</h1>
        <p className="mt-2 text-sm text-text-secondary">{subtitle}</p>
      </section>

      <Card>
        <CardHeader>
          <h2 className="text-heading font-semibold">Select section</h2>
        </CardHeader>
        <CardBody className="space-y-2">
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-11 w-full rounded-lg" stagger={0} />
              <Skeleton className="h-11 w-full rounded-lg" stagger={1} />
              <Skeleton className="h-11 w-3/4 rounded-lg" stagger={2} />
            </div>
          ) : sections.length === 0 ? (
            <p className="text-sm text-text-secondary">
              {isProfessor ? "No sections available." : "You have not joined any sections yet."}
            </p>
          ) : (
            sections.map((section) => (
              <Link
                key={section.id}
                href={buildHref(section.id)}
                className="group flex items-center justify-between rounded-lg border border-borderc bg-soft px-4 py-3 text-sm text-text transition-all duration-200 ease-out-expo hover:border-border-accent hover:bg-overlay hover:shadow-card-hover"
              >
                <div>
                  <span className="font-medium">{section.name}</span>
                  <span className="ml-2 text-xs text-text-secondary">
                    {section.course_id}
                    {section.term ? ` · ${section.term}` : ""}
                  </span>
                </div>
                <ArrowRight className="h-4 w-4 text-faint transition-all duration-200 ease-out-expo group-hover:translate-x-0.5 group-hover:text-accent" />
              </Link>
            ))
          )}
        </CardBody>
      </Card>
    </div>
  );
}
