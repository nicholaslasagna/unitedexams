"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Plus, ShieldCheck, Trash2 } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppData } from "@/lib/app-data-context";
import { isVerifiedProfessor } from "@/lib/auth/roles";
import { useToast } from "@/lib/hooks/use-toast";
import {
  deleteProfessorQuizSet,
  listCourseQuizSetsForProfessorTools,
  listProfessorSections,
  type SectionQuizSetOption
} from "@/features/professor/api";
import {
  createExam,
  deleteExam,
  listSectionExams,
  upsertExamAccessRules,
  type ExamMode,
  type ShowResultsAfter
} from "@/features/exams/api";

export function ProfessorSectionExamsPage({ sectionId }: { sectionId?: string } = {}) {
  const searchParams = useSearchParams();
  const params = useParams<{ sectionId?: string; id?: string }>();
  const resolvedSectionId = sectionId ?? params.sectionId ?? params.id ?? "";
  const createdQuizSetId = searchParams.get("newQuizSet") ?? "";
  const { supabase, user, profile } = useAppData();
  const { push } = useToast();
  const isProfessor = isVerifiedProfessor(profile);

  const [sectionName, setSectionName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingExamId, setDeletingExamId] = useState<string | null>(null);
  const [deletingQuizSetId, setDeletingQuizSetId] = useState<string | null>(null);
  const [exams, setExams] = useState<
    Array<{
      id: string;
      title: string;
      starts_at: string;
      ends_at: string;
      duration_minutes: number;
      published: boolean;
      show_results_after: string;
    }>
  >([]);
  const [quizSets, setQuizSets] = useState<SectionQuizSetOption[]>([]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [quizSetId, setQuizSetId] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("60");
  const [attemptLimit, setAttemptLimit] = useState("1");
  const [mode, setMode] = useState<ExamMode>("timed");
  const [showResultsAfter, setShowResultsAfter] = useState<ShowResultsAfter>("window_close");
  const [shuffleQuestions, setShuffleQuestions] = useState(true);
  const [shuffleOptions, setShuffleOptions] = useState(true);
  const [published, setPublished] = useState(false);
  const [requireProctorCode, setRequireProctorCode] = useState(true);
  const [proctorCode, setProctorCode] = useState("");
  const [requireNetworkAllowlist, setRequireNetworkAllowlist] = useState(false);
  const [allowMobileHotspot, setAllowMobileHotspot] = useState(false);
  const [blockVpn, setBlockVpn] = useState(false);
  const [lockdownMode, setLockdownMode] = useState(true);
  const [openNotesAllowed, setOpenNotesAllowed] = useState(false);
  const [suspicionThreshold, setSuspicionThreshold] = useState("100");

  const minimumStartIso = useMemo(() => new Date().toISOString().slice(0, 16), []);

  const refresh = async () => {
    if (!supabase || !resolvedSectionId || !isProfessor) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const sections = await listProfessorSections(supabase);
      const section = sections.find((row) => row.id === resolvedSectionId) ?? null;
      setSectionName(section?.name ?? "Section");

      const examRows = await listSectionExams(supabase, resolvedSectionId);
      setExams(examRows);

      if (section) {
        try {
          const mapped = await listCourseQuizSetsForProfessorTools(
            supabase,
            section.course_id,
            resolvedSectionId
          );
          setQuizSets(mapped);
          setQuizSetId((current) => {
            if (createdQuizSetId && mapped.some((row) => row.id === createdQuizSetId)) {
              return createdQuizSetId;
            }
            if (current && mapped.some((row) => row.id === current)) {
              return current;
            }
            return mapped[0]?.id ?? "";
          });
        } catch {
          setQuizSets([]);
        }
      }
    } catch {
      setExams([]);
      setQuizSets([]);
      setSectionName("Section");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [createdQuizSetId, resolvedSectionId, supabase, user?.id, isProfessor]);

  const highlightedQuizSet = useMemo(
    () => quizSets.find((set) => set.id === createdQuizSetId) ?? null,
    [quizSets, createdQuizSetId]
  );

  if (!isProfessor) {
    return (
      <Card>
        <CardBody className="p-8 text-center text-sm text-muted">
          Professor access required.
        </CardBody>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardBody className="p-8 text-sm text-muted">Loading exams…</CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-4xl font-semibold tracking-tight">Section Exams</h1>
          <p className="mt-2 text-sm text-muted">{sectionName}</p>
        </div>
        <Button variant="secondary" asChild>
          <Link href={`/app/sections/${resolvedSectionId}`}>Back to section</Link>
        </Button>
      </section>

      <Card>
        <CardHeader>
          <h2 className="font-display text-2xl font-semibold">Create timed exam</h2>
        </CardHeader>
        <CardBody className="space-y-4">
          {highlightedQuizSet ? (
            <div className="rounded-xl border border-accent/45 bg-accent/10 px-4 py-3 text-sm text-text">
              <p className="font-semibold">New set ready for exam design</p>
              <p className="mt-1 text-xs text-muted">
                {highlightedQuizSet.title} has been selected below so you can turn it into an exam immediately.
              </p>
            </div>
          ) : null}
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Title</label>
              <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Exam 2 — Midterm Simulation" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Quiz set</label>
              <select
                className="h-11 w-full rounded-[10px] border border-borderc bg-soft px-3 text-sm text-text"
                value={quizSetId}
                onChange={(event) => setQuizSetId(event.target.value)}
              >
                {quizSets.map((set) => (
                  <option key={set.id} value={set.id}>
                    {set.title} ({set.mode ?? "quiz"} · {set.est_minutes}m)
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Description</label>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="min-h-24 w-full rounded-[10px] border border-borderc bg-soft px-3 py-2 text-sm text-text outline-none focus-visible:ring-2 focus-visible:ring-accent/55"
              placeholder="Proctored timed assessment. Academic honesty policy applies."
            />
          </div>

          <div className="grid gap-3 md:grid-cols-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Starts at</label>
              <Input
                type="datetime-local"
                min={minimumStartIso}
                value={startsAt}
                onChange={(event) => setStartsAt(event.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Ends at</label>
              <Input type="datetime-local" value={endsAt} onChange={(event) => setEndsAt(event.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Duration (min)</label>
              <Input
                value={durationMinutes}
                onChange={(event) => setDurationMinutes(event.target.value.replace(/[^0-9]/g, ""))}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Attempt limit</label>
              <Input
                value={attemptLimit}
                onChange={(event) => setAttemptLimit(event.target.value.replace(/[^0-9]/g, ""))}
              />
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Mode</label>
              <select
                className="h-11 w-full rounded-[10px] border border-borderc bg-soft px-3 text-sm text-text"
                value={mode}
                onChange={(event) => setMode(event.target.value as ExamMode)}
              >
                <option value="timed">timed</option>
                <option value="practice">practice</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Results release</label>
              <select
                className="h-11 w-full rounded-[10px] border border-borderc bg-soft px-3 text-sm text-text"
                value={showResultsAfter}
                onChange={(event) => setShowResultsAfter(event.target.value as ShowResultsAfter)}
              >
                <option value="immediate">immediate</option>
                <option value="window_close">window_close</option>
                <option value="manual_release">manual_release</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Suspicion threshold</label>
              <Input
                value={suspicionThreshold}
                onChange={(event) => setSuspicionThreshold(event.target.value.replace(/[^0-9]/g, ""))}
              />
            </div>
          </div>

          <div className="grid gap-2 md:grid-cols-2">
            <label className="flex items-center gap-2 text-sm text-muted">
              <input type="checkbox" checked={shuffleQuestions} onChange={(event) => setShuffleQuestions(event.target.checked)} className="h-4 w-4 accent-[hsl(var(--brand-2))]" />
              Shuffle questions
            </label>
            <label className="flex items-center gap-2 text-sm text-muted">
              <input type="checkbox" checked={shuffleOptions} onChange={(event) => setShuffleOptions(event.target.checked)} className="h-4 w-4 accent-[hsl(var(--brand-2))]" />
              Shuffle options
            </label>
            <label className="flex items-center gap-2 text-sm text-muted">
              <input type="checkbox" checked={published} onChange={(event) => setPublished(event.target.checked)} className="h-4 w-4 accent-[hsl(var(--brand-2))]" />
              Published
            </label>
            <label className="flex items-center gap-2 text-sm text-muted">
              <input type="checkbox" checked={lockdownMode} onChange={(event) => setLockdownMode(event.target.checked)} className="h-4 w-4 accent-[hsl(var(--brand-2))]" />
              Lockdown mode
            </label>
            <label className="flex items-center gap-2 text-sm text-muted">
              <input type="checkbox" checked={openNotesAllowed} onChange={(event) => setOpenNotesAllowed(event.target.checked)} className="h-4 w-4 accent-[hsl(var(--brand-2))]" />
              Open notes allowed
            </label>
          </div>

          <div className="rounded-xl border border-borderc bg-soft p-3">
            <div className="grid gap-2 md:grid-cols-2">
              <label className="flex items-center gap-2 text-sm text-muted">
                <input type="checkbox" checked={requireProctorCode} onChange={(event) => setRequireProctorCode(event.target.checked)} className="h-4 w-4 accent-[hsl(var(--brand-2))]" />
                Require proctor code
              </label>
              <label className="flex items-center gap-2 text-sm text-muted">
                <input type="checkbox" checked={requireNetworkAllowlist} onChange={(event) => setRequireNetworkAllowlist(event.target.checked)} className="h-4 w-4 accent-[hsl(var(--brand-2))]" />
                Require network allowlist
              </label>
              <label className="flex items-center gap-2 text-sm text-muted">
                <input type="checkbox" checked={allowMobileHotspot} onChange={(event) => setAllowMobileHotspot(event.target.checked)} className="h-4 w-4 accent-[hsl(var(--brand-2))]" />
                Allow mobile hotspot (advisory)
              </label>
              <label className="flex items-center gap-2 text-sm text-muted">
                <input type="checkbox" checked={blockVpn} onChange={(event) => setBlockVpn(event.target.checked)} className="h-4 w-4 accent-[hsl(var(--brand-2))]" />
                Block VPN (best effort warning)
              </label>
            </div>
            <div className="mt-2 space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Proctor code</label>
              <Input value={proctorCode} onChange={(event) => setProctorCode(event.target.value)} placeholder="Enter secret code for exam start" />
            </div>
          </div>

          <Button
            loading={saving}
            onClick={async () => {
              if (!supabase || !user) return;
              if (!title.trim()) {
                push({ title: "Title is required", tone: "error" });
                return;
              }
              if (!quizSetId) {
                push({ title: "Select a quiz set", tone: "error" });
                return;
              }
              if (!startsAt || !endsAt) {
                push({ title: "Exam window is required", tone: "error" });
                return;
              }
              if (new Date(endsAt).getTime() <= new Date(startsAt).getTime()) {
                push({ title: "End time must be after start time", tone: "error" });
                return;
              }

              setSaving(true);
              try {
                const exam = await createExam(supabase, {
                  section_id: resolvedSectionId,
                  title: title.trim(),
                  description: description.trim() || null,
                  quiz_set_id: quizSetId,
                  mode,
                  starts_at: new Date(startsAt).toISOString(),
                  ends_at: new Date(endsAt).toISOString(),
                  duration_minutes: Math.max(1, Number(durationMinutes || 60)),
                  attempt_limit: Math.max(1, Number(attemptLimit || 1)),
                  shuffle_questions: shuffleQuestions,
                  shuffle_options: shuffleOptions,
                  show_results_after: showResultsAfter,
                  published,
                  created_by: user.id
                });

                await upsertExamAccessRules(supabase, {
                  examId: exam.id,
                  requireSectionMembership: true,
                  requireProctorCode,
                  proctorCode: proctorCode.trim() || undefined,
                  clearProctorCode: false,
                  requireNetworkAllowlist,
                  allowMobileHotspot,
                  blockVpn,
                  lockdownMode,
                  suspicionThreshold: Math.max(20, Number(suspicionThreshold || 100)),
                  openNotesAllowed
                });

                setTitle("");
                setDescription("");
                setStartsAt("");
                setEndsAt("");
                setProctorCode("");
                setPublished(false);
                setOpenNotesAllowed(false);
                push({ title: "Exam created", tone: "success" });
                await refresh();
              } catch (error) {
                push({ title: "Unable to create exam", description: (error as Error).message, tone: "error" });
              } finally {
                setSaving(false);
              }
            }}
          >
            <Plus className="h-4 w-4" />
            Create exam
          </Button>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="font-display text-2xl font-semibold">Available exam and quiz sets</h2>
        </CardHeader>
        <CardBody className="space-y-3">
          {quizSets.length === 0 ? (
            <p className="rounded-xl border border-dashed border-borderc bg-soft px-4 py-3 text-sm text-muted">
              Build a quiz, homework, or exam set first. It will appear here as soon as it saves.
            </p>
          ) : (
            quizSets.map((set) => {
              const isHighlighted = set.id === createdQuizSetId;
              return (
                <article
                  key={set.id}
                  className={`rounded-xl border px-4 py-3 ${
                    isHighlighted ? "border-accent/55 bg-accent/10" : "border-borderc bg-soft"
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-base font-semibold text-text">{set.title}</p>
                      <p className="mt-1 text-xs text-muted">
                        {(set.mode ?? "quiz").toUpperCase()} · {set.est_minutes}m
                        {set.professorBuilt ? " · Professor-built" : " · Study library"}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant={quizSetId === set.id ? "primary" : "secondary"}
                        onClick={() => setQuizSetId(set.id)}
                      >
                        {quizSetId === set.id ? "Selected for exam" : "Use for exam"}
                      </Button>
                      <Button size="sm" variant="secondary" asChild>
                        <Link href={`/quiz/${set.id}?section=${resolvedSectionId}`}>Preview set</Link>
                      </Button>
                      {set.professorBuilt ? (
                        <Button
                          size="sm"
                          variant="danger"
                          loading={deletingQuizSetId === set.id}
                          loadingLabel="Deleting..."
                          onClick={async () => {
                            if (!supabase) return;
                            const confirmed = window.confirm(
                              "Delete this set? This removes its questions and any linked assignments, attempts, and timed exams."
                            );
                            if (!confirmed) return;
                            setDeletingQuizSetId(set.id);
                            try {
                              await deleteProfessorQuizSet(supabase, set.id);
                              push({ title: "Quiz set deleted", tone: "success" });
                              if (quizSetId === set.id) {
                                setQuizSetId("");
                              }
                              await refresh();
                            } catch (error) {
                              push({
                                title: "Unable to delete quiz set",
                                description: (error as Error).message,
                                tone: "error"
                              });
                            } finally {
                              setDeletingQuizSetId(null);
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete set
                        </Button>
                      ) : null}
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="font-display text-2xl font-semibold">Published and draft exams</h2>
        </CardHeader>
        <CardBody className="space-y-3">
          {exams.length === 0 ? (
            <p className="rounded-xl border border-dashed border-borderc bg-soft px-4 py-3 text-sm text-muted">
              No exams created yet.
            </p>
          ) : (
            exams.map((exam) => (
              <article key={exam.id} className="rounded-xl border border-borderc bg-soft px-4 py-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-base font-semibold text-text">{exam.title}</p>
                    <p className="text-xs text-muted">
                      {new Date(exam.starts_at).toLocaleString()} → {new Date(exam.ends_at).toLocaleString()} • {exam.duration_minutes}m
                    </p>
                  </div>
                  <div className="rounded-full border border-borderc px-2 py-1 text-xs text-muted">
                    {exam.published ? "Published" : "Draft"} · {exam.show_results_after}
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button size="sm" variant="secondary" asChild>
                    <Link href={`/app/professor/exams/${exam.id}/edit`}>Edit</Link>
                  </Button>
                  <Button size="sm" variant="secondary" asChild>
                    <Link href={`/app/professor/exams/${exam.id}/monitor`}>Monitor</Link>
                  </Button>
                  <Button size="sm" variant="secondary" asChild>
                    <Link href={`/app/professor/exams/${exam.id}/results`}>Results</Link>
                  </Button>
                  <Button size="sm" asChild>
                    <Link href={`/app/exams/${exam.id}`}>
                      <ShieldCheck className="h-4 w-4" />
                      Student view
                    </Link>
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    loading={deletingExamId === exam.id}
                    loadingLabel="Deleting..."
                    onClick={async () => {
                      if (!supabase) return;
                      const confirmed = window.confirm(
                        "Delete this exam? Attempts, monitoring events, and access rules will be removed."
                      );
                      if (!confirmed) return;
                      setDeletingExamId(exam.id);
                      try {
                        await deleteExam(supabase, exam.id);
                        push({ title: "Exam deleted", tone: "success" });
                        await refresh();
                      } catch (error) {
                        push({
                          title: "Unable to delete exam",
                          description: (error as Error).message,
                          tone: "error"
                        });
                      } finally {
                        setDeletingExamId(null);
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </article>
            ))
          )}
        </CardBody>
      </Card>
    </div>
  );
}
