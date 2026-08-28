"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowDown, ArrowLeft, ArrowUp, Copy, Eye, EyeOff, Plus, Trash2 } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAppData } from "@/lib/app-data-context";
import { isVerifiedProfessor } from "@/lib/auth/roles";
import { useToast } from "@/lib/hooks/use-toast";
import {
  createProfessorQuizSet,
  listProfessorSections,
  type CreateProfessorQuizSetPayload,
  type SectionSummary
} from "@/features/professor/api";

type BuilderQuestionType = "single" | "multi" | "fill" | "free";

interface BuilderQuestion {
  id: string;
  type: BuilderQuestionType;
  prompt: string;
  options: string[];
  correctIndexes: number[];
  acceptableAnswers: string[];
  explanation: string;
  tags: string;
}

function makeQuestion(type: BuilderQuestionType = "single"): BuilderQuestion {
  return {
    id: crypto.randomUUID(),
    type,
    prompt: "",
    options: ["", ""],
    correctIndexes: type === "single" ? [0] : [],
    acceptableAnswers: [""],
    explanation: "",
    tags: ""
  };
}

function isBlankQuestion(question: BuilderQuestion) {
  const hasOptions = question.options.some((value) => value.trim().length > 0);
  const hasAnswers = question.acceptableAnswers.some((value) => value.trim().length > 0);
  return (
    question.prompt.trim().length === 0 &&
    question.explanation.trim().length === 0 &&
    question.tags.trim().length === 0 &&
    !hasOptions &&
    !hasAnswers
  );
}

function normalizeTags(value: string) {
  return value
    .split(",")
    .map((tag) => tag.trim().toLowerCase())
    .filter((tag) => tag.length > 0)
    .slice(0, 8);
}

function parseCorrectSpec(input: string, optionCount: number) {
  const tokens = input
    .split(/[,\s]+/)
    .map((token) => token.trim())
    .filter((token) => token.length > 0);
  const parsed: number[] = [];

  for (const token of tokens) {
    if (/^[a-z]$/i.test(token)) {
      const idx = token.toUpperCase().charCodeAt(0) - 65;
      if (idx >= 0 && idx < optionCount) parsed.push(idx);
      continue;
    }

    if (/^\d+$/.test(token)) {
      const numeric = Number(token);
      const idx = numeric === 0 ? 0 : numeric - 1;
      if (idx >= 0 && idx < optionCount) parsed.push(idx);
    }
  }

  return Array.from(new Set(parsed));
}

