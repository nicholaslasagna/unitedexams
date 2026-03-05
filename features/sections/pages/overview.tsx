"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAppData } from "@/lib/app-data-context";
import { isUniversityAdmin, isVerifiedProfessor } from "@/lib/auth/roles";
import { listJoinedSections, type JoinedSectionSummary } from "@/features/professor/api";
import { ProfessorOverviewPage } from "@/features/professor/pages/overview";

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
        setSelectedSectionId((current) => (current && rows.some((row) => row.sectionId === current) ? current : rows[0]?.sectionId ?? ""));
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

  if (isProfessor) {
    return <ProfessorOverviewPage />;
  }

  if (isSchoolAdmin) {
    return (
      <Card>
        <CardBody className="p-8 text-sm text-muted">
          Section workspace is available for students and professors.
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-display-lg font-semibold tracking-tight">Sections</h1>
        <p className="mt-2 text-sm text-text-secondary">
          Open your enrolled classes and jump directly to posted course materials.
        </p>
      </section>

      <Card>
        <CardHeader>
          <h2 className="text-heading font-semibold">Your class sections</h2>
        </CardHeader>
        <CardBody className="space-y-3">
          {loading ? (
            <p className="text-sm text-muted">Loading sections…</p>
          ) : joinedSections.length === 0 ? (
            <p className="text-sm text-muted">You have not joined any sections yet. Join one from Account.</p>
          ) : (
            <>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Select class</label>
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
              </div>

              {selectedSection ? (
                <div className="rounded-xl border border-borderc bg-soft p-4">
                  <p className="font-semibold text-text">{selectedSection.sectionName}</p>
                  <p className="mt-1 text-xs text-muted">
                    {selectedSection.courseId}
                    {selectedSection.term ? ` · ${selectedSection.term}` : ""}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button asChild>
                      <Link href={`/app/sections/${selectedSection.sectionId}/materials`}>Open materials</Link>
                    </Button>
                    <Button variant="secondary" asChild>
                      <Link href={`/app/sections/${selectedSection.sectionId}`}>Open homework</Link>
                    </Button>
                    <Button variant="ghost" asChild>
                      <Link href={`/app/announcements?section=${selectedSection.sectionId}`}>Announcements</Link>
                    </Button>
                  </div>
                </div>
              ) : null}
            </>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
