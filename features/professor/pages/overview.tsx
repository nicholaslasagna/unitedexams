"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { courses } from "@/data/seed";
import { useAppData } from "@/lib/app-data-context";
import { useToast } from "@/lib/hooks/use-toast";
import {
  createProfessorSection,
  joinSectionByCode,
  listProfessorSections,
  regenerateJoinCode,
  type SectionSummary
} from "@/features/professor/api";
import { SectionCard } from "@/features/professor/components/section-card";

export function ProfessorOverviewPage() {
  const router = useRouter();
  const { push } = useToast();
  const { supabase, user, profile } = useAppData();

  const [sections, setSections] = useState<SectionSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const [newSectionName, setNewSectionName] = useState("");
  const [newTerm, setNewTerm] = useState("");
  const [newCourseId, setNewCourseId] = useState(courses[0]?.id ?? "");

  const [joinCode, setJoinCode] = useState("");

  const isProfessor = profile.role === "professor" || profile.role === "admin";

  const refresh = async () => {
    if (!supabase) return;
    setLoading(true);
    try {
      const nextSections = await listProfessorSections(supabase);
      setSections(nextSections);
    } catch {
      setSections([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!isProfessor) {
      setLoading(false);
      return;
    }
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isProfessor, supabase, user?.id]);

  const sortedCourses = useMemo(() => [...courses].sort((a, b) => a.name.localeCompare(b.name)), []);

  if (!isProfessor) {
    return (
      <Card>
        <CardBody className="space-y-3 p-8 text-center">
          <h1 className="font-display text-3xl font-semibold">Professor Access Required</h1>
          <p className="text-sm text-muted">
            This area is restricted to professor accounts. Request access from support@unitedexams.com.
          </p>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <section>
        <h1 className="font-display text-4xl font-semibold tracking-tight">Professor Dashboard</h1>
        <p className="mt-2 text-sm text-muted">Create sections, share join codes, and monitor class progress signals.</p>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <h2 className="font-display text-2xl font-semibold">Create section</h2>
          </CardHeader>
          <CardBody className="space-y-3">
            <Input placeholder="Section name (e.g., Diff Eq - Mon/Wed 9AM)" value={newSectionName} onChange={(e) => setNewSectionName(e.target.value)} />
            <Input placeholder="Term (e.g., Spring 2026)" value={newTerm} onChange={(e) => setNewTerm(e.target.value)} />
            <select
              className="h-11 rounded-[10px] border border-borderc bg-soft px-3 text-sm text-text"
              value={newCourseId}
              onChange={(event) => setNewCourseId(event.target.value)}
            >
              {sortedCourses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.code} · {course.name}
                </option>
              ))}
            </select>
            <Button
              onClick={async () => {
                if (!supabase || !user) return;
                if (!newSectionName.trim()) {
                  push({ title: "Section name is required", tone: "error" });
                  return;
                }

                try {
                  await createProfessorSection(supabase, {
                    name: newSectionName.trim(),
                    term: newTerm.trim() || undefined,
                    courseId: newCourseId,
                    createdBy: user.id
                  });
                  setNewSectionName("");
                  setNewTerm("");
                  push({ title: "Section created", tone: "success" });
                  refresh();
                } catch (error) {
                  push({ title: "Unable to create section", description: (error as Error).message, tone: "error" });
                }
              }}
            >
              Create section
            </Button>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="font-display text-2xl font-semibold">Join section by code</h2>
          </CardHeader>
          <CardBody className="space-y-3">
            <Input
              placeholder="Enter join code"
              value={joinCode}
              onChange={(event) => setJoinCode(event.target.value.toUpperCase())}
            />
            <Button
              variant="secondary"
              onClick={async () => {
                if (!supabase) return;
                if (!joinCode.trim()) return;
                try {
                  const sectionId = await joinSectionByCode(supabase, joinCode);
                  push({ title: "Joined section", tone: "success" });
                  router.push(`/app/professor/sections/${sectionId}`);
                } catch (error) {
                  push({ title: "Unable to join", description: (error as Error).message, tone: "error" });
                }
              }}
            >
              Join with code
            </Button>
          </CardBody>
        </Card>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-2xl font-semibold">Your sections</h2>
        {loading ? (
          <Card>
            <CardBody className="p-6 text-sm text-muted">Loading sections…</CardBody>
          </Card>
        ) : sections.length === 0 ? (
          <Card>
            <CardBody className="p-6 text-sm text-muted">No sections yet. Create one above to begin.</CardBody>
          </Card>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {sections.map((section) => (
              <SectionCard
                key={section.id}
                section={section}
                onCopy={(code) => {
                  navigator.clipboard.writeText(code);
                  push({ title: "Join code copied", tone: "success" });
                }}
                onRegenerate={async (sectionId) => {
                  if (!supabase) return;
                  try {
                    const nextCode = await regenerateJoinCode(supabase, sectionId);
                    push({ title: `New code: ${nextCode}`, tone: "success" });
                    refresh();
                  } catch (error) {
                    push({ title: "Unable to regenerate code", description: (error as Error).message, tone: "error" });
                  }
                }}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