function parseImportedQuestions(rawInput: string) {
  const lines = rawInput.split(/\r?\n/);
  const questions: BuilderQuestion[] = [];
  const errors: string[] = [];
  let current: BuilderQuestion | null = null;
  let currentStartedAt = 1;

  const finalizeCurrent = () => {
    if (!current) return;
    const question = current;

    question.prompt = question.prompt.trim();
    question.explanation = question.explanation.trim();
    question.tags = question.tags.trim();

    if (!question.prompt) {
      errors.push(`Line ${currentStartedAt}: question prompt is missing.`);
    }

    if (question.type === "single" || question.type === "multi") {
      question.options = question.options.map((value) => value.trim()).filter((value) => value.length > 0);
      question.correctIndexes = Array.from(new Set(question.correctIndexes))
        .filter((idx) => idx >= 0 && idx < question.options.length)
        .sort((a, b) => a - b);

      if (question.options.length < 2) {
        errors.push(`Line ${currentStartedAt}: multiple choice/select-all questions need at least 2 options.`);
      }
      if (question.correctIndexes.length === 0) {
        errors.push(`Line ${currentStartedAt}: mark at least one correct option (use [x], *, +, or "correct:").`);
      }
      if (question.type === "single" && question.correctIndexes.length > 1) {
        errors.push(`Line ${currentStartedAt}: multiple choice can only have one correct answer.`);
      }
    }

    if (question.type === "fill") {
      question.acceptableAnswers = question.acceptableAnswers
        .map((value) => value.trim().toLowerCase())
        .filter((value) => value.length > 0);
      if (question.acceptableAnswers.length === 0) {
        errors.push(`Line ${currentStartedAt}: fill-in-the-blank needs at least one acceptable answer.`);
      }
      question.options = [];
      question.correctIndexes = [];
    }

    if (question.type === "free") {
      question.options = [];
      question.correctIndexes = [];
      question.acceptableAnswers = [];
    }

    questions.push(question);
    current = null;
  };

  const startQuestion = (type: BuilderQuestionType, lineNo: number) => {
    finalizeCurrent();
    current = makeQuestion(type);
    current.options = [];
    current.correctIndexes = [];
    current.acceptableAnswers = [];
    currentStartedAt = lineNo;
  };

  lines.forEach((rawLine, lineIndex) => {
    const lineNo = lineIndex + 1;
    const line = rawLine.trim();
    if (!line) return;

    const normalized = line.toLowerCase().replace(/\s+/g, "");
    if (normalized === "-mc" || normalized === "mc") {
      startQuestion("single", lineNo);
      return;
    }
    if (normalized === "-sata" || normalized === "sata") {
      startQuestion("multi", lineNo);
      return;
    }
    if (normalized === "-fib" || normalized === "fib") {
      startQuestion("fill", lineNo);
      return;
    }
    if (normalized === "-frq" || normalized === "frq") {
      startQuestion("free", lineNo);
      return;
    }

    if (!current) {
      startQuestion("single", lineNo);
    }

    if (!current) return;

    if (/^tags?\s*[:=-]/i.test(line)) {
      current.tags = line.replace(/^tags?\s*[:=-]\s*/i, "");
      return;
    }

    if (/^exp(?:lanation)?\s*[:=-]/i.test(line)) {
      current.explanation = line.replace(/^exp(?:lanation)?\s*[:=-]\s*/i, "");
      return;
    }

    if (/^correct\s*[:=-]/i.test(line) && (current.type === "single" || current.type === "multi")) {
      const spec = line.replace(/^correct\s*[:=-]\s*/i, "");
      current.correctIndexes = parseCorrectSpec(spec, current.options.length);
      return;
    }

    if (line.startsWith("--")) {
      current.prompt = line.replace(/^--\s*/, "");
      return;
    }

    if (/^(q|question)\s*[:=-]/i.test(line)) {
      current.prompt = line.replace(/^(q|question)\s*[:=-]\s*/i, "");
      return;
    }

    if (current.type === "single" || current.type === "multi") {
      if (/^\-\s*/.test(line)) {
        let option = line.replace(/^\-\s*/, "");
        let isCorrect = false;

        if (/^\[[xX]\]\s*/.test(option)) {
          isCorrect = true;
          option = option.replace(/^\[[xX]\]\s*/, "");
        } else if (/^\(x\)\s*/i.test(option)) {
          isCorrect = true;
          option = option.replace(/^\(x\)\s*/i, "");
        } else if (/^\*\s*/.test(option)) {
          isCorrect = true;
          option = option.replace(/^\*\s*/, "");
        } else if (/^\+\s*/.test(option)) {
          isCorrect = true;
          option = option.replace(/^\+\s*/, "");
        }

        const clean = option.trim();
        if (clean.length > 0) {
          const optionIndex = current.options.length;
          current.options.push(clean);
          if (isCorrect) {
            current.correctIndexes.push(optionIndex);
          }
        }
        return;
      }
    }

    if (current.type === "fill") {
      if (/^(?:-|ans(?:wer)?\s*[:=-])/i.test(line)) {
        const cleaned = line
          .replace(/^\-\s*/, "")
          .replace(/^ans(?:wer)?\s*[:=-]\s*/i, "")
          .trim();
        if (cleaned.length > 0) {
          const answers = cleaned
            .split("|")
            .map((value) => value.trim())
            .filter((value) => value.length > 0);
          current.acceptableAnswers.push(...answers);
        }
        return;
      }
    }

    if (!current.prompt) {
      current.prompt = line;
      return;
    }

    current.explanation = current.explanation
      ? `${current.explanation}\n${line}`
      : line;
  });

  finalizeCurrent();

  if (questions.length === 0) {
    errors.push("No questions detected. Use -mc, -sata, -fib, or -frq blocks.");
  }

  return { questions, errors };
}

