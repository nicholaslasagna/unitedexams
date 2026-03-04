"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PlusCircle } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppData } from "@/lib/app-data-context";
import { useToast } from "@/lib/hooks/use-toast";
import {
  addCurrentNetworkAllowlist,
  getExam,
  getExamAccessRules,
  removeAllowedNetwork,
  updateExam,
  upsertExamAccessRules,
  type ExamMode,
  type ShowResultsAfter
} from "@/features/exams/api";

function maskHash(hash: string) {
  if (!hash) return hash;
  if (hash.length <= 14) return hash;
  return `${hash.slice(0, 8)}…${hash.slice(-6)}`;
}

export function ProfessorExamEditPage({ examId }: { examId: string }) {
  const { supabase, profile } = useAppData();
  const { push } = useToast();
  const isProfessor = profile.role === "professor" || profile.role === "admin";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [sectionId, setSectionId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [mode, setMode] = useState<ExamMode>("timed");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("60");
  const [attemptLimit, setAttemptLimit] = useState("1");
  const [shuffleQuestions, setShuffleQuestions] = useState(true);
  const [shuffleOptions, setShuffleOptions] = useState(true);
  const [showResultsAfter, setShowResultsAfter] = useState<ShowResultsAfter>("window_close");
  const [published, setPublished] = useState(false);

  const [requireSectionMembership, setRequireSectionMembership] = useState(true);
  const [requireProctorCode, setRequireProctorCode] = useState(true);
  const [proctorCode, setProctorCode] = useState("");
  const [clearProctorCode, setClearProctorCode] = useState(false);
  const [requireNetworkAllowlist, setRequireNetworkAllowlist] = useState(false);
  const [allowMobileHotspot, setAllowMobileHotspot] = useState(false);
  const [blockVpn, setBlockVpn] = useState(false);
  const [lockdownMode, setLockdownMode] = useState(true);
  const [suspicionThreshold, setSuspicionThreshold] = useState("100");
  const [allowedNetworkHashes, setAllowedNetworkHashes] = useState<string[]>([]);
  const [networkBusyHash, setNetworkBusyHash] = useState<string | null>(null);

  const refresh = async () => {
    if (!supabase) return;
    setLoading(true);
    try {
      const [exam, access] = await Promise.all([
        getExam(supabase, examId),
        getExamAccessRules(supabase, examId)
      ]);

      if (!exam) {
        throw new Error("Exam not found.");
      }

      setSectionId(exam.section_id);
      setTitle(exam.title);
      setDescription(exam.description ?? "");
      setMode(exam.mode);
      setStartsAt(exam.starts_at.slice(0, 16));
      setEndsAt(exam.ends_at.slice(0, 16));
      setDurationMinutes(String(exam.duration_minutes));
      setAttemptLimit(String(exam.attempt_limit));
      setShuffleQuestions(exam.shuffle_questions);
      setShuffleOptions(exam.shuffle_options);
      setShowResultsAfter(exam.show_results_after);
      setPublished(exam.published);

      if (access) {
        setRequireSectionMembership(access.require_section_membership);
        setRequireProctorCode(access.require_proctor_code);
        setRequireNetworkAllowlist(access.require_network_allowlist);
        setAllowMobileHotspot(access.allow_mobile_hotspot);
        setBlockVpn(access.block_vpn);
        setLockdownMode(access.lockdown_mode);
        setSuspicionThreshold(String(access.suspicion_threshold));
        setAllowedNetworkHashes(access.allowed_ip_hashes);
      } else {
        setAllowedNetworkHashes([]);
      }
    } catch (error) {
      push({ title: "Unable to load exam", description: (error as Error).message, tone: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [examId, supabase]);

  if (!isProfessor) {
    return (
      <Card>
        <CardBody className="p-8 text-center text-sm text-muted">Professor access required.</CardBody>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardBody className="p-8 text-sm text-muted">Loading exam configuration…</CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-4xl font-semibold tracking-tight">Edit Exam</h1>
          <p className="mt-2 text-sm text-muted">Section: {sectionId}</p>
        </div>
        <Button variant="secondary" asChild>
          <Link href={`/app/professor/sections/${sectionId}/exams`}>Back to section exams</Link>
        </Button>
      </section>

      <Card>
        <CardHeader>
          <h2 className="font-display text-2xl font-semibold">Exam settings</h2>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Exam title" />
            <select
              className="h-11 w-full rounded-[10px] border border-borderc bg-soft px-3 text-sm text-text"
              value={mode}
              onChange={(event) => setMode(event.target.value as ExamMode)}
            >
              <option value="timed">timed</option>
              <option value="practice">practice</option>
            </select>
          </div>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className="min-h-24 w-full rounded-[10px] border border-borderc bg-soft px-3 py-2 text-sm text-text outline-none focus-visible:ring-2 focus-visible:ring-accent/55"
            placeholder="Exam description"
          />
          <div className="grid gap-3 md:grid-cols-4">
            <Input type="datetime-local" value={startsAt} onChange={(event) => setStartsAt(event.target.value)} />
            <Input type="datetime-local" value={endsAt} onChange={(event) => setEndsAt(event.target.value)} />
            <Input value={durationMinutes} onChange={(event) => setDurationMinutes(event.target.value.replace(/[^0-9]/g, ""))} />
            <Input value={attemptLimit} onChange={(event) => setAttemptLimit(event.target.value.replace(/[^0-9]/g, ""))} />
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
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <select
              className="h-11 w-full rounded-[10px] border border-borderc bg-soft px-3 text-sm text-text"
              value={showResultsAfter}
              onChange={(event) => setShowResultsAfter(event.target.value as ShowResultsAfter)}
            >
              <option value="immediate">immediate</option>
              <option value="window_close">window_close</option>
              <option value="manual_release">manual_release</option>
            </select>
            <Input
              value={suspicionThreshold}
              onChange={(event) => setSuspicionThreshold(event.target.value.replace(/[^0-9]/g, ""))}
              placeholder="Suspicion threshold"
            />
          </div>

          <div className="rounded-xl border border-borderc bg-soft p-3">
            <div className="grid gap-2 md:grid-cols-2">
              <label className="flex items-center gap-2 text-sm text-muted">
                <input type="checkbox" checked={requireSectionMembership} onChange={(event) => setRequireSectionMembership(event.target.checked)} className="h-4 w-4 accent-[hsl(var(--brand-2))]" />
                Require section membership
              </label>
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
                Block VPN (best effort)
              </label>
            </div>
            <div className="mt-2 space-y-2">
              <Input value={proctorCode} onChange={(event) => setProctorCode(event.target.value)} placeholder="Set new proctor code (leave blank to keep current)" />
              <label className="flex items-center gap-2 text-sm text-muted">
                <input type="checkbox" checked={clearProctorCode} onChange={(event) => setClearProctorCode(event.target.checked)} className="h-4 w-4 accent-[hsl(var(--brand-2))]" />
                Clear existing proctor code
              </label>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              loading={saving}
              onClick={async () => {
                if (!supabase) return;
                if (!title.trim()) {
                  push({ title: "Title is required", tone: "error" });
                  return;
                }
                if (!startsAt || !endsAt) {
                  push({ title: "Exam window is required", tone: "error" });
                  return;
                }
                setSaving(true);
                try {
                  await updateExam(supabase, examId, {
                    title: title.trim(),
                    description: description.trim() || null,
                    mode,
                    starts_at: new Date(startsAt).toISOString(),
                    ends_at: new Date(endsAt).toISOString(),
                    duration_minutes: Math.max(1, Number(durationMinutes || 60)),
                    attempt_limit: Math.max(1, Number(attemptLimit || 1)),
                    shuffle_questions: shuffleQuestions,
                    shuffle_options: shuffleOptions,
                    show_results_after: showResultsAfter,
                    published
                  });

                  await upsertExamAccessRules(supabase, {
                    examId,
                    requireSectionMembership,
                    requireProctorCode,
                    proctorCode: proctorCode.trim() || undefined,
                    clearProctorCode,
                    requireNetworkAllowlist,
                    allowMobileHotspot,
                    blockVpn,
                    lockdownMode,
                    suspicionThreshold: Math.max(20, Number(suspicionThreshold || 100))
                  });

                  setClearProctorCode(false);
                  setProctorCode("");
                  push({ title: "Exam updated", tone: "success" });
                  await refresh();
                } catch (error) {
                  push({ title: "Unable to update exam", description: (error as Error).message, tone: "error" });
                } finally {
                  setSaving(false);
                }
              }}
            >
              Save changes
            </Button>

            <Button
              variant="secondary"
              onClick={async () => {
                setNetworkBusyHash("adding");
                try {
                  await addCurrentNetworkAllowlist(examId);
                  push({ title: "Current network added", tone: "success" });
                  await refresh();
                } catch (error) {
                  push({ title: "Unable to add network", description: (error as Error).message, tone: "error" });
                } finally {
                  setNetworkBusyHash(null);
                }
              }}
              loading={networkBusyHash === "adding"}
            >
              <PlusCircle className="h-4 w-4" />
              Add current network
            </Button>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="font-display text-2xl font-semibold">Allowed networks</h2>
        </CardHeader>
        <CardBody className="space-y-2">
          {allowedNetworkHashes.length === 0 ? (
            <p className="rounded-xl border border-dashed border-borderc bg-soft px-3 py-2 text-sm text-muted">
              No allowed network hashes yet.
            </p>
          ) : (
            allowedNetworkHashes.map((hash) => (
              <div key={hash} className="flex items-center justify-between rounded-xl border border-borderc bg-soft px-3 py-2 text-sm">
                <span className="font-mono text-text">{maskHash(hash)}</span>
                <Button
                  size="sm"
                  variant="ghost"
                  loading={networkBusyHash === hash}
                  onClick={async () => {
                    setNetworkBusyHash(hash);
                    try {
                      await removeAllowedNetwork(examId, hash);
                      push({ title: "Network removed", tone: "success" });
                      await refresh();
                    } catch (error) {
                      push({ title: "Unable to remove network", description: (error as Error).message, tone: "error" });
                    } finally {
                      setNetworkBusyHash(null);
                    }
                  }}
                >
                  Remove
                </Button>
              </div>
            ))
          )}
        </CardBody>
      </Card>
    </div>
  );
}
