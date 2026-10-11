import Link from "next/link";
import { ArrowLeft, ArrowRight, BookOpenText, Clock3, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { databaseExam2QuizSets } from "@/data/seed/db-exam2";
import { modeLabel, resolveQuizSetMode } from "@/lib/study/set-mode";
import type { QuizSet } from "@/lib/types";

function setHref(set: QuizSet, routePrefix: string) {
  const mode = resolveQuizSetMode(set);
  return mode === "homework"
    ? `${routePrefix}/homework/${set.id}`
    : `${routePrefix}/quiz/${set.id}?mode=${mode === "exam" ? "exam" : "study"}`;
}

export function ExamTwoPage({ routePrefix }: { routePrefix: string }) {
  const review = databaseExam2QuizSets.find((set) => set.id === "db-exam2-complete-review");
  const practiceSets = databaseExam2QuizSets.filter(
    (set) => resolveQuizSetMode(set) !== "exam" && set.id !== review?.id
  );
  const mocks = databaseExam2QuizSets.filter((set) => resolveQuizSetMode(set) === "exam");

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <header className="space-y-3">
        <Link
          href={`${routePrefix}/courses/database-systems`}
          className="inline-flex items-center gap-1.5 text-body-sm text-muted transition hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-2/60"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
          Concepts of Database Systems
        </Link>
        <div className="flex flex-wrap gap-2">
          <Badge tone="accent">Exam 2 preparation</Badge>
          <Badge>MySQL</Badge>
        </div>
        <h1 className="font-display text-display-md text-text">MySQL Exam 2 preparation</h1>
        <p className="max-w-3xl text-body-sm leading-relaxed text-muted">
          Practice SQL from Lectures 7–9, the class activity and Homework 2, then build up to
          multi-table queries from Lecture 10. Schema and constraint problems connect the SQL
          to the earlier course material.
        </p>
      </header>

      <section aria-labelledby="exam-2-practice" className="space-y-4">
        <div className="space-y-1">
          <h2 id="exam-2-practice" className="font-display text-xl font-semibold text-text">
            1. Work through the material
          </h2>
          <p className="text-body-sm text-muted">
            Start with the focused sets. Each problem includes source references and a model
            answer to self-mark against, including equivalent valid MySQL solutions.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {practiceSets.map((set) => (
            <Card key={set.id}>
              <CardBody className="flex h-full flex-col gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge>{modeLabel(resolveQuizSetMode(set))}</Badge>
                  <span className="text-xs text-muted">{set.questions.length} prompts · No timer</span>
                </div>
                <h3 className="font-display text-lg font-semibold text-text">{set.title}</h3>
                <p className="flex-1 text-body-sm leading-relaxed text-muted">{set.description}</p>
                <Button asChild variant="secondary" className="w-full sm:w-auto sm:self-start">
                  <Link href={setHref(set, routePrefix)}>
                    Practice <ArrowRight className="h-4 w-4" aria-hidden />
                  </Link>
                </Button>
              </CardBody>
            </Card>
          ))}
        </div>

        {review ? (
          <Card className="border-accent/30 bg-accent/5">
            <CardBody className="space-y-3">
              <p className="inline-flex items-center gap-2 text-xs font-semibold text-accent">
                <BookOpenText className="h-4 w-4" aria-hidden />
                Complete coverage · No timer
              </p>
              <h3 className="font-display text-lg font-semibold text-text">{review.title}</h3>
              <p className="text-body-sm leading-relaxed text-muted">{review.description}</p>
              <Button asChild variant="secondary" className="w-full sm:w-auto">
                <Link href={setHref(review, routePrefix)}>
                  Open all {review.questions.length} prompts <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </Button>
            </CardBody>
          </Card>
        ) : null}
      </section>

      <section aria-labelledby="exam-2-mocks" className="space-y-4">
        <div className="space-y-2">
          <h2 id="exam-2-mocks" className="font-display text-xl font-semibold text-text">
            2. Choose a written mock
          </h2>
          <p className="text-body-sm leading-relaxed text-muted">
            Both papers include mandatory Q1 and Q2. Choose the query option (Q3) or the
            debugging option (Q4) before starting the timer: each paper has three questions,
            five marks each, and 70 minutes. Answers stay hidden until you finish, then you
            self-mark against the model answers and rubric.
          </p>
          <p className="rounded-xl border border-borderc bg-soft p-3 text-xs leading-relaxed text-muted">
            This practice format follows the Exam 1 paper. The Exam 2 format and questions
            have not been confirmed; these mocks do not predict the actual paper.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {mocks.map((set) => (
            <Card key={set.id}>
              <CardBody className="flex h-full flex-col gap-3">
                <p className="inline-flex items-center gap-2 text-xs font-semibold text-accent">
                  <FileText className="h-4 w-4" aria-hidden />
                  Written mock
                </p>
                <h3 className="font-display text-lg font-semibold text-text">{set.title}</h3>
                <p className="flex-1 text-body-sm leading-relaxed text-muted">{set.description}</p>
                <p className="inline-flex flex-wrap items-center gap-1.5 text-xs text-muted">
                  <Clock3 className="h-3.5 w-3.5" aria-hidden />
                  {set.timerDefaultMinutes} minutes · {set.questions.length} questions ·{" "}
                  {set.questions.reduce((marks, question) => marks + (question.points ?? 1), 0)} marks
                </p>
                <Button asChild className="w-full sm:w-auto sm:self-start">
                  <Link href={setHref(set, routePrefix)}>
                    {set.id === "db-exam2-mock-query-choice" ? "Choose query option" : "Choose debugging option"}
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </Link>
                </Button>
              </CardBody>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