export function ProfessorQuizBuilderPage({ sectionId }: { sectionId?: string } = {}) {
  const params = useParams<{ id?: string; sectionId?: string }>();
  const router = useRouter();
  const { push } = useToast();
  const { supabase, profile } = useAppData();
  const resolvedSectionId = sectionId ?? params.sectionId ?? params.id ?? "";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [section, setSection] = useState<SectionSummary | null>(null);

  const [title, setTitle] = useState("Quiz 1");
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState<"intro" | "medium" | "hard">("medium");
  const [estMinutes, setEstMinutes] = useState("20");
  const [mode, setMode] = useState<"quiz" | "exam" | "homework">("quiz");
  const [tags, setTags] = useState("");
  const [questions, setQuestions] = useState<BuilderQuestion[]>([makeQuestion("single")]);
  const [bulkInput, setBulkInput] = useState("");
  const [bulkErrors, setBulkErrors] = useState<string[]>([]);

  const isProfessor = isVerifiedProfessor(profile);

  useEffect(() => {
    if (!supabase || !resolvedSectionId || !isProfessor) {
      setLoading(false);
      return;
    }

    let active = true;
    const load = async () => {
      setLoading(true);
      try {
        const sections = await listProfessorSections(supabase);
        if (!active) return;
        setSection(sections.find((item) => item.id === resolvedSectionId) ?? null);
      } catch {
        if (!active) return;
        setSection(null);
      } finally {
        if (active) setLoading(false);
      }
    };

    void load();
    return () => {
      active = false;
    };
  }, [isProfessor, resolvedSectionId, supabase]);

  const questionCount = questions.length;
  const modeLabel = useMemo(() => (mode === "quiz" ? "Quiz" : mode === "exam" ? "Exam" : "Homework"), [mode]);
  const titlePlaceholder = `${modeLabel} 1`;
  const saveLabel = `Save ${modeLabel.toLowerCase()} set`;

  if (!isProfessor) {
    return (
      <Card>
        <CardBody className="space-y-3 p-8 text-center">
          <h1 className="font-display text-3xl font-semibold">Professor Access Required</h1>
          <p className="text-sm text-muted">Only professor accounts can create section quiz sets.</p>
        </CardBody>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardBody className="p-8 text-sm text-muted">Loading quiz builder…</CardBody>
      </Card>
    );
  }

  if (!section) {
    return (
      <Card>
        <CardBody className="space-y-3 p-8 text-center">
          <h1 className="font-display text-3xl font-semibold">Section Not Found</h1>
          <p className="text-sm text-muted">This section is unavailable or you do not have access.</p>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-2">
          <Link href={`/app/sections/${resolvedSectionId}`} className="inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-text">
            <ArrowLeft className="h-4 w-4" />
            Back to section
          </Link>
          <h1 className="font-display text-4xl font-semibold tracking-tight">Professor {modeLabel} Builder</h1>
          <p className="text-sm text-muted">
            {section.name} • {section.course_id}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => setPreviewMode((prev) => !prev)}>
            {previewMode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {previewMode ? "Back to editor" : `Preview ${modeLabel.toLowerCase()}`}
          </Button>
          <Button
            loading={saving}
            onClick={async () => {
              if (!supabase) return;
              if (!title.trim()) {
                push({ title: `${modeLabel} title is required`, tone: "error" });
                return;
              }

              const parsedMinutes = Number(estMinutes || "0");
              if (!Number.isFinite(parsedMinutes) || parsedMinutes < 1 || parsedMinutes > 240) {
                push({ title: "Estimated minutes must be between 1 and 240", tone: "error" });
                return;
              }

              if (questions.length === 0) {
                push({ title: "Add at least one question", tone: "error" });
                return;
              }

              for (let index = 0; index < questions.length; index += 1) {
                const question = questions[index];
                const prefix = `Question ${index + 1}`;
                if (!question.prompt.trim()) {
                  push({ title: `${prefix} prompt is required`, tone: "error" });
                  return;
                }

                if (question.type === "single" || question.type === "multi") {
                  const validOptions = question.options.map((value) => value.trim()).filter((value) => value.length > 0);
                  if (validOptions.length < 2) {
                    push({ title: `${prefix} needs at least 2 options`, tone: "error" });
                    return;
                  }

                  if (question.correctIndexes.length === 0) {
                    push({ title: `${prefix} needs at least one correct answer`, tone: "error" });
                    return;
                  }

                  if (question.type === "single" && question.correctIndexes.length !== 1) {
                    push({ title: `${prefix} must have exactly one correct answer`, tone: "error" });
                    return;
                  }
                }

                if (question.type === "fill") {
                  const answers = question.acceptableAnswers.map((value) => value.trim()).filter((value) => value.length > 0);
                  if (answers.length === 0) {
                    push({ title: `${prefix} needs at least one acceptable answer`, tone: "error" });
                    return;
                  }
                }
              }

              const payload: CreateProfessorQuizSetPayload = {
                sectionId: resolvedSectionId,
                title: title.trim(),
                description: description.trim(),
                difficulty,
                estMinutes: parsedMinutes,
                mode,
                tags: normalizeTags(tags),
                questions: questions.map((question) => ({
                  type: question.type,
                  prompt: question.prompt.trim(),
                  options: question.options.map((value) => value.trim()).filter((value) => value.length > 0),
                  correctIndexes: question.correctIndexes,
                  acceptableAnswers: question.acceptableAnswers
                    .map((value) => value.trim().toLowerCase())
                    .filter((value) => value.length > 0),
                  explanation: question.explanation.trim(),
                  tags: normalizeTags(question.tags)
                }))
              };

              setSaving(true);
              try {
                const quizSetId = await createProfessorQuizSet(supabase, payload);
                push({
                  title: `${modeLabel} set created`,
                  description:
                    mode === "exam"
                      ? "It is now available in this section's exam tools."
                      : "It is now available in this section's assignment tools.",
                  tone: "success"
                });
                router.push(
                  mode === "exam"
                    ? `/app/professor/sections/${resolvedSectionId}/exams?newQuizSet=${quizSetId}`
                    : `/app/sections/${resolvedSectionId}?newQuizSet=${quizSetId}`
                );
              } catch (error) {
                push({ title: "Unable to create quiz set", description: (error as Error).message, tone: "error" });
              } finally {
                setSaving(false);
              }
            }}
          >
            {saveLabel}
          </Button>
        </div>
      </section>

      <Card>
        <CardHeader>
          <h2 className="font-display text-2xl font-semibold">{modeLabel} Set Details</h2>
        </CardHeader>
        <CardBody className="grid gap-3 md:grid-cols-2">
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">{modeLabel} title</label>
            <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder={titlePlaceholder} />
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Description</label>
            <Input value={description} onChange={(event) => setDescription(event.target.value)} placeholder="What this set covers." />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Mode</label>
            <select
              aria-label="Mode"
              className="h-11 w-full rounded-[10px] border border-borderc bg-soft px-3 text-sm text-text"
              value={mode}
              onChange={(event) => {
                const nextMode = event.target.value as typeof mode;
                const nextModeLabel =
                  nextMode === "quiz" ? "Quiz" : nextMode === "exam" ? "Exam" : "Homework";
                const currentDefaultTitle = `${modeLabel} 1`;
                setMode(nextMode);
                setTitle((current) => {
                  const trimmed = current.trim();
                  if (trimmed === "" || trimmed === currentDefaultTitle) {
                    return `${nextModeLabel} 1`;
                  }
                  return current;
                });
              }}
            >
              <option value="quiz">Quiz</option>
              <option value="homework">Homework</option>
              <option value="exam">Exam</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Difficulty</label>
            <select
              aria-label="Difficulty"
              className="h-11 w-full rounded-[10px] border border-borderc bg-soft px-3 text-sm text-text"
              value={difficulty}
              onChange={(event) => setDifficulty(event.target.value as typeof difficulty)}
            >
              <option value="intro">Intro</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Estimated minutes</label>
            <Input value={estMinutes} onChange={(event) => setEstMinutes(event.target.value.replace(/[^0-9]/g, ""))} placeholder="20" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Quiz tags</label>
            <Input value={tags} onChange={(event) => setTags(event.target.value)} placeholder="limits, derivatives, review" />
          </div>
          <div className="md:col-span-2 rounded-xl border border-borderc bg-surface px-3 py-2 text-xs text-muted">
            {modeLabel} • {questionCount} question{questionCount === 1 ? "" : "s"}
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="font-display text-2xl font-semibold">Quick Paste Import</h2>
        </CardHeader>
        <CardBody className="space-y-3">
          <p className="text-sm text-muted">
            Paste questions from ChatGPT or notes using blocks like <code>-mc</code>, <code>-sata</code>, <code>-fib</code>, <code>-frq</code>.
            Use <code>--</code> for the prompt and prefix correct options with <code>[x]</code>, <code>*</code>, or <code>+</code>.
          </p>
          <textarea
            aria-label="Paste questions to import"
            value={bulkInput}
            onChange={(event) => setBulkInput(event.target.value)}
            className="min-h-48 w-full rounded-[10px] border border-borderc bg-soft px-3 py-2 font-mono text-sm text-text outline-none focus-visible:ring-2 focus-visible:ring-accent/55"
            placeholder={`-mc
-- Which protocol is stateless?
- [x] HTTP
- TCP
- FTP

-sata
-- Select all prime numbers:
- [x] 2
- [x] 3
- 4

-fib
-- Derivative of x^2
- answer: 2x | 2*x

-frq
-- Explain why normalization reduces redundancy.`}
          />
          {bulkErrors.length > 0 ? (
            <div className="rounded-xl border border-danger/45 bg-danger/10 p-3 text-sm text-danger">
              <p className="font-semibold">Import errors</p>
              <ul className="mt-1 list-disc pl-5">
                {bulkErrors.map((error) => (
                  <li key={error}>{error}</li>
                ))}
              </ul>
            </div>
          ) : null}
          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                const parsed = parseImportedQuestions(bulkInput);
                if (parsed.errors.length > 0) {
                  setBulkErrors(parsed.errors);
                  push({ title: "Could not import questions", description: "Fix formatting errors and try again.", tone: "error" });
                  return;
                }

                setQuestions((prev) => {
                  const base = prev.length === 1 && isBlankQuestion(prev[0]) ? [] : prev;
                  return [...base, ...parsed.questions];
                });
                setBulkErrors([]);
                push({ title: `${parsed.questions.length} question${parsed.questions.length === 1 ? "" : "s"} imported`, tone: "success" });
              }}
            >
              Parse and append
            </Button>
            <Button variant="ghost" onClick={() => setBulkInput("")}>
              Clear pasted text
            </Button>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <h2 className="font-display text-2xl font-semibold">Questions</h2>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => setQuestions((prev) => [...prev, makeQuestion("single")])}>
              <Plus className="h-4 w-4" />
              Add multiple choice
            </Button>
            <Button variant="secondary" onClick={() => setQuestions((prev) => [...prev, makeQuestion("multi")])}>
              <Plus className="h-4 w-4" />
              Add multiple answer
            </Button>
            <Button variant="secondary" onClick={() => setQuestions((prev) => [...prev, makeQuestion("fill")])}>
              <Plus className="h-4 w-4" />
              Add short response
            </Button>
            <Button variant="secondary" onClick={() => setQuestions((prev) => [...prev, makeQuestion("free")])}>
              <Plus className="h-4 w-4" />
              Add free response
            </Button>
          </div>
        </CardHeader>
        <CardBody className="space-y-4">
          {questions.map((question, index) => {
            const isSingle = question.type === "single";
            const isMulti = question.type === "multi";
            const isFill = question.type === "fill";
            const isFree = question.type === "free";
            const supportsOptions = isSingle || isMulti;

            return (
              <div key={question.id} className="space-y-3 rounded-xl border border-borderc bg-soft p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Badge tone="brand">Q{index + 1}</Badge>
                    <Badge>{question.type}</Badge>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="ghost"
                      onClick={() => {
                        if (index === 0) return;
                        setQuestions((prev) => {
                          const next = [...prev];
                          const [moved] = next.splice(index, 1);
                          next.splice(index - 1, 0, moved);
                          return next;
                        });
                      }}
                      disabled={index === 0}
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        if (index === questions.length - 1) return;
                        setQuestions((prev) => {
                          const next = [...prev];
                          const [moved] = next.splice(index, 1);
                          next.splice(index + 1, 0, moved);
                          return next;
                        });
                      }}
                      disabled={index === questions.length - 1}
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() =>
                        setQuestions((prev) => {
                          const next = [...prev];
                          next.splice(index + 1, 0, { ...question, id: crypto.randomUUID() });
                          return next;
                        })
                      }
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      className="text-danger hover:text-danger"
                      onClick={() =>
                        setQuestions((prev) => {
                          if (prev.length <= 1) return prev;
                          return prev.filter((item) => item.id !== question.id);
                        })
                      }
                      disabled={questions.length <= 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Question type</label>
                    <select
                      aria-label="Question type"
                      className="h-11 w-full rounded-[10px] border border-borderc bg-surface px-3 text-sm text-text"
                      value={question.type}
                      onChange={(event) =>
                        setQuestions((prev) =>
                          prev.map((entry) =>
                            entry.id === question.id
                              ? {
                                  ...entry,
                                  type: event.target.value as BuilderQuestionType,
                                  correctIndexes: event.target.value === "single" ? [0] : [],
                                  acceptableAnswers: event.target.value === "fill" ? [""] : entry.acceptableAnswers
                                }
                              : entry
                          )
                        )
                      }
                    >
                      <option value="single">Multiple choice</option>
                      <option value="multi">Multiple answer</option>
                      <option value="fill">Short response</option>
                      <option value="free">Free response</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Question tags</label>
                    <Input
                      value={question.tags}
                      onChange={(event) =>
                        setQuestions((prev) =>
                          prev.map((entry) => (entry.id === question.id ? { ...entry, tags: event.target.value } : entry))
                        )
                      }
                      placeholder="algebra, limits"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Prompt</label>
                  <textarea
                    aria-label="Question prompt"
                    value={question.prompt}
                    onChange={(event) =>
                      setQuestions((prev) =>
                        prev.map((entry) => (entry.id === question.id ? { ...entry, prompt: event.target.value } : entry))
                      )
                    }
                    className="min-h-24 w-full rounded-[10px] border border-borderc bg-surface px-3 py-2 text-sm text-text outline-none focus-visible:ring-2 focus-visible:ring-accent/55"
                    placeholder="Type the full question prompt."
                  />
                </div>

                {supportsOptions ? (
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Options + correct answer</label>
                    {question.options.map((option, optionIndex) => {
                      const selected = question.correctIndexes.includes(optionIndex);
                      return (
                        <div key={`${question.id}-option-${optionIndex}`} className="flex items-center gap-2">
                          <input
                            type={isSingle ? "radio" : "checkbox"}
                            aria-label={`Mark option ${optionIndex + 1} as correct`}
                            checked={selected}
                            onChange={(event) =>
                              setQuestions((prev) =>
                                prev.map((entry) => {
                                  if (entry.id !== question.id) return entry;
                                  if (isSingle) {
                                    return { ...entry, correctIndexes: event.target.checked ? [optionIndex] : [] };
                                  }
                                  const nextCorrect = event.target.checked
                                    ? [...entry.correctIndexes, optionIndex]
                                    : entry.correctIndexes.filter((idx) => idx !== optionIndex);
                                  return { ...entry, correctIndexes: nextCorrect };
                                })
                              )
                            }
                          />
                          <Input
                            value={option}
                            onChange={(event) =>
                              setQuestions((prev) =>
                                prev.map((entry) => {
                                  if (entry.id !== question.id) return entry;
                                  const next = [...entry.options];
                                  next[optionIndex] = event.target.value;
                                  return { ...entry, options: next };
                                })
                              )
                            }
                            placeholder={`Option ${optionIndex + 1}`}
                          />
                          <Button
                            variant="ghost"
                            onClick={() =>
                              setQuestions((prev) =>
                                prev.map((entry) => {
                                  if (entry.id !== question.id) return entry;
                                  if (entry.options.length <= 2) return entry;
                                  const nextOptions = entry.options.filter((_, idx) => idx !== optionIndex);
                                  const nextCorrect = entry.correctIndexes
                                    .filter((idx) => idx !== optionIndex)
                                    .map((idx) => (idx > optionIndex ? idx - 1 : idx));
                                  return { ...entry, options: nextOptions, correctIndexes: nextCorrect };
                                })
                              )
                            }
                            disabled={question.options.length <= 2}
                          >
                            Remove
                          </Button>
                        </div>
                      );
                    })}
                    <Button
                      variant="secondary"
                      onClick={() =>
                        setQuestions((prev) =>
                          prev.map((entry) => (entry.id === question.id ? { ...entry, options: [...entry.options, ""] } : entry))
                        )
                      }
                    >
                      <Plus className="h-4 w-4" />
                      Add option
                    </Button>
                  </div>
                ) : null}

                {isFill ? (
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Acceptable answers</label>
                    {question.acceptableAnswers.map((answer, answerIndex) => (
                      <div key={`${question.id}-answer-${answerIndex}`} className="flex items-center gap-2">
                        <Input
                          value={answer}
                          onChange={(event) =>
                            setQuestions((prev) =>
                              prev.map((entry) => {
                                if (entry.id !== question.id) return entry;
                                const next = [...entry.acceptableAnswers];
                                next[answerIndex] = event.target.value;
                                return { ...entry, acceptableAnswers: next };
                              })
                            )
                          }
                          placeholder="Expected short answer"
                        />
                        <Button
                          variant="ghost"
                          onClick={() =>
                            setQuestions((prev) =>
                              prev.map((entry) => {
                                if (entry.id !== question.id) return entry;
                                if (entry.acceptableAnswers.length <= 1) return entry;
                                return {
                                  ...entry,
                                  acceptableAnswers: entry.acceptableAnswers.filter((_, idx) => idx !== answerIndex)
                                };
                              })
                            )
                          }
                          disabled={question.acceptableAnswers.length <= 1}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="secondary"
                      onClick={() =>
                        setQuestions((prev) =>
                          prev.map((entry) =>
                            entry.id === question.id
                              ? { ...entry, acceptableAnswers: [...entry.acceptableAnswers, ""] }
                              : entry
                          )
                        )
                      }
                    >
                      <Plus className="h-4 w-4" />
                      Add acceptable answer
                    </Button>
                  </div>
                ) : null}

                {isFree ? (
                  <p className="rounded-lg border border-borderc bg-surface px-3 py-2 text-xs text-muted">
                    Free response questions are submitted for manual review/self-check in student mode.
                  </p>
                ) : null}

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Explanation (optional)</label>
                  <textarea
                    aria-label="Explanation (optional)"
                    value={question.explanation}
                    onChange={(event) =>
                      setQuestions((prev) =>
                        prev.map((entry) => (entry.id === question.id ? { ...entry, explanation: event.target.value } : entry))
                      )
                    }
                    className="min-h-16 w-full rounded-[10px] border border-borderc bg-surface px-3 py-2 text-sm text-text outline-none focus-visible:ring-2 focus-visible:ring-accent/55"
                    placeholder="Shown after submit."
                  />
                </div>
              </div>
            );
          })}
        </CardBody>
      </Card>

      {previewMode ? (
        <Card>
          <CardHeader>
            <h2 className="font-display text-2xl font-semibold">Student Preview</h2>
          </CardHeader>
          <CardBody className="space-y-4">
            {questions.map((question, index) => (
              <div key={`preview-${question.id}`} className="space-y-3 rounded-xl border border-borderc bg-soft p-4">
                <div className="flex items-center gap-2">
                  <Badge tone="brand">Question {index + 1}</Badge>
                  <Badge>{question.type}</Badge>
                </div>
                <p className="text-sm text-text">{question.prompt || "Untitled question prompt..."}</p>

                {question.type === "single" || question.type === "multi" ? (
                  <div className="space-y-2">
                    {question.options.map((option, optionIndex) => (
                      <label key={`preview-option-${question.id}-${optionIndex}`} className="flex items-center gap-2 rounded-lg border border-borderc bg-surface px-3 py-2 text-sm text-text">
                        <input type={question.type === "single" ? "radio" : "checkbox"} disabled />
                        <span>{option || `Option ${optionIndex + 1}`}</span>
                      </label>
                    ))}
                  </div>
                ) : question.type === "fill" ? (
                  <Input value="" readOnly placeholder="Student enters a short response…" />
                ) : (
                  <textarea
                    readOnly
                    aria-hidden
                    tabIndex={-1}
                    value=""
                    placeholder="Student enters a full free-response solution…"
                    className="min-h-24 w-full rounded-[10px] border border-borderc bg-surface px-3 py-2 text-sm text-text"
                  />
                )}
              </div>
            ))}
          </CardBody>
        </Card>
      ) : null}
    </div>
  );
}
